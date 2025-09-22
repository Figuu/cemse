import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BusinessStage } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const entrepreneurship = await prisma.entrepreneurship.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!entrepreneurship) {
      return NextResponse.json({ error: "Entrepreneurship not found" }, { status: 404 });
    }

    // Increment view count
    await prisma.entrepreneurship.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
    });

    return NextResponse.json(entrepreneurship);
  } catch (error) {
    console.error("Error fetching entrepreneurship:", error);
    return NextResponse.json(
      { error: "Failed to fetch entrepreneurship" },
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

    // Check if user owns this entrepreneurship
    const existing = await prisma.entrepreneurship.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Entrepreneurship not found" }, { status: 404 });
    }

    if (existing.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const {
      name,
      description,
      category,
      subcategory,
      businessStage,
      logo,
      images,
      website,
      email,
      phone,
      address,
      municipality,
      department,
      socialMedia,
      founded,
      employees,
      annualRevenue,
      businessModel,
      targetMarket,
      isPublic,
      isActive,
    } = body;

    const entrepreneurship = await prisma.entrepreneurship.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(category && { category }),
        ...(subcategory !== undefined && { subcategory }),
        ...(businessStage && { businessStage }),
        ...(logo !== undefined && { logo }),
        ...(images && { images }),
        ...(website !== undefined && { website }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(municipality && { municipality }),
        ...(department && { department }),
        ...(socialMedia && { socialMedia: JSON.parse(socialMedia) }),
        ...(founded && { founded: new Date(founded) }),
        ...(employees && { employees: parseInt(employees) }),
        ...(annualRevenue && { annualRevenue: parseFloat(annualRevenue) }),
        ...(businessModel !== undefined && { businessModel }),
        ...(targetMarket !== undefined && { targetMarket }),
        ...(isPublic !== undefined && { isPublic }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return NextResponse.json(entrepreneurship);
  } catch (error) {
    console.error("Error updating entrepreneurship:", error);
    return NextResponse.json(
      { error: "Failed to update entrepreneurship" },
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

    // Check if user owns this entrepreneurship
    const existing = await prisma.entrepreneurship.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Entrepreneurship not found" }, { status: 404 });
    }

    if (existing.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.entrepreneurship.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Entrepreneurship deleted successfully" });
  } catch (error) {
    console.error("Error deleting entrepreneurship:", error);
    return NextResponse.json(
      { error: "Failed to delete entrepreneurship" },
      { status: 500 }
    );
  }
}


