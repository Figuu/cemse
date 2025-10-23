import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get all municipality institutions (public endpoint)
    const municipalities = await prisma.institution.findMany({
      where: {
        institutionType: "MUNICIPALITY",
        isActive: true, // Only active municipalities
      },
      select: {
        id: true,
        name: true,
        department: true,
        region: true,
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      municipalities: municipalities,
    });

  } catch (error) {
    console.error("Error fetching municipalities:", error);
    return NextResponse.json(
      { error: "Failed to fetch municipalities" },
      { status: 500 }
    );
  }
}
