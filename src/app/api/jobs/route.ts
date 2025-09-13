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
      where: {
        isActive: true,
        ...(search && {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { company: { name: { contains: search, mode: "insensitive" } } },
            { skillsRequired: { hasSome: [search] } },
          ]
        }),
        ...(location && location !== "all" && { location: { contains: location, mode: "insensitive" } }),
        ...(type && type !== "all" && { contractType: type as "FULL_TIME" | "PART_TIME" | "INTERNSHIP" | "VOLUNTEER" | "FREELANCE" }),
        ...(experience && experience !== "all" && { experienceLevel: experience as "NO_EXPERIENCE" | "ENTRY_LEVEL" | "MID_LEVEL" | "SENIOR_LEVEL" }),
        ...(salary && salary !== "all" && (() => {
          const salaryRanges = {
            "0-10000": { min: 0, max: 10000 },
            "10000-20000": { min: 10000, max: 20000 },
            "20000-30000": { min: 20000, max: 30000 },
            "30000+": { min: 30000, max: 999999 },
          };
          const range = salaryRanges[salary as keyof typeof salaryRanges];
          return range ? {
            salaryMin: { gte: range.min },
            salaryMax: { lte: range.max }
          } : {};
        })())
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
        name: job.company.name,
        logo: job.company.logo,
        location: job.company.location,
      },
      location: job.location,
      type: job.type,
      salary: job.salaryMin && job.salaryMax ? {
        min: job.salaryMin,
        max: job.salaryMax,
        currency: job.salaryCurrency || "BOB",
      } : undefined,
      description: job.description,
      requirements: job.requirements || [],
      benefits: job.benefits || [],
      postedAt: job.createdAt,
      deadline: job.deadline,
      isBookmarked: job.bookmarks.length > 0,
      isApplied: job.applications.length > 0,
      experience: job.experienceLevel,
      education: job.educationLevel,
      skills: job.skills || [],
      remote: job.remote,
      urgent: job.urgent || false,
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
