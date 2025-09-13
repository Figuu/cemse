import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

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
  { params }: { params: { id: string; courseId: string } }
) {
  try {
    const course = await prisma.institutionCourse.findFirst({
      where: {
        id: params.courseId,
        institutionId: params.id,
      },
      include: {
        institution: {
          select: {
            id: true,
            name: true,
            department: true,
            region: true,
            institutionType: true,
          },
        },
        program: {
          select: {
            id: true,
            name: true,
            level: true,
            duration: true,
            credits: true,
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
                phone: true,
                avatarUrl: true,
              },
            },
            department: true,
            position: true,
            qualifications: true,
            specializations: true,
          },
        },
        enrollments: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatarUrl: true,
                studentNumber: true,
              },
            },
          },
          orderBy: { enrollmentDate: "desc" },
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
  { params }: { params: { id: string; courseId: string } }
) {
  try {
    const body = await request.json();
    const validatedData = updateCourseSchema.parse(body);

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

    // Check if course code is already taken (if being updated)
    if (validatedData.code) {
      const existingCourse = await prisma.institutionCourse.findFirst({
        where: {
          code: validatedData.code,
          institutionId: params.id,
          id: { not: params.courseId },
        },
      });

      if (existingCourse) {
        return NextResponse.json(
          { error: "Course code already exists in this institution" },
          { status: 400 }
        );
      }
    }

    const updatedCourse = await prisma.institutionCourse.update({
      where: { id: params.courseId },
      data: validatedData,
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

    return NextResponse.json(updatedCourse);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
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
  { params }: { params: { id: string; courseId: string } }
) {
  try {
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

    // Check if course has active enrollments
    const activeEnrollments = await prisma.institutionEnrollment.count({
      where: {
        courseId: params.courseId,
        status: "ACTIVE",
      },
    });

    if (activeEnrollments > 0) {
      return NextResponse.json(
        { error: "Cannot delete course with active enrollments" },
        { status: 400 }
      );
    }

    // Delete course
    await prisma.institutionCourse.delete({
      where: { id: params.courseId },
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
