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

    // Get user's profile with all relations
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          }
        },
        institution: true,
        entrepreneurships: true,
        youthApplications: true,
        companyEmployments: {
          include: {
            company: true
          }
        },
        entrepreneurshipPosts: true,
        entrepreneurshipResources: true,
        certificates: {
          include: {
            course: true
          }
        },
        moduleCertificates: {
          include: {
            module: {
              include: {
                course: true
              }
            }
          }
        },
        courseEnrollments: {
          include: {
            course: true
          }
        }
      }
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    const responseData = {
      success: true,
      profile: {
        // Basic profile info
        id: profile.user.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.user.email,
        phone: profile.phone,
        address: profile.address,
        city: profile.city,
        state: profile.state,
        cityState: profile.cityState,
        country: profile.country,
        birthDate: profile.birthDate,
        gender: profile.gender,
        documentType: profile.documentType,
        documentNumber: profile.documentNumber,
        avatarUrl: profile.avatarUrl,
        
        // Professional info
        jobTitle: profile.jobTitle,
        professionalSummary: profile.professionalSummary,
        experienceLevel: profile.experienceLevel,
        targetPosition: profile.targetPosition,
        targetCompany: profile.targetCompany,
        
        // Education info
        educationLevel: profile.educationLevel,
        currentInstitution: profile.currentInstitution,
        graduationYear: profile.graduationYear,
        isStudying: profile.isStudying,
        currentDegree: profile.currentDegree,
        universityName: profile.universityName,
        universityStartDate: profile.universityStartDate,
        universityEndDate: profile.universityEndDate,
        universityStatus: profile.universityStatus,
        gpa: profile.gpa,
        
        // Skills and interests
        skills: profile.skills,
        skillsWithLevel: profile.skillsWithLevel,
        languages: profile.languages,
        relevantSkills: profile.relevantSkills,
        interests: profile.interests,
        
        // Experience and activities
        workExperience: profile.workExperience,
        educationHistory: profile.educationHistory,
        projects: profile.projects,
        achievements: profile.achievements,
        academicAchievements: profile.academicAchievements,
        extracurricularActivities: profile.extracurricularActivities,
        websites: profile.websites,
        socialLinks: profile.socialLinks,
        
        // Related data
        institution: profile.institution,
        entrepreneurships: profile.entrepreneurships,
        youthApplications: profile.youthApplications,
        companyEmployments: profile.companyEmployments,
        entrepreneurshipPosts: profile.entrepreneurshipPosts,
        entrepreneurshipResources: profile.entrepreneurshipResources,
        certificates: profile.certificates,
        moduleCertificates: profile.moduleCertificates,
        courseEnrollments: profile.courseEnrollments,
        
        // Profile metadata
        profileCompletion: profile.profileCompletion,
        lastLoginAt: profile.lastLoginAt,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
        role: profile.user.role,
      },
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error("Error fetching current user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
