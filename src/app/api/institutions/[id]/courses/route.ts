import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createCourseSchema = z.object({
  name: z.string().min(1, "Course name is required"),
  description: z.string().optional(),
  code: z.string().min(1, "Course code is required"),
  credits: z.number().int().positive("Credits must be positive"),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]),
  status: z.enum(["ACTIVE", "INACTIVE", "COMPLETED", "CANCELLED"]).default("ACTIVE"),
  programId: z.string().optional(),
  instructorId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  maxStudents: z.number().int().positive().optional(),
  schedule: z.string().optional(),
  location: z.string().optional(),
  prerequisites: z.array(z.string()).default([]),
});

const updateCourseSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  code: z.string().min(1).optional(),
  credits: z.number().int().positive().optional(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "COMPLETED", "CANCELLED"]).optional(),
  programId: z.string().optional(),
  instructorId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  maxStudents: z.number().int().positive().optional(),
  schedule: z.string().optional(),
  location: z.string().optional(),
  prerequisites: z.array(z.string()).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const level = searchParams.get("level") || "";
    const programId = searchParams.get("programId") || "";
    const instructorId = searchParams.get("instructorId") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    const where: any = {
      institutionId: params.id,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (level) {
      where.level = level;
    }

    if (programId) {
      where.programId = programId;
    }

    if (instructorId) {
      where.instructorId = instructorId;
    }

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [courses, total] = await Promise.all([
      prisma.institutionCourse.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          program: {
            select: {
              id: true,
              name: true,
              level: true,
            },
          },
          instructor: {
            select: {
              id: true,
              instructor: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          _count: {
            select: {
              enrollments: true,
            },
          },
        },
      }),
      prisma.institutionCourse.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      courses,
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
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = createCourseSchema.parse(body);

    // Get user ID from session (in real app, this would come from auth)
    const userId = "user-1"; // Mock user ID

    // Check if user has permission to manage this institution
    const institution = await prisma.institution.findUnique({
      where: { id: params.id },
      select: { createdBy: true },
    });

    if (!institution) {
      return NextResponse.json(
        { error: "Institution not found" },
        { status: 404 }
      );
    }

    if (institution.createdBy !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Check if course code is already taken in this institution
    const existingCourse = await prisma.institutionCourse.findFirst({
      where: {
        code: validatedData.code,
        institutionId: params.id,
      },
    });

    if (existingCourse) {
      return NextResponse.json(
        { error: "Course code already exists in this institution" },
        { status: 400 }
      );
    }

    const course = await prisma.institutionCourse.create({
      data: {
        ...validatedData,
        institutionId: params.id,
      },
      include: {
        program: {
          select: {
            id: true,
            name: true,
            level: true,
          },
        },
        instructor: {
          select: {
            id: true,
            instructor: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}
