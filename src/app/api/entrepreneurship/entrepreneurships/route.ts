import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BusinessStage } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const category = searchParams.get("category");
    const businessStage = searchParams.get("businessStage") as BusinessStage;
    const municipality = searchParams.get("municipality");
    const search = searchParams.get("search");
    const ownerId = searchParams.get("ownerId");

    const skip = (page - 1) * limit;

    const where: any = {
      isPublic: true,
      isActive: true,
    };

    if (ownerId) {
      where.ownerId = ownerId;
    }

    if (category) {
      where.category = category;
    }

    if (businessStage) {
      where.businessStage = businessStage;
    }

    if (municipality) {
      where.municipality = municipality;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
        { subcategory: { contains: search, mode: "insensitive" } },
      ];
    }

    const [entrepreneurships, total] = await Promise.all([
      prisma.entrepreneurship.findMany({
        where,
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
        orderBy: [
          { createdAt: "desc" },
        ],
        skip,
        take: limit,
      }),
      prisma.entrepreneurship.count({ where }),
    ]);

    return NextResponse.json({
      entrepreneurships,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching entrepreneurships:", error);
    return NextResponse.json(
      { error: "Failed to fetch entrepreneurships" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let body;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    body = await request.json();
    const {
      name,
      description,
      category,
      subcategory,
      businessStage,
      logo,
      images = [],
      website,
      email,
      phone,
      address,
      municipality,
      department = "Cochabamba",
      socialMedia,
      founded,
      employees,
      annualRevenue,
      businessModel,
      targetMarket,
      isPublic = true,
    } = body;

    // Validate businessStage
    const validBusinessStages = ['IDEA', 'STARTUP', 'GROWTH', 'MATURE', 'SCALE'];
    if (!validBusinessStages.includes(businessStage)) {
      return NextResponse.json(
        { error: "Invalid business stage", details: `businessStage must be one of: ${validBusinessStages.join(', ')}` },
        { status: 400 }
      );
    }

    const entrepreneurship = await prisma.entrepreneurship.create({
      data: {
        name,
        description,
        category,
        subcategory,
        businessStage: businessStage as BusinessStage,
        logo,
        images,
        website,
        email,
        phone,
        address,
        municipality,
        department,
        socialMedia: socialMedia && typeof socialMedia === 'string' ? JSON.parse(socialMedia) : socialMedia,
        founded: founded ? new Date(founded) : null,
        employees: employees ? parseInt(employees) : null,
        annualRevenue: annualRevenue ? parseFloat(annualRevenue) : null,
        businessModel,
        targetMarket,
        isPublic,
        ownerId: session.user.id,
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

    return NextResponse.json(entrepreneurship, { status: 201 });
  } catch (error) {
    console.error("Error creating entrepreneurship:", error);
    console.error("Request body:", body);
    return NextResponse.json(
      { error: "Failed to create entrepreneurship", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
