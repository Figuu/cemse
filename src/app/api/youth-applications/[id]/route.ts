import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateYouthApplicationSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().min(1, "Description is required").optional(),
  cvFile: z.string().optional(),
  coverLetterFile: z.string().optional(),
  cvUrl: z.string().url().optional().or(z.literal("")),
  coverLetterUrl: z.string().url().optional().or(z.literal("")),
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
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
        companyInterests: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
                ownerId: true,
              },
            },
          },
          orderBy: {
            interestedAt: "desc",
          },
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
        { error: "Youth application not found" },
        { status: 404 }
      );
    }

    // Check if user can view this application
    const canView = application.isPublic || application.youthProfileId === session.user.id;
    if (!canView) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    return NextResponse.json(application);
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
    const existingApplication = await prisma.youthApplication.findUnique({
      where: { id },
    });

    if (!existingApplication) {
      return NextResponse.json(
        { error: "Youth application not found" },
        { status: 404 }
      );
    }

    if (existingApplication.youthProfileId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const application = await prisma.youthApplication.update({
      where: { id },
      data: validatedData,
      include: {
        youthProfile: {
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
        _count: {
          select: {
            companyInterests: true,
          },
        },
      },
    });

    return NextResponse.json(application);
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
    const existingApplication = await prisma.youthApplication.findUnique({
      where: { id },
    });

    if (!existingApplication) {
      return NextResponse.json(
        { error: "Youth application not found" },
        { status: 404 }
      );
    }

    if (existingApplication.youthProfileId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    await prisma.youthApplication.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Youth application deleted successfully" });
  } catch (error) {
    console.error("Error deleting youth application:", error);
    return NextResponse.json(
      { error: "Failed to delete youth application" },
      { status: 500 }
    );
  }
}