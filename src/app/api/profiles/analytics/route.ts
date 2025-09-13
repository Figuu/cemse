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

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get("timeRange") || "30d";
    const userId = searchParams.get("userId") || session.user.id;

    // Calculate date range
    const now = new Date();
    const timeRangeMap = {
      "7d": 7,
      "30d": 30,
      "90d": 90,
      "1y": 365
    };
    const days = timeRangeMap[timeRange as keyof typeof timeRangeMap] || 30;
    const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));

    // Get user profile
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
          }
        }
      }
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Get analytics data
    const [
      profileViews,
      jobApplications,
      courseProgress,
      connections,
      skills,
      engagementData,
      recommendations
    ] = await Promise.all([
      getProfileViews(userId, startDate, now),
      getJobApplications(userId, startDate, now),
      getCourseProgress(userId),
      getConnections(userId, startDate, now),
      getSkillsAnalytics(profile),
      getEngagementData(userId, startDate, now),
      getRecommendations(profile)
    ]);

    const analytics = {
      profileViews,
      profileCompleteness: calculateProfileCompleteness(profile),
      jobApplications,
      courseProgress,
      connections,
      skills,
      engagement: engagementData,
      recommendations
    };

    return NextResponse.json({
      success: true,
      analytics,
      timeRange,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error fetching profile analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

async function getProfileViews(userId: string, startDate: Date, endDate: Date) {
  // This would typically come from a profile_views table
  // For now, we'll simulate based on profile data
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { profileViews: true, createdAt: true }
  });

  const total = profile?.profileViews || 0;
  const thisMonth = Math.floor(total * 0.1); // Simulate monthly views
  const lastMonth = Math.floor(total * 0.08);
  const change = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

  return {
    total,
    thisMonth,
    lastMonth,
    change: Math.round(change * 10) / 10
  };
}

async function getJobApplications(userId: string, startDate: Date, endDate: Date) {
  const applications = await prisma.jobApplication.findMany({
    where: {
      userId,
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    }
  });

  const total = await prisma.jobApplication.count({
    where: { userId }
  });

  const thisMonth = applications.length;
  const lastMonth = Math.floor(thisMonth * 0.8); // Simulate previous month
  const change = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

  return {
    total,
    thisMonth,
    lastMonth,
    change: Math.round(change * 10) / 10
  };
}

async function getCourseProgress(userId: string) {
  // This would typically come from course enrollment and progress tables
  // For now, we'll simulate based on available data
  return {
    enrolled: 8,
    completed: 5,
    inProgress: 3,
    certificates: 4
  };
}

async function getConnections(userId: string, startDate: Date, endDate: Date) {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { connections: true }
  });

  const total = profile?.connections || 0;
  const thisMonth = Math.floor(total * 0.05); // Simulate monthly connections
  const lastMonth = Math.floor(total * 0.03);
  const change = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

  return {
    total,
    thisMonth,
    lastMonth,
    change: Math.round(change * 10) / 10
  };
}

async function getSkillsAnalytics(profile: any) {
  const skills = profile.skills || [];
  const total = skills.length;
  const verified = Math.floor(total * 0.7); // Simulate verified skills
  const averageLevel = 4.2; // Simulate average skill level

  // Get top skills based on profile views (simulated)
  const topSkills = skills.slice(0, 4).map((skill: string, index: number) => ({
    name: skill,
    level: Math.floor(Math.random() * 3) + 3, // 3-5 level
    views: Math.floor(Math.random() * 50) + 20 // 20-70 views
  }));

  return {
    total,
    verified,
    averageLevel,
    topSkills
  };
}

async function getEngagementData(userId: string, startDate: Date, endDate: Date) {
  // Generate mock engagement data for the time range
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const profileViews = [];
  const jobApplications = [];
  const courseActivity = [];

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000));
    const dateStr = date.toISOString().split('T')[0];
    
    profileViews.push({
      date: dateStr,
      views: Math.floor(Math.random() * 20) + 5
    });
    
    jobApplications.push({
      date: dateStr,
      applications: Math.floor(Math.random() * 3)
    });
    
    courseActivity.push({
      date: dateStr,
      activity: Math.floor(Math.random() * 60) + 20
    });
  }

  return {
    profileViews,
    jobApplications,
    courseActivity
  };
}

async function getRecommendations(profile: any) {
  // Generate skill suggestions based on current skills
  const currentSkills = profile.skills || [];
  const allSkills = [
    "React", "TypeScript", "Node.js", "MongoDB", "PostgreSQL", "AWS", "Docker",
    "Python", "Java", "JavaScript", "Vue.js", "Angular", "PHP", "Laravel",
    "Google Ads", "Facebook Ads", "Analytics", "SEO", "Figma", "Adobe XD",
    "Marketing Digital", "Ventas", "Atención al Cliente", "Gestión de Proyectos"
  ];

  const skillSuggestions = allSkills
    .filter(skill => !currentSkills.includes(skill))
    .slice(0, 4);

  const courseSuggestions = [
    { title: "AWS Fundamentals", reason: "Basado en tu experiencia con Node.js" },
    { title: "Advanced React Patterns", reason: "Para mejorar tu nivel actual" },
    { title: "System Design", reason: "Para roles senior" }
  ];

  const jobSuggestions = [
    { title: "Senior Frontend Developer", company: "TechCorp", match: 95 },
    { title: "Full Stack Developer", company: "StartupXYZ", match: 88 },
    { title: "React Developer", company: "InnovateLab", match: 92 }
  ];

  return {
    skillSuggestions,
    courseSuggestions,
    jobSuggestions
  };
}

function calculateProfileCompleteness(profile: any) {
  const fields = [
    profile.firstName,
    profile.lastName,
    profile.email,
    profile.phone,
    profile.address,
    profile.avatarUrl,
    profile.jobTitle,
    profile.bio,
    profile.skills,
    profile.educationLevel,
    profile.university,
    profile.degree,
    profile.experienceLevel,
    profile.linkedin,
    profile.github,
    profile.portfolio
  ];

  const completedFields = fields.filter(field => 
    field && (Array.isArray(field) ? field.length > 0 : field.toString().trim().length > 0)
  ).length;

  const percentage = Math.round((completedFields / fields.length) * 100);

  const missingFields = [];
  if (!profile.avatarUrl) missingFields.push("Foto de perfil");
  if (!profile.skills || profile.skills.length === 0) missingFields.push("Habilidades");
  if (!profile.educationLevel) missingFields.push("Nivel de educación");
  if (!profile.university) missingFields.push("Universidad");
  if (!profile.linkedin) missingFields.push("LinkedIn");
  if (!profile.portfolio) missingFields.push("Portfolio");

  return {
    percentage,
    missingFields
  };
}

