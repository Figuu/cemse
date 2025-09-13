import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createStartupSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100, "El nombre es muy largo"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres").max(1000, "La descripción es muy larga"),
  category: z.string().min(1, "La categoría es requerida"),
  subcategory: z.string().optional(),
  businessStage: z.enum(["IDEA", "STARTUP", "GROWING", "ESTABLISHED"]),
  logo: z.string().url().optional(),
  images: z.array(z.string().url()).optional().default([]),
  website: z.string().url().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  municipality: z.string().min(1, "El municipio es requerido"),
  department: z.string().default("Cochabamba"),
  socialMedia: z.object({
    facebook: z.string().url().optional(),
    twitter: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    instagram: z.string().url().optional(),
  }).optional(),
  founded: z.string().datetime().optional(),
  employees: z.number().int().min(0).optional(),
  annualRevenue: z.number().min(0).optional(),
  businessModel: z.string().optional(),
  targetMarket: z.string().optional(),
  isPublic: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const businessStage = searchParams.get("businessStage");
    const municipality = searchParams.get("municipality");
    const isPublic = searchParams.get("isPublic");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      isActive: true,
    };

    if (isPublic !== null) {
      where.isPublic = isPublic === "true";
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
        { subcategory: { contains: search, mode: "insensitive" } },
      ];
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

    // Build orderBy clause
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [startups, total] = await Promise.all([
      prisma.entrepreneurship.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
          businessPlan: {
            select: {
              id: true,
              executiveSummary: true,
            },
          },
          _count: {
            select: {
              // Add any relations that need counting
            },
          },
        },
      }),
      prisma.entrepreneurship.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      startups,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });

  } catch (error) {
    console.error("Error fetching startups:", error);
    return NextResponse.json(
      { error: "Failed to fetch startups" },
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
    const validatedData = createStartupSchema.parse(body);

    // Check if user already has a startup
    const existingStartup = await prisma.entrepreneurship.findFirst({
      where: {
        ownerId: session.user.id,
        isActive: true,
      },
    });

    if (existingStartup) {
      return NextResponse.json(
        { error: "Ya tienes una startup registrada" },
        { status: 400 }
      );
    }

    // Create startup
    const startup = await prisma.entrepreneurship.create({
      data: {
        ...validatedData,
        ownerId: session.user.id,
        founded: validatedData.founded ? new Date(validatedData.founded) : null,
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

    return NextResponse.json({
      success: true,
      startup,
      message: "Startup creada exitosamente",
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating startup:", error);
    return NextResponse.json(
      { error: "Failed to create startup" },
      { status: 500 }
    );
  }
}
