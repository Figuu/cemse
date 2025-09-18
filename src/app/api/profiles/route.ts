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

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      firstName, lastName, email, phone, address, city, state, cityState, country,
      birthDate, gender, documentType, documentNumber, avatarUrl,
      jobTitle, professionalSummary, experienceLevel, targetPosition, targetCompany,
      educationLevel, currentInstitution, graduationYear, isStudying, currentDegree,
      universityName, universityStartDate, universityEndDate, universityStatus, gpa,
      skills, skillsWithLevel, languages, relevantSkills, interests,
      workExperience, educationHistory, projects, achievements, academicAchievements,
      extracurricularActivities, websites, socialLinks
    } = body;

    // First check if profile exists
    const existingProfile = await prisma.profile.findUnique({
      where: { userId: session.user.id }
    });

    if (!existingProfile) {
      // Create profile if it doesn't exist
      const newProfile = await prisma.profile.create({
        data: {
          userId: session.user.id,
          firstName: firstName || null,
          lastName: lastName || null,
          phone: phone || null,
          address: address || null,
          city: city || null,
          state: state || null,
          cityState: cityState || null,
          country: country || null,
          birthDate: birthDate && birthDate.trim() !== '' ? new Date(birthDate) : null,
          gender: gender || null,
          documentType: documentType || null,
          documentNumber: documentNumber || null,
          avatarUrl: avatarUrl || null,
          jobTitle: jobTitle || null,
          professionalSummary: professionalSummary || null,
          experienceLevel: experienceLevel || null,
          targetPosition: targetPosition || null,
          targetCompany: targetCompany || null,
          educationLevel: educationLevel || null,
          currentInstitution: currentInstitution || null,
          graduationYear: graduationYear && graduationYear.trim() !== '' && !isNaN(parseInt(graduationYear)) ? parseInt(graduationYear) : null,
          isStudying: Boolean(isStudying),
          currentDegree: currentDegree || null,
          universityName: universityName || null,
          universityStartDate: universityStartDate && universityStartDate.trim() !== '' ? new Date(universityStartDate) : null,
          universityEndDate: universityEndDate && universityEndDate.trim() !== '' ? new Date(universityEndDate) : null,
          universityStatus: universityStatus || null,
          gpa: gpa && gpa.trim() !== '' && !isNaN(parseFloat(gpa)) ? parseFloat(gpa) : null,
          skills: skills || null,
          skillsWithLevel: skillsWithLevel || null,
          languages: languages || null,
          relevantSkills: Array.isArray(relevantSkills) ? relevantSkills : [],
          interests: interests || null,
          workExperience: workExperience || null,
          educationHistory: educationHistory || null,
          projects: projects || null,
          achievements: achievements || null,
          academicAchievements: academicAchievements || null,
          extracurricularActivities: extracurricularActivities || null,
          websites: websites || null,
          socialLinks: socialLinks || null,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
            }
          }
        }
      });

      const responseData = {
        success: true,
        profile: {
          id: newProfile.user.id,
          firstName: newProfile.firstName,
          lastName: newProfile.lastName,
          email: newProfile.user.email,
          phone: newProfile.phone,
          address: newProfile.address,
          city: newProfile.city,
          state: newProfile.state,
          cityState: newProfile.cityState,
          country: newProfile.country,
          birthDate: newProfile.birthDate,
          gender: newProfile.gender,
          documentType: newProfile.documentType,
          documentNumber: newProfile.documentNumber,
          avatarUrl: newProfile.avatarUrl,
          jobTitle: newProfile.jobTitle,
          professionalSummary: newProfile.professionalSummary,
          experienceLevel: newProfile.experienceLevel,
          targetPosition: newProfile.targetPosition,
          targetCompany: newProfile.targetCompany,
          educationLevel: newProfile.educationLevel,
          currentInstitution: newProfile.currentInstitution,
          graduationYear: newProfile.graduationYear,
          isStudying: newProfile.isStudying,
          currentDegree: newProfile.currentDegree,
          universityName: newProfile.universityName,
          universityStartDate: newProfile.universityStartDate,
          universityEndDate: newProfile.universityEndDate,
          universityStatus: newProfile.universityStatus,
          gpa: newProfile.gpa,
          skills: newProfile.skills,
          skillsWithLevel: newProfile.skillsWithLevel,
          languages: newProfile.languages,
          relevantSkills: newProfile.relevantSkills,
          interests: newProfile.interests,
          workExperience: newProfile.workExperience,
          educationHistory: newProfile.educationHistory,
          projects: newProfile.projects,
          achievements: newProfile.achievements,
          academicAchievements: newProfile.academicAchievements,
          extracurricularActivities: newProfile.extracurricularActivities,
          websites: newProfile.websites,
          socialLinks: newProfile.socialLinks,
          role: newProfile.user.role,
        },
      };

      return NextResponse.json(responseData);
    }

    // Update user's profile
    const updatedProfile = await prisma.profile.update({
      where: { userId: session.user.id },
      data: {
        firstName: firstName || null,
        lastName: lastName || null,
        phone: phone || null,
        address: address || null,
        city: city || null,
        state: state || null,
        cityState: cityState || null,
        country: country || null,
        birthDate: birthDate && birthDate.trim() !== '' ? new Date(birthDate) : null,
        gender: gender || null,
        documentType: documentType || null,
        documentNumber: documentNumber || null,
        avatarUrl: avatarUrl || null,
        jobTitle: jobTitle || null,
        professionalSummary: professionalSummary || null,
        experienceLevel: experienceLevel || null,
        targetPosition: targetPosition || null,
        targetCompany: targetCompany || null,
        educationLevel: educationLevel || null,
        currentInstitution: currentInstitution || null,
        graduationYear: graduationYear && graduationYear.trim() !== '' && !isNaN(parseInt(graduationYear)) ? parseInt(graduationYear) : null,
        isStudying: Boolean(isStudying),
        currentDegree: currentDegree || null,
        universityName: universityName || null,
        universityStartDate: universityStartDate && universityStartDate.trim() !== '' ? new Date(universityStartDate) : null,
        universityEndDate: universityEndDate && universityEndDate.trim() !== '' ? new Date(universityEndDate) : null,
        universityStatus: universityStatus || null,
        gpa: gpa && gpa.trim() !== '' && !isNaN(parseFloat(gpa)) ? parseFloat(gpa) : null,
        skills: skills || null,
        skillsWithLevel: skillsWithLevel || null,
        languages: languages || null,
        relevantSkills: Array.isArray(relevantSkills) ? relevantSkills : [],
        interests: interests || null,
        workExperience: workExperience || null,
        educationHistory: educationHistory || null,
        projects: projects || null,
        achievements: achievements || null,
        academicAchievements: academicAchievements || null,
        extracurricularActivities: extracurricularActivities || null,
        websites: websites || null,
        socialLinks: socialLinks || null,
      },
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

    const responseData = {
      success: true,
      profile: {
        id: updatedProfile.user.id,
        firstName: updatedProfile.firstName,
        lastName: updatedProfile.lastName,
        email: updatedProfile.user.email,
        phone: updatedProfile.phone,
        address: updatedProfile.address,
        city: updatedProfile.city,
        state: updatedProfile.state,
        cityState: updatedProfile.cityState,
        country: updatedProfile.country,
        birthDate: updatedProfile.birthDate,
        gender: updatedProfile.gender,
        documentType: updatedProfile.documentType,
        documentNumber: updatedProfile.documentNumber,
        avatarUrl: updatedProfile.avatarUrl,
        jobTitle: updatedProfile.jobTitle,
        professionalSummary: updatedProfile.professionalSummary,
        experienceLevel: updatedProfile.experienceLevel,
        targetPosition: updatedProfile.targetPosition,
        targetCompany: updatedProfile.targetCompany,
        educationLevel: updatedProfile.educationLevel,
        currentInstitution: updatedProfile.currentInstitution,
        graduationYear: updatedProfile.graduationYear,
        isStudying: updatedProfile.isStudying,
        currentDegree: updatedProfile.currentDegree,
        universityName: updatedProfile.universityName,
        universityStartDate: updatedProfile.universityStartDate,
        universityEndDate: updatedProfile.universityEndDate,
        universityStatus: updatedProfile.universityStatus,
        gpa: updatedProfile.gpa,
        skills: updatedProfile.skills,
        skillsWithLevel: updatedProfile.skillsWithLevel,
        languages: updatedProfile.languages,
        relevantSkills: updatedProfile.relevantSkills,
        interests: updatedProfile.interests,
        workExperience: updatedProfile.workExperience,
        educationHistory: updatedProfile.educationHistory,
        projects: updatedProfile.projects,
        achievements: updatedProfile.achievements,
        academicAchievements: updatedProfile.academicAchievements,
        extracurricularActivities: updatedProfile.extracurricularActivities,
        websites: updatedProfile.websites,
        socialLinks: updatedProfile.socialLinks,
        role: updatedProfile.user.role,
      },
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error("Error updating profile:", error);
    
    // Provide more specific error messages
    let errorMessage = "Failed to update profile";
    if (error instanceof Error) {
      if (error.message.includes("Invalid value for argument")) {
        errorMessage = "Invalid data format. Please check your input values.";
      } else if (error.message.includes("premature end of input")) {
        errorMessage = "Invalid date format. Please use a valid date.";
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
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
    const { avatarUrl, cvUrl } = body;

    // Validate that at least one field is provided
    if (!avatarUrl && !cvUrl) {
      return NextResponse.json({ error: "At least one field (avatarUrl or cvUrl) is required" }, { status: 400 });
    }

    // Build update data object
    const updateData: any = {};
    if (avatarUrl) updateData.avatarUrl = avatarUrl;
    if (cvUrl) updateData.cvUrl = cvUrl;

    // Update user's profile
    const updatedProfile = await prisma.profile.update({
      where: { userId: session.user.id },
      data: updateData,
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
        cvUrl: updatedProfile.cvUrl,
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