import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateYouthApplicationSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  cvFile: z.string().optional(),
  coverLetterFile: z.string().optional(),
  cvUrl: z.string().optional(),
  coverLetterUrl: z.string().optional(),
  status: z.enum(["ACTIVE", "PAUSED", "CLOSED", "HIRED"]).optional(),
  isPublic: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const application = await prisma.youthApplication.findUnique({
      where: { id },
      include: {
        youthProfile: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            phone: true,
            address: true,
            city: true,
            skillsWithLevel: true,
            workExperience: true,
            educationLevel: true,
            professionalSummary: true,
            birthDate: true,
            languages: true,
            projects: true,
            achievements: true,
          },
        },
        companyInterests: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
                // industry: true, // This field doesn't exist
                // location: true, // This field doesn't exist in Company model
                website: true,
              },
            },
          },
          orderBy: { interestedAt: "desc" },
        },
        _count: {
          select: {
            companyInterests: true,
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

    // Check permissions
    const canView = 
      application.youthProfileId === session.user.id || // Owner
      application.isPublic || // Public application
      session.user.role === "SUPERADMIN"; // Admin can see all

    if (!canView) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Increment view count if not the owner
    if (application.youthProfileId !== session.user.id) {
      await prisma.youthApplication.update({
        where: { id },
        data: { viewsCount: { increment: 1 } },
      });
    }

    return NextResponse.json({
      success: true,
      application: {
        id: application.id,
        title: application.title,
        description: application.description,
        status: application.status,
        isPublic: application.isPublic,
        viewsCount: application.viewsCount,
        applicationsCount: application.applicationsCount,
        createdAt: application.createdAt.toISOString(),
        updatedAt: application.updatedAt.toISOString(),
        cvFile: application.cvFile,
        coverLetterFile: application.coverLetterFile,
        cvUrl: application.cvUrl,
        coverLetterUrl: application.coverLetterUrl,
        youth: {
          id: application.youthProfile.userId,
          email: '', // Email not available in profile
          profile: application.youthProfile,
        },
        companyInterests: application.companyInterests,
        totalInterests: application._count.companyInterests,
      },
    });

  } catch (error) {
    console.error("Error fetching youth application:", error);
    return NextResponse.json(
      { error: "Failed to fetch youth application" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateYouthApplicationSchema.parse(body);

    // Check if application exists and user owns it
    const application = await prisma.youthApplication.findUnique({
      where: { id },
      select: { youthProfileId: true },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    if (application.youthProfileId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedApplication = await prisma.youthApplication.update({
      where: { id },
      data: validatedData,
      include: {
          youthProfile: {
            select: {
              userId: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
      },
    });

    return NextResponse.json({
      success: true,
      application: {
        id: updatedApplication.id,
        title: updatedApplication.title,
        description: updatedApplication.description,
        status: updatedApplication.status,
        isPublic: updatedApplication.isPublic,
        updatedAt: updatedApplication.updatedAt.toISOString(),
        youth: {
          id: updatedApplication.youthProfile.userId,
          email: '', // Email not available in profile
          profile: updatedApplication.youthProfile,
        },
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error updating youth application:", error);
    return NextResponse.json(
      { error: "Failed to update youth application" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if application exists and user owns it
    const application = await prisma.youthApplication.findUnique({
      where: { id },
      select: { youthProfileId: true },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    if (application.youthProfileId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Soft delete by setting status to CLOSED
    await prisma.youthApplication.update({
      where: { id },
      data: { status: "CLOSED" },
    });

    return NextResponse.json({
      success: true,
      message: "Application closed successfully",
    });

  } catch (error) {
    console.error("Error deleting youth application:", error);
    return NextResponse.json(
      { error: "Failed to delete youth application" },
      { status: 500 }
    );
  }
}
