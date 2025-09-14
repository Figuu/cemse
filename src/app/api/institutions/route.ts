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
      whereClause.type = type;
    }

    if (city && city !== "all") {
      whereClause.city = city;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } }
      ];
    }

    const institutions = await prisma.institution.findMany({
      where: whereClause,
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

    // Validate required fields
    if (!name || !description || !type || !city || !country) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already has an institution
    const existingInstitution = await prisma.institution.findFirst({
      where: { userId: session.user.id }
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
        description,
        type,
        city,
        country,
        website,
        phone,
        email,
        logoUrl,
        isActive: isActive ?? true,
        userId: session.user.id
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
