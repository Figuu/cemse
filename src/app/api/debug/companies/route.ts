import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all companies for debugging
    const allCompanies = await prisma.company.findMany({
      select: { 
        id: true, 
        name: true, 
        createdBy: true, 
        ownerId: true, 
        isActive: true,
        createdAt: true
      }
    });

    // Get current user info
    const currentUser = {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role
    };

    return NextResponse.json({
      currentUser,
      allCompanies,
      totalCompanies: allCompanies.length
    });

  } catch (error) {
    console.error("Error in debug endpoint:", error);
    return NextResponse.json(
      { error: "Failed to fetch debug info" },
      { status: 500 }
    );
  }
}
