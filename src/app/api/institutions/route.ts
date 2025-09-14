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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const city = searchParams.get("city");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const whereClause: any = {};

    if (type && type !== "all") {
      whereClause.institutionType = type;
    }

    if (city && city !== "all") {
      whereClause.department = city;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { department: { contains: search, mode: "insensitive" } },
        { region: { contains: search, mode: "insensitive" } }
      ];
    }

    const institutions = await prisma.institution.findMany({
      where: whereClause,
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
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset
    });

    return NextResponse.json({
      success: true,
      institutions
    });

  } catch (error) {
    console.error("Error fetching institutions:", error);
    return NextResponse.json(
      { error: "Failed to fetch institutions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
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

    // Validate required fields
    if (!name || !department || !email || !institutionType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already has an institution
    const existingInstitution = await prisma.institution.findFirst({
      where: { createdBy: session.user.id }
    });

    if (existingInstitution) {
      return NextResponse.json(
        { error: "User already has an institution" },
        { status: 400 }
      );
    }

    const institution = await prisma.institution.create({
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
        isActive: isActive ?? true,
        createdBy: session.user.id,
        password: "default-password" // Required field
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
      institution
    });

  } catch (error) {
    console.error("Error creating institution:", error);
    return NextResponse.json(
      { error: "Failed to create institution" },
      { status: 500 }
    );
  }
}
