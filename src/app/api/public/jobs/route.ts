import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "6");

    const jobs = await prisma.jobOffer.findMany({
      where: {
        isActive: true,
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
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    // Transform data for frontend
    const transformedJobs = jobs.map((job: any) => ({
      id: job.id,
      title: job.title,
      companyId: job.companyId,
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
      experience: job.experienceLevel,
      education: job.educationRequired,
      skills: job.skillsRequired || [],
      remote: job.workModality === "REMOTE" || job.workModality === "HYBRID",
      urgent: job.featured || false,
    }));

    return NextResponse.json({
      success: true,
      jobs: transformedJobs,
    });

  } catch (error) {
    console.error("Error fetching public jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
