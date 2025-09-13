import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only YOUTH role can get job recommendations
    if (session.user.role !== "YOUTH") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const includeApplied = searchParams.get("includeApplied") === "true";

    // Get user profile for recommendation analysis
    const userProfile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: {
        skills: true,
        address: true,
        experienceLevel: true,
        educationLevel: true,
        jobTitle: true,
        industry: true,
        salaryExpectation: true,
        workModality: true,
        contractType: true,
      },
    });

    if (!userProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Get user's application history to avoid recommending already applied jobs
    const appliedJobIds = includeApplied ? [] : await prisma.jobApplication.findMany({
      where: { applicantId: session.user.id },
      select: { jobOfferId: true },
    }).then(apps => apps.map(app => app.jobOfferId));

    // Build recommendation query
    const recommendations = await getJobRecommendations(userProfile, appliedJobIds, limit);

    return NextResponse.json({
      success: true,
      recommendations,
      profile: {
        skills: userProfile.skills,
        experienceLevel: userProfile.experienceLevel,
        educationLevel: userProfile.educationLevel,
        location: userProfile.address,
      },
    });

  } catch (error) {
    console.error("Error fetching job recommendations:", error);
    return NextResponse.json(
      { error: "Failed to fetch job recommendations" },
      { status: 500 }
    );
  }
}

async function getJobRecommendations(
  userProfile: any,
  appliedJobIds: string[],
  limit: number
) {
  const userSkills = (userProfile.skills as string[]) || [];
  const userLocation = userProfile.address || "";
  const userExperience = userProfile.experienceLevel || "NO_EXPERIENCE";
  const userEducation = userProfile.educationLevel || "HIGH_SCHOOL";
  const userIndustry = userProfile.industry || "";
  const userSalaryExpectation = userProfile.salaryExpectation || 0;
  const userWorkModality = userProfile.workModality || "HYBRID";
  const userContractType = userProfile.contractType || "FULL_TIME";

  // Get all active jobs
  const allJobs = await prisma.jobOffer.findMany({
    where: {
      isActive: true,
      ...(appliedJobIds.length > 0 && {
        id: { notIn: appliedJobIds }
      }),
    },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          logoUrl: true,
          address: true,
          website: true,
        },
      },
    },
  });

  // Calculate recommendation scores for each job
  const jobsWithScores = allJobs.map(job => {
    let score = 0;
    const reasons: string[] = [];

    // Skill matching (40% weight)
    const jobSkills = (job.skillsRequired as string[]) || [];
    const skillMatches = userSkills.filter(skill => 
      jobSkills.some(jobSkill => 
        jobSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(jobSkill.toLowerCase())
      )
    ).length;
    
    if (skillMatches > 0) {
      const skillScore = (skillMatches / Math.max(jobSkills.length, 1)) * 40;
      score += skillScore;
      reasons.push(`${skillMatches} habilidades coinciden`);
    }

    // Experience level matching (20% weight)
    const experienceScore = calculateExperienceScore(userExperience, job.experienceLevel);
    score += experienceScore * 20;
    if (experienceScore > 0.7) {
      reasons.push("Nivel de experiencia ideal");
    }

    // Education level matching (15% weight)
    const educationScore = calculateEducationScore(userEducation, job.educationLevel);
    score += educationScore * 15;
    if (educationScore > 0.7) {
      reasons.push("Nivel educativo requerido");
    }

    // Location matching (10% weight)
    const locationScore = calculateLocationScore(userLocation, job.location);
    score += locationScore * 10;
    if (locationScore > 0.5) {
      reasons.push("Ubicación compatible");
    }

    // Industry matching (5% weight)
    if (userIndustry && job.company.name.toLowerCase().includes(userIndustry.toLowerCase())) {
      score += 5;
      reasons.push("Industria de interés");
    }

    // Work modality matching (5% weight)
    const modalityScore = calculateModalityScore(userWorkModality, job.workModality);
    score += modalityScore * 5;
    if (modalityScore > 0.7) {
      reasons.push("Modalidad de trabajo preferida");
    }

    // Contract type matching (3% weight)
    const contractScore = calculateContractScore(userContractType, job.contractType);
    score += contractScore * 3;
    if (contractScore > 0.7) {
      reasons.push("Tipo de contrato preferido");
    }

    // Salary expectation matching (2% weight)
    if (userSalaryExpectation > 0 && job.salaryMin && job.salaryMax) {
      const salaryScore = calculateSalaryScore(userSalaryExpectation, job.salaryMin, job.salaryMax);
      score += salaryScore * 2;
      if (salaryScore > 0.7) {
        reasons.push("Expectativa salarial compatible");
      }
    }

    // Recency bonus (newer jobs get slight boost)
    const daysSincePosted = Math.floor((new Date().getTime() - job.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSincePosted <= 7) {
      score += 2;
      reasons.push("Oferta reciente");
    }

    return {
      job,
      score: Math.min(score, 100), // Cap at 100
      reasons: reasons.slice(0, 3), // Limit to top 3 reasons
      matchPercentage: Math.round(score),
    };
  });

  // Sort by score and return top recommendations
  return jobsWithScores
    .filter(item => item.score > 20) // Only jobs with meaningful match
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => ({
      id: item.job.id,
      title: item.job.title,
      company: {
        name: item.job.company.name,
        logo: item.job.company.logoUrl,
        location: item.job.company.address,
        website: item.job.company.website,
      },
      location: item.job.location,
      type: item.job.contractType,
      salary: item.job.salaryMin && item.job.salaryMax ? {
        min: Number(item.job.salaryMin),
        max: Number(item.job.salaryMax),
        currency: item.job.salaryCurrency || "BOB",
      } : undefined,
      description: item.job.description,
      requirements: (item.job.requirements as string[]) || [],
      benefits: (item.job.benefits as string[]) || [],
      postedAt: item.job.createdAt,
      deadline: item.job.deadline,
      experience: item.job.experienceLevel,
      education: item.job.educationLevel,
      skills: (item.job.skillsRequired as string[]) || [],
      remote: item.job.workModality === "REMOTE",
      urgent: item.job.urgent || false,
      matchPercentage: item.matchPercentage,
      reasons: item.reasons,
      score: item.score,
    }));
}

