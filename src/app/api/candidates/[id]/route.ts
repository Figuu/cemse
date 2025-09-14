import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: candidateId } = await params;
    const candidate = await prisma.user.findUnique({
      where: { 
        id: candidateId,
        role: "YOUTH", // Only get youth users
        isActive: true,
      },
      include: {
        profile: {
          select: {
            firstName: true,
            lastName: true,
            avatarUrl: true,
            phone: true,
            address: true,
            birthDate: true,
            gender: true,
            // Additional fields that would be needed for candidate profiles:
            // education: true,
            // skills: true,
            // languages: true,
            // experience: true,
            // salaryExpectations: true,
            // workArrangementPreferences: true,
            // availability: true,
            // portfolio: true,
            // linkedinProfile: true,
            // githubProfile: true,
          },
        },
        jobApplications: {
          include: {
            job: {
              select: {
                id: true,
                title: true,
                company: {
                  select: {
                    id: true,
                    name: true,
                    logo: true,
                  },
                },
                status: true,
                appliedAt: true,
              },
            },
          },
          orderBy: { appliedAt: "desc" },
          take: 10,
        },
        _count: {
          select: {
            jobApplications: true,
          },
        },
      },
    });

    if (!candidate) {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 }
      );
    }

    // Calculate candidate statistics
    const totalApplications = candidate.jobApplications.length;
    const recentApplications = candidate.jobApplications.filter(
      app => new Date(app.appliedAt).getTime() > Date.now() - (30 * 24 * 60 * 60 * 1000) // Last 30 days
    ).length;

    // Calculate experience level based on profile data
    // This would be more sophisticated in a real implementation
    const experienceLevel = "ENTRY_LEVEL"; // Default for now

    // Calculate availability status
    // This would be based on actual availability data in a real implementation
    const availability = "FLEXIBLE"; // Default for now

    // Calculate skills (would come from profile data in real implementation)
    const skills: string[] = []; // Would be populated from profile.skills

    // Calculate languages (would come from profile data in real implementation)
    const languages: string[] = []; // Would be populated from profile.languages

    // Calculate salary expectations (would come from profile data in real implementation)
    const salaryExpectations = {
      min: null as number | null,
      max: null as number | null,
      currency: "USD",
    };

    // Calculate work arrangement preferences (would come from profile data in real implementation)
    const workArrangementPreferences = {
      office: true,
      remote: false,
      hybrid: true,
    };

    const candidateProfile = {
      ...candidate,
      experienceLevel,
      availability,
      skills,
      languages,
      salaryExpectations,
      workArrangementPreferences,
      statistics: {
        totalApplications,
        recentApplications,
        applicationRate: totalApplications > 0 ? (recentApplications / totalApplications) * 100 : 0,
      },
    };

    return NextResponse.json(candidateProfile);
  } catch (error) {
    console.error("Error fetching candidate:", error);
    return NextResponse.json(
      { error: "Failed to fetch candidate" },
      { status: 500 }
    );
  }
}
