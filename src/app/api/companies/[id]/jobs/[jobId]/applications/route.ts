import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createApplicationSchema = z.object({
  coverLetter: z.string().optional(),
  notes: z.string().optional(),
  cvData: z.any().optional(), // JSON field for additional CV data
  cvFile: z.string().optional(), // File path/URL for CV
  coverLetterFile: z.string().optional(), // File path/URL for cover letter
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; jobId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status") || "";
    const sortBy = searchParams.get("sortBy") || "appliedAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    const { jobId } = await params;
    const where: Record<string, unknown> = {
      jobOfferId: jobId,
    };

    if (status) {
      where.status = status;
    }

    const orderBy: Record<string, string> = {};
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
              userId: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
              phone: true,
              address: true,
              user: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
          },
          jobOffer: {
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
  { params }: { params: Promise<{ id: string; jobId: string }> }
) {
  try {
    const body = await request.json();
    const validatedData = createApplicationSchema.parse(body);

    const { id: companyId, jobId } = await params;
    
    // Get user ID from session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // Check if job exists and is active
    const job = await prisma.jobOffer.findFirst({
      where: { 
        id: jobId,
        companyId: companyId,
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
    const existingApplication = await prisma.jobApplication.findFirst({
      where: {
        jobOfferId: jobId,
        applicantId: userId, // This should be the userId from Profile
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
        jobOfferId: jobId,
        applicantId: userId,
      },
      include: {
        applicant: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Note: Application count updates would be handled by database triggers or background jobs

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
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
