import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if the user is requesting their own institution or is an admin
    if (session.user.id !== userId && session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Find the institution created by this user
    const institution = await prisma.institution.findFirst({
      where: {
        createdBy: userId,
        isActive: true,
      },
      include: {
        creator: {
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
        _count: {
          select: {
            companies: true,
            profiles: true,
            courses: true,
          },
        },
      },
    });

    if (!institution) {
      return NextResponse.json(
        { error: "Institution not found for this user" },
        { status: 404 }
      );
    }

    return NextResponse.json({ institution });
  } catch (error) {
    console.error("Error fetching institution by user ID:", error);
    return NextResponse.json(
      { error: "Failed to fetch institution" },
      { status: 500 }
    );
  }
}
