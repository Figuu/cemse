import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createJobSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  description: z.string().min(1, "Job description is required"),
  requirements: z.array(z.string()).default([]),
  responsibilities: z.array(z.string()).default([]),
  benefits: z.array(z.string()).default([]),
  location: z.string().min(1, "Location is required"),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  remoteWork: z.boolean().default(false),
  hybridWork: z.boolean().default(false),
  officeWork: z.boolean().default(true),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "FREELANCE", "TEMPORARY"]),
  experienceLevel: z.enum(["ENTRY_LEVEL", "MID_LEVEL", "SENIOR_LEVEL", "EXECUTIVE", "INTERN"]),
  educationRequired: z.enum(["PRIMARY", "SECONDARY", "TECHNICAL", "UNIVERSITY", "POSTGRADUATE", "OTHER"]).optional(),
  skills: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  salaryMin: z.number().positive().optional(),
  salaryMax: z.number().positive().optional(),
  currency: z.string().default("BOB"),
  applicationDeadline: z.string().datetime().optional(),
  startDate: z.string().datetime().optional(),
  department: z.string().optional(),
  reportingTo: z.string().optional(),
  isUrgent: z.boolean().default(false),
  featured: z.boolean().default(false),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const employmentType = searchParams.get("employmentType") || "";
    const experienceLevel = searchParams.get("experienceLevel") || "";
    const location = searchParams.get("location") || "";
    const isActive = searchParams.get("isActive");
    const isUrgent = searchParams.get("isUrgent");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    const { id: companyId } = await params;
    const where: Record<string, unknown> = {
      companyId: companyId,
    };

    if (isActive !== null) {
      where.isActive = isActive === "true";
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { department: { contains: search, mode: "insensitive" } },
        { tags: { has: search } },
        { skills: { has: search } },
      ];
    }

    if (employmentType) {
      where.employmentType = employmentType;
    }

    if (experienceLevel) {
      where.experienceLevel = experienceLevel;
    }

    if (location) {
      where.OR = [
        { location: { contains: location, mode: "insensitive" } },
        { city: { contains: location, mode: "insensitive" } },
        { state: { contains: location, mode: "insensitive" } },
        { country: { contains: location, mode: "insensitive" } },
      ];
    }

    if (isUrgent !== null) {
      where.isUrgent = isUrgent === "true";
    }

    const orderBy: Record<string, string> = {};
    orderBy[sortBy] = sortOrder;

    const [jobs, total] = await Promise.all([
      prisma.jobOffer.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
              businessSector: true,
              address: true,
            },
          },
          _count: {
            select: {
              applications: true,
            },
          },
        },
      }),
      prisma.jobOffer.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      jobs,
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
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createJobSchema.parse(body);

    const { id: companyId } = await params;
    const userId = session.user.id;

    // Check if user owns the company
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { ownerId: true },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    if (company.ownerId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const job = await prisma.jobOffer.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        requirements: validatedData.requirements.join('\n'),
        responsibilities: validatedData.responsibilities,
        benefits: validatedData.benefits.join('\n'),
        location: validatedData.location,
        city: validatedData.city,
        state: validatedData.state,
        country: validatedData.country,
        municipality: validatedData.location, // Use location as municipality for now
        department: validatedData.department || "Cochabamba",
        contractType: validatedData.employmentType as any,
        workSchedule: "Full Time", // Default value
        workModality: validatedData.remoteWork ? "REMOTE" : validatedData.hybridWork ? "HYBRID" : "ON_SITE",
        experienceLevel: validatedData.experienceLevel as any,
        educationRequired: validatedData.educationRequired as any,
        skillsRequired: validatedData.skills,
        desiredSkills: [],
        skills: validatedData.skills,
        tags: validatedData.tags,
        salaryMin: validatedData.salaryMin,
        salaryMax: validatedData.salaryMax,
        salaryCurrency: validatedData.currency,
        applicationDeadline: validatedData.applicationDeadline ? new Date(validatedData.applicationDeadline) : null,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
        reportingTo: validatedData.reportingTo,
        isUrgent: validatedData.isUrgent,
        featured: validatedData.featured,
        companyId: companyId,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            businessSector: true,
            address: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error creating job:", error);
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 }
    );
  }
}
