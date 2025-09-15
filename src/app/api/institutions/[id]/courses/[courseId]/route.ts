import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateCourseSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  thumbnail: z.string().optional(),
  videoPreview: z.string().optional(),
  objectives: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional(),
  duration: z.number().int().positive().optional(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  category: z.enum(["SOFT_SKILLS", "BASIC_COMPETENCIES", "JOB_PLACEMENT", "ENTREPRENEURSHIP", "TECHNICAL_SKILLS", "DIGITAL_LITERACY", "COMMUNICATION", "LEADERSHIP"]).optional(),
  isMandatory: z.boolean().optional(),
  isActive: z.boolean().optional(),
  rating: z.number().optional(),
  studentsCount: z.number().int().optional(),
  completionRate: z.number().optional(),
  totalLessons: z.number().int().optional(),
  totalQuizzes: z.number().int().optional(),
  totalResources: z.number().int().optional(),
  tags: z.array(z.string()).optional(),
  certification: z.boolean().optional(),
  includedMaterials: z.array(z.string()).optional(),
  instructorId: z.string().optional(),
  institutionName: z.string().optional(),
  publishedAt: z.string().datetime().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; courseId: string }> }
) {
  try {
    const { id: institutionId, courseId } = await params;
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        institutionId: institutionId,
      },
      include: {
        instructor: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
            avatarUrl: true,
          },
        },
        enrollments: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { enrolledAt: "desc" },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; courseId: string }> }
) {
  try {
    const { id: institutionId, courseId } = await params;
    const body = await request.json();
    const validatedData = updateCourseSchema.parse(body);

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

    // Generate slug from title if title is being updated
    let updateData: any = { ...validatedData };
    if (validatedData.title) {
      const slug = validatedData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      // Check if slug already exists (excluding current course)
      const existingCourse = await prisma.course.findFirst({
        where: {
          slug: slug,
          id: { not: courseId },
        },
      });

      if (existingCourse) {
        return NextResponse.json(
          { error: "A course with this title already exists" },
          { status: 400 }
        );
      }

      updateData.slug = slug;
    }

    // Verify course belongs to institution
    const existingCourse = await prisma.course.findFirst({
      where: {
        id: courseId,
        institutionId: institutionId,
      },
    });

    if (!existingCourse) {
      return NextResponse.json(
        { error: "Course not found in this institution" },
        { status: 404 }
      );
    }

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: updateData,
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
    });

    return NextResponse.json(updatedCourse);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error updating course:", error);
    return NextResponse.json(
      { error: "Failed to update course" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; courseId: string }> }
) {
  try {
    const { id: institutionId, courseId } = await params;
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

    // Verify course belongs to institution
    const existingCourse = await prisma.course.findFirst({
      where: {
        id: courseId,
        institutionId: institutionId,
      },
    });

    if (!existingCourse) {
      return NextResponse.json(
        { error: "Course not found in this institution" },
        { status: 404 }
      );
    }

    // Check if course has active enrollments
    const activeEnrollments = await prisma.courseEnrollment.count({
      where: {
        courseId: courseId,
        status: "active",
      },
    });

    if (activeEnrollments > 0) {
      return NextResponse.json(
        { error: "Cannot delete course with active enrollments" },
        { status: 400 }
      );
    }

    // Delete course
    await prisma.course.delete({
      where: { id: courseId },
    });

    return NextResponse.json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      { error: "Failed to delete course" },
      { status: 500 }
    );
  }
}
