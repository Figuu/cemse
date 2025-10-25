import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateJobSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  requirements: z.array(z.string()).optional(),
  responsibilities: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string().min(1),
  }).optional(),
  municipality: z.string().optional(),
  department: z.string().optional(),
  contractType: z.enum(["FULL_TIME", "PART_TIME", "INTERNSHIP", "VOLUNTEER", "FREELANCE"]).optional(),
  workSchedule: z.string().optional(),
  workModality: z.enum(["ON_SITE", "REMOTE", "HYBRID"]).optional(),
  experienceLevel: z.enum(["NO_EXPERIENCE", "ENTRY_LEVEL", "MID_LEVEL", "SENIOR_LEVEL"]).optional(),
  educationRequired: z.enum(["PRIMARY", "SECONDARY", "TECHNICAL", "UNIVERSITY", "POSTGRADUATE", "OTHER"]).optional(),
  skillsRequired: z.array(z.string()).optional(),
  desiredSkills: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  salaryMin: z.number().positive().optional(),
  salaryMax: z.number().positive().optional(),
  salaryCurrency: z.string().optional(),
  applicationDeadline: z.string().datetime().optional(),
  startDate: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
  featured: z.boolean().optional(),
  isUrgent: z.boolean().optional(),
  remoteWork: z.boolean().optional(),
  hybridWork: z.boolean().optional(),
  officeWork: z.boolean().optional(),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "FREELANCE", "TEMPORARY"]).optional(),
  reportingTo: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; jobId: string }> }
) {
  try {
    const { id: companyId, jobId } = await params;
    const job = await prisma.jobOffer.findFirst({
      where: { 
        id: jobId,
        companyId: companyId,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            businessSector: true,
            address: true,
            website: true,
            email: true,
            phone: true,
          },
        },
        applications: {
          include: {
            applicant: {
              select: {
                id: true,
                user: {
                  select: {
                    email: true,
                  },
                },
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { appliedAt: "desc" },
        },
        _count: {
          select: {
            applications: true,
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

    // Increment view count
    await prisma.jobOffer.update({
      where: { id: jobId },
      data: { viewsCount: { increment: 1 } },
    });

    // Transform location data to new format
    const transformedJob = {
      ...job,
      location: job.latitude && job.longitude ? {
        lat: job.latitude,
        lng: job.longitude,
        address: job.location,
      } : job.location, // Fallback to string format for backward compatibility
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; jobId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateJobSchema.parse(body);

    const { id: companyId, jobId } = await params;
    const userId = session.user.id;

    // Check if user owns the company
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { ownerId: true },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    if (company.ownerId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Process the data for database update
    const updateData: any = { ...validatedData };
    
    // Remove frontend-only fields that don't exist in the database
    delete updateData.remoteWork;
    delete updateData.hybridWork;
    delete updateData.officeWork;
    delete updateData.employmentType; // This gets mapped to contractType
    
    // Handle location data
    if (validatedData.location) {
      updateData.latitude = validatedData.location.lat;
      updateData.longitude = validatedData.location.lng;
      updateData.location = validatedData.location.address;
    }
    
    // Convert arrays to strings for database storage
    if (validatedData.requirements) {
      updateData.requirements = validatedData.requirements.join('\n');
    }
    if (validatedData.responsibilities) {
      updateData.responsibilities = validatedData.responsibilities;
    }
    if (validatedData.benefits) {
      updateData.benefits = validatedData.benefits.join('\n');
    }
    
    // Handle work modality based on work type flags
    if (validatedData.remoteWork !== undefined || validatedData.hybridWork !== undefined || validatedData.officeWork !== undefined) {
      if (validatedData.remoteWork) {
        updateData.workModality = "REMOTE";
      } else if (validatedData.hybridWork) {
        updateData.workModality = "HYBRID";
      } else if (validatedData.officeWork) {
        updateData.workModality = "ON_SITE";
      }
    }
    
    // Map employmentType to contractType
    if (validatedData.employmentType) {
      updateData.contractType = validatedData.employmentType;
    }

    const updatedJob = await prisma.jobOffer.update({
      where: { id: jobId },
      data: updateData,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            businessSector: true,
            address: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    return NextResponse.json(updatedJob);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error updating job:", error);
    return NextResponse.json(
      { error: "Failed to update job" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; jobId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: companyId, jobId } = await params;
    const userId = session.user.id;

    // Check if user owns the company
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { ownerId: true },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    if (company.ownerId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Soft delete by setting isActive to false
    await prisma.jobOffer.update({
      where: { id: jobId },
      data: { isActive: false },
    });

    return NextResponse.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Error deleting job:", error);
    return NextResponse.json(
      { error: "Failed to delete job" },
      { status: 500 }
    );
  }
}

