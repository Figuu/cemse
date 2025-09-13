import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createApplicationSchema = z.object({
  coverLetter: z.string().optional(),
  resume: z.string().optional(),
  portfolio: z.string().optional(),
  linkedinProfile: z.string().url().optional().or(z.literal("")),
  githubProfile: z.string().url().optional().or(z.literal("")),
  notes: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; jobId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status") || "";
    const sortBy = searchParams.get("sortBy") || "appliedAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    const where: any = {
      jobId: params.jobId,
      companyId: params.id,
    };

    if (status) {
      where.status = status;
    }

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [applications, total] = await Promise.all([
      prisma.jobApplication.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          applicant: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                  phone: true,
                  address: true,
                },
              },
            },
          },
          job: {
            select: {
              id: true,
              title: true,
              company: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
      prisma.jobApplication.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      applications,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; jobId: string } }
) {
  try {
    const body = await request.json();
    const validatedData = createApplicationSchema.parse(body);

    // Get user ID from session (in real app, this would come from auth)
    const userId = "user-1"; // Mock user ID

    // Check if job exists and is active
    const job = await prisma.jobPosting.findFirst({
      where: { 
        id: params.jobId,
        companyId: params.id,
        isActive: true,
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found or not active" },
        { status: 404 }
      );
    }

    // Check if user already applied
    const existingApplication = await prisma.jobApplication.findUnique({
      where: {
        jobId_applicantId: {
          jobId: params.jobId,
          applicantId: userId,
        },
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: "You have already applied for this job" },
        { status: 400 }
      );
    }

    const application = await prisma.jobApplication.create({
      data: {
        ...validatedData,
        jobId: params.jobId,
        applicantId: userId,
        companyId: params.id,
      },
      include: {
        applicant: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Update job application count
    await prisma.jobPosting.update({
      where: { id: params.jobId },
      data: { totalApplications: { increment: 1 } },
    });

    // Update company application count
    await prisma.company.update({
      where: { id: params.id },
      data: { totalApplications: { increment: 1 } },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating application:", error);
    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 }
    );
  }
}
