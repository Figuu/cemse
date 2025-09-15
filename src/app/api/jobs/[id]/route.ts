import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: jobId } = await params;

    const job = await prisma.jobOffer.findFirst({
      where: {
        id: jobId,
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
            description: true,
            ownerId: true,
          },
        },
        applications: {
          where: {
            applicantId: session.user.id,
          },
          select: {
            id: true,
            status: true,
            appliedAt: true,
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    console.log("Job API - Found job:", { 
      id: job.id, 
      title: job.title, 
      companyId: job.companyId,
      companyOwnerId: job.company.ownerId 
    });

    // Transform data for frontend
    const transformedJob = {
      id: job.id,
      title: job.title,
      description: job.description,
      requirements: job.requirements ? job.requirements.split('\n').filter(r => r.trim()) : [],
      responsibilities: (job as any).responsibilities || [],
      benefits: job.benefits ? job.benefits.split('\n').filter(b => b.trim()) : [],
      location: job.location,
      city: (job as any).city,
      state: (job as any).state,
      country: (job as any).country,
      contractType: job.contractType,
      workSchedule: job.workSchedule,
      workModality: job.workModality,
      experienceLevel: job.experienceLevel,
      educationRequired: job.educationRequired,
      skillsRequired: job.skillsRequired || [],
      desiredSkills: job.desiredSkills || [],
      skills: (job as any).skills || [],
      tags: (job as any).tags || [],
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      salaryCurrency: job.salaryCurrency || "BOB",
      applicationDeadline: job.applicationDeadline,
      startDate: (job as any).startDate,
      reportingTo: (job as any).reportingTo,
      isUrgent: (job as any).isUrgent,
      isActive: job.isActive,
      status: job.status,
      viewsCount: job.viewsCount,
      applicationsCount: job.applicationsCount,
      featured: job.featured,
      expiresAt: job.expiresAt,
      publishedAt: job.publishedAt,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      latitude: job.latitude,
      longitude: job.longitude,
      images: job.images || [],
      logo: job.logo,
      company: {
        id: job.company.id,
        name: job.company.name,
        logo: job.company.logoUrl, // Map logoUrl to logo for frontend
        address: job.company.address,
        website: job.company.website,
        description: job.company.description,
        ownerId: job.company.ownerId,
      },
      isApplied: (job as any).applications.length > 0,
      application: (job as any).applications[0] || null,
    };

    return NextResponse.json(transformedJob);

  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json(
      { error: "Failed to fetch job" },
      { status: 500 }
    );
  }
}
