import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BusinessStage } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const category = searchParams.get("category");
    const businessStage = searchParams.get("businessStage") as BusinessStage;
    const municipality = searchParams.get("municipality");
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;

    const where: any = {
      ownerId: session.user.id,
    };

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
    console.error("Error fetching my entrepreneurships:", error);
    return NextResponse.json(
      { error: "Failed to fetch my entrepreneurships" },
      { status: 500 }
    );
  }
}


