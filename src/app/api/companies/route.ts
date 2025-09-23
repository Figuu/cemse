import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Custom URL validation that accepts both relative and absolute URLs
const urlOrEmptyString = z.string().optional().refine((val) => {
  if (!val || val === "") return true; // Allow empty strings
  // Allow relative URLs (starting with /) or absolute URLs (starting with http/https)
  return val.startsWith("/") || val.startsWith("http://") || val.startsWith("https://");
}, {
  message: "Must be a valid URL (relative or absolute) or be empty"
}).or(z.literal(""));

const createCompanySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  description: z.string().optional(),
  website: urlOrEmptyString,
  logo: urlOrEmptyString,
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
  socialMedia: z.record(z.string(), z.string()).optional(),
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

    const where: Record<string, unknown> = {
      isActive: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { businessSector: { contains: search, mode: "insensitive" } },
      ];
    }

    if (industry) {
      where.businessSector = { contains: industry, mode: "insensitive" };
    }

    if (size) {
      where.companySize = size;
    }

    if (location) {
      where.address = { contains: location, mode: "insensitive" };
    }

    if (isVerified !== null) {
      where.isVerified = isVerified === "true";
    }

    if (isFeatured !== null) {
      where.isFeatured = isFeatured === "true";
    }

    const orderBy: Record<string, string> = {};
    orderBy[sortBy] = sortOrder;

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        orderBy,
        skip,
        take: limit,
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
            },
          },
        },
      }),
      prisma.company.count({ where }),
    ]);

    // Transform the data to match the expected Company interface
    const transformedCompanies = companies.map(company => ({
      ...company,
      // Map database fields to interface fields
      logo: company.logoUrl,
      industry: company.businessSector,
      size: company.companySize,
      location: company.address,
      isVerified: false, // Default value since not in schema
      socialMedia: {},
      benefits: [],
      culture: undefined,
      mission: undefined,
      vision: undefined,
      values: [],
      technologies: [],
      languages: [],
      remoteWork: false,
      hybridWork: false,
      officeWork: true,
      totalEmployees: company._count.employees,
      totalJobs: company._count.jobOffers,
      totalApplications: 0, // Would need to calculate from job applications
      averageRating: 0, // Would need to calculate from reviews
      totalReviews: 0, // Would need to calculate from reviews
      views: 0, // Would need to track views
      followers: 0, // Would need to track followers
      isPublic: true,
      isFeatured: false,
      owner: company.creator,
      jobs: [],
      reviews: [],
      followersList: [],
      _count: {
        jobs: company._count.jobOffers,
        reviews: 0,
        followersList: 0,
        applications: 0,
      },
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      companies: transformedCompanies,
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
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a company
    if (session.user.role !== "COMPANIES") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createCompanySchema.parse(body);

    // Check if user already has a company
    const existingCompany = await prisma.company.findFirst({
      where: { createdBy: session.user.id }
    });

    if (existingCompany) {
      return NextResponse.json(
        { error: "User already has a company" },
        { status: 400 }
      );
    }

    const company = await prisma.company.create({
      data: {
        ...validatedData,
        createdBy: session.user.id,
        ownerId: session.user.id,
        password: "default-password", // This should be properly handled in production
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
          },
        },
      },
    });

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
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
