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
    const search = searchParams.get("search");
    const location = searchParams.get("location");
    const experience = searchParams.get("experience");
    const skills = searchParams.get("skills");
    const sortBy = searchParams.get("sortBy") || "relevance";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const minRating = parseFloat(searchParams.get("minRating") || "0");
    const isAvailable = searchParams.get("isAvailable");
    const isVerified = searchParams.get("isVerified");
    const educationLevel = searchParams.get("educationLevel");

    // Build where clause with enhanced filtering
    const where: any = {
      active: true,
      user: {
        role: "YOUTH" // Only show youth profiles
      }
    };

    // Enhanced search functionality
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        // Search in skills array
        { skills: { array_contains: [search] } },
        // Search in education
        { educationLevel: { contains: search, mode: "insensitive" } },
        { university: { contains: search, mode: "insensitive" } },
        { degree: { contains: search, mode: "insensitive" } },
      ];
    }

    // Location filtering
    if (location && location !== "all") {
      where.address = { contains: location, mode: "insensitive" };
    }

    // Experience level filtering
    if (experience && experience !== "all") {
      where.experienceLevel = experience;
    }

    // Skills filtering with array contains
    if (skills) {
      const skillsArray = skills.split(",").filter(Boolean);
      where.skills = { array_contains: skillsArray };
    }

    // Additional filters
    if (minRating > 0) {
      where.rating = { gte: minRating };
    }

    if (isAvailable === "true") {
      where.isAvailable = true;
    } else if (isAvailable === "false") {
      where.isAvailable = false;
    }

    if (isVerified === "true") {
      where.isVerified = true;
    } else if (isVerified === "false") {
      where.isVerified = false;
    }

    if (educationLevel && educationLevel !== "all") {
      where.educationLevel = educationLevel;
    }

    // Build orderBy clause with more options
    let orderBy: any = {};
    switch (sortBy) {
      case "name":
        orderBy = { firstName: "asc" };
        break;
      case "name-desc":
        orderBy = { firstName: "desc" };
        break;
      case "rating":
        orderBy = { rating: "desc" };
        break;
      case "rating-asc":
        orderBy = { rating: "asc" };
        break;
      case "views":
        orderBy = { profileViews: "desc" };
        break;
      case "recent":
        orderBy = { createdAt: "desc" };
        break;
      case "lastActive":
        orderBy = { lastLoginAt: "desc" };
        break;
      case "experience":
        orderBy = { experienceLevel: "desc" };
        break;
      default:
        // Default to relevance (combination of rating and views)
        orderBy = [
          { rating: "desc" },
          { profileViews: "desc" },
          { createdAt: "desc" }
        ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    const [profiles, totalCount] = await Promise.all([
      prisma.profile.findMany({
        where,
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
        orderBy,
        skip,
        take: limit,
      }),
      prisma.profile.count({ where })
    ]);

    // Transform data for frontend with enhanced information
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transformedProfiles = profiles.map((profile: any) => ({
      id: profile.user.id,
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      email: profile.email || profile.user.email,
      avatarUrl: profile.avatarUrl || "",
      title: profile.jobTitle || "",
      location: profile.address || "",
      experience: profile.experienceLevel || "NO_EXPERIENCE",
      education: profile.educationLevel || "NO_EXPERIENCE",
      university: profile.university || "",
      degree: profile.degree || "",
      skills: (profile.skills as string[]) || [],
      bio: profile.bio || "",
      phone: profile.phone || "",
      isVerified: profile.isVerified || false,
      isAvailable: profile.isAvailable || false,
      rating: profile.rating || 0,
      views: profile.profileViews || 0,
      connections: profile.connections || 0,
      lastActive: profile.lastLoginAt?.toISOString() || profile.createdAt.toISOString(),
      role: profile.user.role,
      createdAt: profile.createdAt.toISOString(),
      // Additional fields for enhanced search
      experienceYears: profile.experienceYears || 0,
      languages: profile.languages || [],
      certifications: profile.certifications || [],
      portfolio: profile.portfolio || "",
      linkedin: profile.linkedin || "",
      github: profile.github || "",
    }));

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return NextResponse.json({
      success: true,
      profiles: transformedProfiles,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
      filters: {
        search,
        location,
        experience,
        skills: skills ? skills.split(",") : [],
        sortBy,
        minRating,
        isAvailable: isAvailable === "true" ? true : isAvailable === "false" ? false : null,
        isVerified: isVerified === "true" ? true : isVerified === "false" ? false : null,
        educationLevel,
      },
    });

  } catch (error) {
    console.error("Error fetching profiles:", error);
    return NextResponse.json(
      { error: "Failed to fetch profiles" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { avatarUrl } = body;

    if (!avatarUrl) {
      return NextResponse.json({ error: "Avatar URL is required" }, { status: 400 });
    }

    // Update user's avatar in profile
    const updatedProfile = await prisma.profile.update({
      where: { userId: session.user.id },
      data: { avatarUrl: avatarUrl },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          }
        }
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedProfile.user.id,
        firstName: updatedProfile.firstName,
        lastName: updatedProfile.lastName,
        email: updatedProfile.user.email,
        avatar: updatedProfile.avatarUrl,
        role: updatedProfile.user.role,
      },
    });

  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}