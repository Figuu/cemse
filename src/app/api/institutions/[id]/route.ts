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
        creator: {
          include: {
            profile: true
          }
        },
        companies: true,
        profiles: true,
        _count: {
          select: {
            companies: true,
            profiles: true
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

    // Check if user owns the institution or is admin or is associated with the institution
    const institution = await prisma.institution.findUnique({
      where: { id },
      select: {
        createdBy: true,
        profiles: {
          select: {
            userId: true
          }
        }
      }
    });

    if (!institution) {
      return NextResponse.json({ error: "Institution not found" }, { status: 404 });
    }

    // Check if user can edit this institution:
    // 1. User is the creator (admin who created it)
    // 2. User is SUPERADMIN
    // 3. User is INSTITUTION role and associated with this institution through their profile
    const isCreator = institution.createdBy === session.user.id;
    const isAdmin = session.user.role === "SUPERADMIN";
    const isAssociatedInstitutionUser = session.user.role === "INSTITUTION" &&
      institution.profiles.some(profile => profile.userId === session.user.id);

    if (!isCreator && !isAdmin && !isAssociatedInstitutionUser) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const {
      name,
      department,
      region,
      population,
      mayorName,
      mayorEmail,
      mayorPhone,
      address,
      website,
      phone,
      email,
      institutionType,
      customType,
      primaryColor,
      secondaryColor,
      isActive
    } = body;

    const updatedInstitution = await prisma.institution.update({
      where: { id },
      data: {
        name,
        department,
        region,
        population,
        mayorName,
        mayorEmail,
        mayorPhone,
        address,
        website,
        phone,
        email,
        institutionType,
        customType,
        primaryColor,
        secondaryColor,
        isActive,
        updatedAt: new Date()
      },
      include: {
        creator: {
          include: {
            profile: true
          }
        },
        _count: {
          select: {
            companies: true,
            profiles: true
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
      select: { createdBy: true }
    });

    if (!institution) {
      return NextResponse.json({ error: "Institution not found" }, { status: 404 });
    }

    if (institution.createdBy !== session.user.id && session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Check if institution has associated data
    const associatedData = await prisma.institution.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            companies: true,
            profiles: true
          }
        }
      }
    });

    if (associatedData && (
      associatedData._count.companies > 0 ||
      associatedData._count.profiles > 0
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
