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

    const institution = await prisma.institution.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            profile: true
          }
        },
        courses: {
          include: {
            _count: {
              select: {
                enrollments: true
              }
            }
          }
        },
        programs: {
          include: {
            _count: {
              select: {
                courses: true
              }
            }
          }
        },
        students: {
          include: {
            user: {
              include: {
                profile: true
              }
            }
          }
        },
        _count: {
          select: {
            courses: true,
            programs: true,
            students: true
          }
        }
      }
    });

    if (!institution) {
      return NextResponse.json({ error: "Institution not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      institution
    });

  } catch (error) {
    console.error("Error fetching institution:", error);
    return NextResponse.json(
      { error: "Failed to fetch institution" },
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

    // Check if user owns the institution or is admin
    const institution = await prisma.institution.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!institution) {
      return NextResponse.json({ error: "Institution not found" }, { status: 404 });
    }

    if (institution.userId !== session.user.id && session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const {
      name,
      description,
      type,
      city,
      country,
      website,
      phone,
      email,
      logoUrl,
      isActive
    } = body;

    const updatedInstitution = await prisma.institution.update({
      where: { id },
      data: {
        name,
        description,
        type,
        city,
        country,
        website,
        phone,
        email,
        logoUrl,
        isActive,
        updatedAt: new Date()
      },
      include: {
        user: {
          include: {
            profile: true
          }
        },
        _count: {
          select: {
            courses: true,
            programs: true,
            students: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      institution: updatedInstitution
    });

  } catch (error) {
    console.error("Error updating institution:", error);
    return NextResponse.json(
      { error: "Failed to update institution" },
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

    // Check if user owns the institution or is admin
    const institution = await prisma.institution.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!institution) {
      return NextResponse.json({ error: "Institution not found" }, { status: 404 });
    }

    if (institution.userId !== session.user.id && session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Check if institution has associated data
    const associatedData = await prisma.institution.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            courses: true,
            programs: true,
            students: true
          }
        }
      }
    });

    if (associatedData && (
      associatedData._count.courses > 0 ||
      associatedData._count.programs > 0 ||
      associatedData._count.students > 0
    )) {
      return NextResponse.json(
        { error: "Cannot delete institution with associated data" },
        { status: 400 }
      );
    }

    await prisma.institution.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: "Institution deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting institution:", error);
    return NextResponse.json(
      { error: "Failed to delete institution" },
      { status: 500 }
    );
  }
}
