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

    const { id } = await params;

    const resource = await prisma.resource.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            // userId: true, // This field doesn't exist on User model
            firstName: true,
            lastName: true,
          }
        },
      }
    });

    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    // Check if user can view this resource
    if (resource.status !== "PUBLISHED" &&
        resource.createdByUserId !== session.user.id &&
        session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      resource
    });

  } catch (error) {
    console.error("Error fetching resource:", error);
    return NextResponse.json(
      { error: "Failed to fetch resource" },
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

    // Check if user owns the resource or is admin
    const resource = await prisma.resource.findUnique({
      where: { id },
      select: { createdByUserId: true }
    });

    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    if (resource.createdByUserId !== session.user.id && session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const {
      title,
      description,
      category,
      type,
      format,
      downloadUrl,
      externalUrl,
      thumbnail,
      tags,
      status,
      isPublic,
      isEntrepreneurshipRelated
    } = body;

    const updateData: any = {
      title,
      description,
      category,
      type,
      format,
      downloadUrl,
      externalUrl,
      thumbnail,
      tags,
      status,
      isPublic,
      isEntrepreneurshipRelated,
      updatedAt: new Date()
    };


    if (status === "PUBLISHED") {
      updateData.publishedDate = new Date();
    }

    const updatedResource = await prisma.resource.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: {
          select: {
            // userId: true, // This field doesn't exist on User model
            firstName: true,
            lastName: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      resource: updatedResource
    });

  } catch (error) {
    console.error("Error updating resource:", error);
    return NextResponse.json(
      { error: "Failed to update resource" },
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

    // Check if user owns the resource or is admin
    const resource = await prisma.resource.findUnique({
      where: { id },
      select: { createdByUserId: true }
    });

    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    if (resource.createdByUserId !== session.user.id && session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    await prisma.resource.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: "Resource deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting resource:", error);
    return NextResponse.json(
      { error: "Failed to delete resource" },
      { status: 500 }
    );
  }
}
