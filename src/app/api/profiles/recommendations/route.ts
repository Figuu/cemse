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
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "5");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Get current user's profile to generate recommendations
    const currentUser = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: {
        skills: true,
        address: true,
        experienceLevel: true,
        educationLevel: true,
        jobTitle: true,
        industry: true,
      }
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    // Generate recommendations based on different criteria
    const recommendations = await generateRecommendations(currentUser, limit);

    return NextResponse.json({
      success: true,
      recommendations,
    });

  } catch (error) {
    console.error("Error fetching profile recommendations:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}

async function generateRecommendations(currentUser: any, limit: number) {
  const recommendations: any[] = [];

  // 1. Skills-based recommendations
  if (currentUser.skills && currentUser.skills.length > 0) {
    const skillsRecommendations = await prisma.profile.findMany({
      where: {
        active: true,
        userId: { not: currentUser.userId },
        skills: { array_contains: currentUser.skills },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
          }
        }
      },
      take: Math.ceil(limit / 3),
    });

    recommendations.push(...skillsRecommendations.map(profile => ({
      ...transformProfile(profile),
      matchScore: calculateMatchScore(profile, currentUser, 'skills'),
      reason: 'Habilidades similares'
    })));
  }

  // 2. Location-based recommendations
  if (currentUser.address) {
    const locationRecommendations = await prisma.profile.findMany({
      where: {
        active: true,
        userId: { not: currentUser.userId },
        address: { contains: currentUser.address.split(',')[0], mode: "insensitive" },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
          }
        }
      },
      take: Math.ceil(limit / 3),
    });

    recommendations.push(...locationRecommendations.map(profile => ({
      ...transformProfile(profile),
      matchScore: calculateMatchScore(profile, currentUser, 'location'),
      reason: 'Misma ubicación'
    })));
  }

  // 3. Experience level recommendations
  const experienceRecommendations = await prisma.profile.findMany({
    where: {
      active: true,
      userId: { not: currentUser.userId },
      experienceLevel: currentUser.experienceLevel,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
        }
      }
    },
    take: Math.ceil(limit / 3),
  });

  recommendations.push(...experienceRecommendations.map(profile => ({
    ...transformProfile(profile),
    matchScore: calculateMatchScore(profile, currentUser, 'experience'),
    reason: 'Mismo nivel de experiencia'
  })));

  // 4. Trending profiles (most viewed recently)
  const trendingRecommendations = await prisma.profile.findMany({
    where: {
      active: true,
      userId: { not: currentUser.userId },
      profileViews: { gt: 0 },
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
        }
      }
    },
    orderBy: [
      { profileViews: "desc" },
      { createdAt: "desc" }
    ],
    take: Math.ceil(limit / 4),
  });

  recommendations.push(...trendingRecommendations.map(profile => ({
    ...transformProfile(profile),
    matchScore: calculateMatchScore(profile, currentUser, 'trending'),
    reason: 'Perfil popular'
  })));

  // Remove duplicates and sort by match score
  const uniqueRecommendations = recommendations
    .filter((rec, index, self) => 
      index === self.findIndex(r => r.id === rec.id)
    )
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);

  return uniqueRecommendations;
}

function calculateMatchScore(profile: any, currentUser: any, reason: string): number {
  let score = 0;

  switch (reason) {
    case 'skills':
      if (currentUser.skills && profile.skills) {
        const commonSkills = currentUser.skills.filter((skill: string) => 
          profile.skills.includes(skill)
        );
        score = Math.min(100, (commonSkills.length / Math.max(currentUser.skills.length, profile.skills.length)) * 100);
      }
      break;
    case 'location':
      score = 80; // High score for location match
      break;
    case 'experience':
      score = 70; // Good score for experience match
      break;
    case 'trending':
      score = 60; // Medium score for trending profiles
      break;
    default:
      score = 50;
  }

  // Add bonus for verified profiles
  if (profile.isVerified) {
    score += 10;
  }

  // Add bonus for available profiles
  if (profile.isAvailable) {
    score += 5;
  }

  return Math.min(100, Math.round(score));
}

function transformProfile(profile: any) {
  return {
    id: profile.user.id,
    firstName: profile.firstName || "",
    lastName: profile.lastName || "",
    email: profile.email || profile.user.email,
    avatarUrl: profile.avatarUrl || "",
    title: profile.jobTitle || "",
    location: profile.address || "",
    experience: profile.experienceLevel || "NO_EXPERIENCE",
    education: profile.educationLevel || "NO_EXPERIENCE",
    skills: (profile.skills as string[]) || [],
    bio: profile.bio || "",
    isVerified: profile.isVerified || false,
    isAvailable: profile.isAvailable || false,
    rating: profile.rating || 0,
    views: profile.profileViews || 0,
    connections: profile.connections || 0,
    lastActive: profile.lastLoginAt?.toISOString() || profile.createdAt.toISOString(),
    role: profile.user.role,
  };
}

