import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only COMPANIES role can access company info
    if (session.user.role !== "COMPANIES") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get company info from user
    const company = await prisma.company.findFirst({
      where: {
        OR: [
          { createdBy: session.user.id },
          { ownerId: session.user.id }
        ]
      },
      select: { 
        id: true,
        name: true,
        description: true,
        logoUrl: true,
        website: true,
        email: true,
        phone: true,
        address: true,
        businessSector: true,
        companySize: true,
        foundedYear: true,
        isActive: true,
        approvalStatus: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      company,
    });

  } catch (error) {
    console.error("Error fetching company info:", error);
    return NextResponse.json(
      { error: "Failed to fetch company information" },
      { status: 500 }
    );
  }
}
