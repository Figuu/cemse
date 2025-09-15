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

    // Check if the user is requesting their own company or is an admin
    if (session.user.id !== userId && session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Find the company owned by this user
    console.log(`Looking for company with userId: ${userId}`);
    
    // Debug: Check all companies to see what's in the database
    const allCompanies = await prisma.company.findMany({
      select: { id: true, name: true, createdBy: true, ownerId: true, isActive: true }
    });
    console.log('All companies in database:', allCompanies);
    
    const company = await prisma.company.findFirst({
      where: {
        OR: [
          { createdBy: userId },
          { ownerId: userId }
        ],
        // Temporarily remove isActive filter to debug
        // isActive: true,
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
            jobOffers: true,
            employees: true,
            youthApplicationInterests: true,
          },
        },
      },
    });

    console.log('Found company:', company);
    
    if (!company) {
      console.log(`No company found for userId: ${userId}`);
      return NextResponse.json(
        { error: "Company not found for this user" },
        { status: 404 }
      );
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error("Error fetching company by user ID:", error);
    return NextResponse.json(
      { error: "Failed to fetch company" },
      { status: 500 }
    );
  }
}
