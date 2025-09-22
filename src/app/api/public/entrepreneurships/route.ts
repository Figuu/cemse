import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "6");

    const entrepreneurships = await prisma.entrepreneurship.findMany({
      where: {
        isPublic: true,
        isActive: true,
      },
      include: {
        owner: {
          select: {
            id: true,
            userId: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      entrepreneurships,
    });

  } catch (error) {
    console.error("Error fetching public entrepreneurships:", error);
    return NextResponse.json(
      { error: "Failed to fetch entrepreneurships" },
      { status: 500 }
    );
  }
}
