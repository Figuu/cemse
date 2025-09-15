import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateApplicationSchema = z.object({
  status: z.enum(["SENT", "UNDER_REVIEW", "PRE_SELECTED", "REJECTED", "HIRED"]).optional(),
  notes: z.string().optional(),
  decisionReason: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; jobId: string; applicationId: string }> }
) {
  try {
    const { id: companyId, jobId, applicationId } = await params;
    const application = await prisma.jobApplication.findFirst({
      where: { 
        id: applicationId,
        jobOfferId: jobId,
        jobOffer: {
          companyId: companyId,
        },
      },
      include: {
        applicant: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            phone: true,
            address: true,
            birthDate: true,
            gender: true,
          },
        },
        jobOffer: {
          select: {
            id: true,
            title: true,
            description: true,
            requirements: true,
            company: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
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
  { params }: { params: Promise<{ id: string; jobId: string; applicationId: string }> }
) {
  try {
    const body = await request.json();
    const validatedData = updateApplicationSchema.parse(body);

    const { id: companyId, jobId, applicationId } = await params;
    
    // Get user ID from session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
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

    const updateData: any = { ...validatedData };

    // Set specific timestamps based on status
    if (validatedData.status) {
      const now = new Date();
      switch (validatedData.status) {
        case "UNDER_REVIEW":
          updateData.reviewedAt = now;
          break;
        case "PRE_SELECTED":
          updateData.reviewedAt = now; // Using reviewedAt as proxy
          break;
        case "REJECTED":
          updateData.reviewedAt = now; // Using reviewedAt as proxy
          break;
        case "HIRED":
          updateData.hiredAt = now;
          break;
      }
    }

    const updatedApplication = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: updateData,
      include: {
        applicant: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
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
    });

    return NextResponse.json(updatedApplication);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
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
  { params }: { params: Promise<{ id: string; jobId: string; applicationId: string }> }
) {
  try {
    const { id: companyId, jobId, applicationId } = await params;
    
    // Get user ID from session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // Check if user owns the company or is the applicant
    const application = await prisma.jobApplication.findFirst({
      where: { 
        id: applicationId,
        jobOfferId: jobId,
        jobOffer: {
          companyId: companyId,
        },
      },
      include: {
        jobOffer: {
          select: {
            company: {
              select: { ownerId: true },
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

    const isCompanyOwner = application.jobOffer.company.ownerId === userId;
    const isApplicant = application.applicantId === userId;

    if (!isCompanyOwner && !isApplicant) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    await prisma.jobApplication.delete({
      where: { id: applicationId },
    });

    // Note: JobOffer and Company models don't have totalApplications field
    // These updates would need to be implemented if the fields exist in the schema

    return NextResponse.json({ message: "Application deleted successfully" });
  } catch (error) {
    console.error("Error deleting application:", error);
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 }
    );
  }
}