// Helper functions for scoring
function calculateExperienceScore(userExperience: string, jobExperience: string): number {
  const experienceLevels = {
    "NO_EXPERIENCE": 0,
    "ENTRY_LEVEL": 1,
    "MID_LEVEL": 2,
    "SENIOR_LEVEL": 3,
  };

  const userLevel = experienceLevels[userExperience as keyof typeof experienceLevels] || 0;
  const jobLevel = experienceLevels[jobExperience as keyof typeof experienceLevels] || 0;

  // Perfect match
  if (userLevel === jobLevel) return 1.0;
  
  // User has more experience than required (good)
  if (userLevel > jobLevel) return 0.8;
  
  // User has less experience (partial match based on gap)
  const gap = jobLevel - userLevel;
  return Math.max(0.3, 1.0 - (gap * 0.3));
}

function calculateEducationScore(userEducation: string, jobEducation: string): number {
  const educationLevels = {
    "HIGH_SCHOOL": 0,
    "TECHNICAL": 1,
    "BACHELOR": 2,
    "MASTER": 3,
    "PHD": 4,
  };

  const userLevel = educationLevels[userEducation as keyof typeof educationLevels] || 0;
  const jobLevel = educationLevels[jobEducation as keyof typeof educationLevels] || 0;

  // Perfect match
  if (userLevel === jobLevel) return 1.0;
  
  // User has more education than required (good)
  if (userLevel > jobLevel) return 0.9;
  
  // User has less education (partial match based on gap)
  const gap = jobLevel - userLevel;
  return Math.max(0.2, 1.0 - (gap * 0.4));
}

function calculateLocationScore(userLocation: string, jobLocation: string): number {
  if (!userLocation || !jobLocation) return 0.5;

  const userCity = userLocation.split(',')[0].toLowerCase().trim();
  const jobCity = jobLocation.split(',')[0].toLowerCase().trim();

  // Exact match
  if (userCity === jobCity) return 1.0;
  
  // Partial match (same country or region)
  const userParts = userLocation.toLowerCase().split(',');
  const jobParts = jobLocation.toLowerCase().split(',');
  
  for (const userPart of userParts) {
    for (const jobPart of jobParts) {
      if (userPart.trim() === jobPart.trim() && userPart.trim().length > 2) {
        return 0.7;
      }
    }
  }

  // Remote work bonus
  if (jobLocation.toLowerCase().includes('remote') || jobLocation.toLowerCase().includes('remoto')) {
    return 0.8;
  }

  return 0.3; // Default low score for different locations
}

function calculateModalityScore(userModality: string, jobModality: string): number {
  if (userModality === jobModality) return 1.0;
  
  // Hybrid is flexible
  if (userModality === "HYBRID" || jobModality === "HYBRID") return 0.7;
  
  return 0.3;
}

function calculateContractScore(userContract: string, jobContract: string): number {
  if (userContract === jobContract) return 1.0;
  
  // Full-time is generally preferred over part-time
  if (userContract === "FULL_TIME" && jobContract === "PART_TIME") return 0.6;
  if (userContract === "PART_TIME" && jobContract === "FULL_TIME") return 0.8;
  
  return 0.5;
}

function calculateSalaryScore(userExpectation: number, jobMin: number, jobMax: number): number {
  const jobAverage = (jobMin + jobMax) / 2;
  
  // User expectation within range
  if (userExpectation >= jobMin && userExpectation <= jobMax) return 1.0;
  
  // User expectation below range (might be acceptable)
  if (userExpectation < jobMin) {
    const gap = (jobMin - userExpectation) / jobMin;
    return Math.max(0.3, 1.0 - gap);
  }
  
  // User expectation above range (might be negotiable)
  if (userExpectation > jobMax) {
    const gap = (userExpectation - jobMax) / jobMax;
    return Math.max(0.2, 1.0 - (gap * 0.5));
  }
  
  return 0.5;
}
