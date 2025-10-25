import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createCourseSchema = z.object({
  title: z.string().min(1, "Course title is required"),
  description: z.string().min(1, "Course description is required"),
  shortDescription: z.string().optional(),
  thumbnail: z.string().optional(),
  videoPreview: z.string().optional(),
  objectives: z.array(z.string()).default([]),
  prerequisites: z.array(z.string()).default([]),
  duration: z.number().int().positive("Duration must be positive"),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  category: z.enum(["SOFT_SKILLS", "BASIC_COMPETENCIES", "JOB_PLACEMENT", "ENTREPRENEURSHIP", "TECHNICAL_SKILLS", "DIGITAL_LITERACY", "COMMUNICATION", "LEADERSHIP"]),
  isMandatory: z.boolean().default(false),
  isActive: z.boolean().default(true),
  rating: z.number().default(0),
  studentsCount: z.number().int().default(0),
  completionRate: z.number().default(0),
  totalLessons: z.number().int().default(0),
  totalQuizzes: z.number().int().default(0),
  totalResources: z.number().int().default(0),
  tags: z.array(z.string()).default([]),
  certification: z.boolean().default(true),
  includedMaterials: z.array(z.string()).default([]),
  instructorId: z.string().optional(),
  institutionName: z.string().optional(),
  publishedAt: z.string().datetime().optional(),
});


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const level = searchParams.get("level") || "";
    const category = searchParams.get("category") || "";
    const instructorId = searchParams.get("instructorId") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    const { id: institutionId } = await params;
    
    // Debug institution ID
    console.log('Institution ID from params:', institutionId);
    
    const where: any = {
      institutionId: institutionId,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { shortDescription: { contains: search, mode: "insensitive" } },
      ];
    }

    if (level) {
      where.level = level;
    }

    if (category) {
      where.category = category;
    }

    if (instructorId) {
      where.instructorId = instructorId;
    }

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Debug logging
    console.log('Courses API Debug:', {
      institutionId,
      where,
      page,
      limit,
      search,
      level,
      category,
      instructorId,
      sortBy,
      sortOrder,
    });

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          instructor: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              enrollments: true,
            },
          },
        },
      }),
      prisma.course.count({ where }),
    ]);

    console.log('Courses Query Result:', {
      coursesCount: courses.length,
      total,
      courses: courses.map(c => ({
        id: c.id,
        title: c.title,
        institutionId: c.institutionId,
        isActive: c.isActive,
        studentsCount: c.studentsCount,
      })),
    });

    const totalPages = Math.ceil(total / limit);

    const response = {
      courses,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };

    console.log('Courses API Response:', {
      coursesCount: response.courses.length,
      pagination: response.pagination,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching courses:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return NextResponse.json(
      { error: "Failed to fetch courses", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: institutionId } = await params;
    const body = await request.json();
    const validatedData = createCourseSchema.parse(body);

    // Get user ID from session (in real app, this would come from auth)
    const userId = "user-1"; // Mock user ID

    // Check if user has permission to manage this institution
    const institution = await prisma.institution.findUnique({
      where: { id: institutionId },
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

    // Generate slug from title
    const slug = validatedData.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Check if slug already exists
    const existingCourse = await prisma.course.findFirst({
      where: {
        slug: slug,
      },
    });

    if (existingCourse) {
      return NextResponse.json(
        { error: "A course with this title already exists" },
        { status: 400 }
      );
    }

    const course = await prisma.course.create({
      data: {
        ...validatedData,
        slug: slug,
        institutionId: institutionId,
      },
      include: {
        instructor: {
          select: {
            firstName: true,
            lastName: true,
            user: {
              select: {
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
        { error: "Validation error", details: error.issues },
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
