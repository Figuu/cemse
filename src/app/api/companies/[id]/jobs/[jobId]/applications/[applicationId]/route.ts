import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateApplicationSchema = z.object({
  status: z.enum(["PENDING", "REVIEWED", "INTERVIEWED", "REJECTED", "HIRED", "WITHDRAWN"]).optional(),
  notes: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; jobId: string; applicationId: string } }
) {
  try {
    const application = await prisma.jobApplication.findFirst({
      where: { 
        id: params.applicationId,
        jobId: params.jobId,
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
                phone: true,
                address: true,
                birthDate: true,
                gender: true,
              },
            },
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            description: true,
            requirements: true,
            responsibilities: true,
            company: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error("Error fetching application:", error);
    return NextResponse.json(
      { error: "Failed to fetch application" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; jobId: string; applicationId: string } }
) {
  try {
    const body = await request.json();
    const validatedData = updateApplicationSchema.parse(body);

    // Get user ID from session (in real app, this would come from auth)
    const userId = "user-1"; // Mock user ID

    // Check if user owns the company
    const company = await prisma.company.findUnique({
      where: { id: params.id },
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

    const updateData: any = { ...validatedData };

    // Set specific timestamps based on status
    if (validatedData.status) {
      const now = new Date();
      switch (validatedData.status) {
        case "REVIEWED":
          updateData.reviewedAt = now;
          break;
        case "INTERVIEWED":
          updateData.interviewedAt = now;
          break;
        case "REJECTED":
          updateData.rejectedAt = now;
          break;
        case "HIRED":
          updateData.hiredAt = now;
          break;
      }
    }

    const updatedApplication = await prisma.jobApplication.update({
      where: { id: params.applicationId },
      data: updateData,
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

    return NextResponse.json(updatedApplication);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating application:", error);
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; jobId: string; applicationId: string } }
) {
  try {
    // Get user ID from session (in real app, this would come from auth)
    const userId = "user-1"; // Mock user ID

    // Check if user owns the company or is the applicant
    const application = await prisma.jobApplication.findFirst({
      where: { 
        id: params.applicationId,
        jobId: params.jobId,
        companyId: params.id,
      },
      include: {
        company: {
          select: { ownerId: true },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    const isCompanyOwner = application.company.ownerId === userId;
    const isApplicant = application.applicantId === userId;

    if (!isCompanyOwner && !isApplicant) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    await prisma.jobApplication.delete({
      where: { id: params.applicationId },
    });

    // Update job application count
    await prisma.jobPosting.update({
      where: { id: params.jobId },
      data: { totalApplications: { decrement: 1 } },
    });

    // Update company application count
    await prisma.company.update({
      where: { id: params.id },
      data: { totalApplications: { decrement: 1 } },
    });

    return NextResponse.json({ message: "Application deleted successfully" });
  } catch (error) {
    console.error("Error deleting application:", error);
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 }
    );
  }
}
