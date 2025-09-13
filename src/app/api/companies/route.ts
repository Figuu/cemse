import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createCompanySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  description: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  logo: z.string().url().optional().or(z.literal("")),
  industry: z.string().optional(),
  size: z.enum(["STARTUP", "SMALL", "MEDIUM", "LARGE", "ENTERPRISE"]).optional(),
  location: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  foundedYear: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  socialMedia: z.record(z.string()).optional(),
  benefits: z.array(z.string()).default([]),
  culture: z.string().optional(),
  mission: z.string().optional(),
  vision: z.string().optional(),
  values: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
  remoteWork: z.boolean().default(false),
  hybridWork: z.boolean().default(false),
  officeWork: z.boolean().default(true),
  totalEmployees: z.number().int().positive().optional(),
  isPublic: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

const updateCompanySchema = createCompanySchema.partial();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const industry = searchParams.get("industry") || "";
    const size = searchParams.get("size") || "";
    const location = searchParams.get("location") || "";
    const isVerified = searchParams.get("isVerified");
    const isFeatured = searchParams.get("isFeatured");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { industry: { contains: search, mode: "insensitive" } },
      ];
    }

    if (industry) {
      where.industry = { contains: industry, mode: "insensitive" };
    }

    if (size) {
      where.size = size;
    }

    if (location) {
      where.OR = [
        { location: { contains: location, mode: "insensitive" } },
        { city: { contains: location, mode: "insensitive" } },
        { state: { contains: location, mode: "insensitive" } },
        { country: { contains: location, mode: "insensitive" } },
      ];
    }

    if (isVerified !== null) {
      where.isVerified = isVerified === "true";
    }

    if (isFeatured !== null) {
      where.isFeatured = isFeatured === "true";
    }

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          owner: {
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
              jobs: true,
              reviews: true,
              followersList: true,
            },
          },
        },
      }),
      prisma.company.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      companies,
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
    console.error("Error fetching companies:", error);
    return NextResponse.json(
      { error: "Failed to fetch companies" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createCompanySchema.parse(body);

    // Get user ID from session (in real app, this would come from auth)
    const userId = "user-1"; // Mock user ID

    const company = await prisma.company.create({
      data: {
        ...validatedData,
        ownerId: userId,
      },
      include: {
        owner: {
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
            jobs: true,
            reviews: true,
            followersList: true,
          },
        },
      },
    });

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating company:", error);
    return NextResponse.json(
      { error: "Failed to create company" },
      { status: 500 }
    );
  }
}
