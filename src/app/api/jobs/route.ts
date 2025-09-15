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
    const type = searchParams.get("type");
    const experience = searchParams.get("experience");
    const salary = searchParams.get("salary");
    const sortBy = searchParams.get("sortBy") || "newest";

    // Build query with proper types
    const whereClause: any = {
      isActive: true,
    };

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { company: { name: { contains: search, mode: "insensitive" } } },
        { skillsRequired: { hasSome: [search] } },
      ];
    }

    if (location && location !== "all") {
      whereClause.location = { contains: location, mode: "insensitive" };
    }

    if (type && type !== "all") {
      whereClause.contractType = type as "FULL_TIME" | "PART_TIME" | "INTERNSHIP" | "VOLUNTEER" | "FREELANCE";
    }

    if (experience && experience !== "all") {
      whereClause.experienceLevel = experience as "NO_EXPERIENCE" | "ENTRY_LEVEL" | "MID_LEVEL" | "SENIOR_LEVEL";
    }

    if (salary && salary !== "all") {
      const salaryRanges = {
        "0-10000": { min: 0, max: 10000 },
        "10000-20000": { min: 10000, max: 20000 },
        "20000-30000": { min: 20000, max: 30000 },
        "30000+": { min: 30000, max: 999999 },
      };
      const range = salaryRanges[salary as keyof typeof salaryRanges];
      if (range) {
        whereClause.salaryMin = { gte: range.min };
        whereClause.salaryMax = { lte: range.max };
      }
    }

    // Build orderBy clause
    let orderBy: { createdAt?: "asc" | "desc"; salaryMin?: "asc" | "desc"; title?: "asc" | "desc" } = {};
    switch (sortBy) {
      case "newest":
        orderBy = { createdAt: "desc" };
        break;
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      case "salary_high":
        orderBy = { salaryMin: "desc" };
        break;
      case "salary_low":
        orderBy = { salaryMin: "asc" };
        break;
      case "title":
        orderBy = { title: "asc" };
        break;
      case "company":
        // Company ordering not directly supported, fall back to title
        orderBy = { title: "asc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    const jobs = await prisma.jobOffer.findMany({
      where: whereClause,
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
        applications: {
          where: {
            applicantId: session.user.id,
          },
          select: {
            id: true,
            status: true,
          },
        },
        // Bookmarks not available in current schema
      },
      orderBy,
      take: 50, // Limit results
    });

    // Transform data for frontend
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transformedJobs = jobs.map((job: any) => ({
      id: job.id,
      title: job.title,
      company: {
        id: job.company.id,
        name: job.company.name,
        logo: job.company.logoUrl,
        location: job.company.address,
        website: job.company.website,
      },
      location: job.location,
      type: job.contractType,
      salary: job.salaryMin && job.salaryMax ? {
        min: job.salaryMin,
        max: job.salaryMax,
        currency: job.salaryCurrency || "BOB",
      } : undefined,
      description: job.description,
      requirements: job.requirements ? [job.requirements] : [],
      benefits: job.benefits ? [job.benefits] : [],
      createdAt: job.createdAt,
      deadline: job.applicationDeadline,
      isBookmarked: false, // Bookmarks not implemented yet
      isApplied: job.applications.length > 0,
      experience: job.experienceLevel,
      education: job.educationRequired,
      skills: job.skillsRequired || [],
      remote: job.workModality === "REMOTE" || job.workModality === "HYBRID",
      urgent: job.featured || false,
      // Add missing fields that the frontend expects
      totalViews: job.viewsCount || 0,
      totalApplications: job.applicationsCount || 0,
      totalLikes: 0, // Not implemented yet
      totalShares: 0, // Not implemented yet
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      currency: job.salaryCurrency || "BOB",
      employmentType: job.contractType,
      experienceLevel: job.experienceLevel,
      isActive: job.isActive,
      isFeatured: job.featured || false,
      isUrgent: job.urgent || false,
      applicationDeadline: job.applicationDeadline,
      _count: {
        applications: job.applications?.length || 0,
      },
    }));

    return NextResponse.json({
      success: true,
      jobs: transformedJobs,
    });

  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
