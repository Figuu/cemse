import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateEnrollmentSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE", "COMPLETED", "DROPPED", "SUSPENDED"]).optional(),
  grade: z.number().min(0).max(100).optional(),
  credits: z.number().int().positive().optional(),
  semester: z.string().optional(),
  year: z.number().int().positive().optional(),
  notes: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; enrollmentId: string }> }
) {
  try {
    const { id: institutionId, enrollmentId } = await params;
    const enrollment = await prisma.institutionEnrollment.findFirst({
      where: {
        id: enrollmentId,
        institutionId: institutionId,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
            studentNumber: true,
            phone: true,
            address: true,
            city: true,
            state: true,
            country: true,
          },
        },
        program: {
          select: {
            id: true,
            name: true,
            description: true,
            level: true,
            duration: true,
            credits: true,
            status: true,
          },
        },
        course: {
          select: {
            id: true,
            name: true,
            description: true,
            code: true,
            credits: true,
            level: true,
            status: true,
            schedule: true,
            location: true,
            prerequisites: true,
          },
        },
        institution: {
          select: {
            id: true,
            name: true,
            department: true,
            region: true,
            institutionType: true,
          },
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(enrollment);
  } catch (error) {
    console.error("Error fetching enrollment:", error);
    return NextResponse.json(
      { error: "Failed to fetch enrollment" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; enrollmentId: string }> }
) {
  try {
    const { id: institutionId, enrollmentId } = await params;
    const body = await request.json();
    const validatedData = updateEnrollmentSchema.parse(body);

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

    // Get current enrollment data
    const currentEnrollment = await prisma.institutionEnrollment.findFirst({
      where: {
        id: enrollmentId,
        institutionId: institutionId,
      },
      select: {
        courseId: true,
        status: true,
      },
    });

    if (!currentEnrollment) {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 }
      );
    }

    const updatedEnrollment = await prisma.institutionEnrollment.update({
      where: { id: enrollmentId },
      data: validatedData,
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
        program: {
          select: {
            id: true,
            name: true,
            level: true,
          },
        },
        course: {
          select: {
            id: true,
            name: true,
            code: true,
            credits: true,
            level: true,
          },
        },
      },
    });

    // Update course student count if status changed from/to ACTIVE
    if (currentEnrollment.courseId && validatedData.status) {
      if (currentEnrollment.status === "ACTIVE" && validatedData.status !== "ACTIVE") {
        // Student is no longer active, decrement count
        await prisma.institutionCourse.update({
          where: { id: currentEnrollment.courseId },
          data: { currentStudents: { decrement: 1 } },
        });
      } else if (currentEnrollment.status !== "ACTIVE" && validatedData.status === "ACTIVE") {
        // Student is now active, increment count
        await prisma.institutionCourse.update({
          where: { id: currentEnrollment.courseId },
          data: { currentStudents: { increment: 1 } },
        });
      }
    }

    return NextResponse.json(updatedEnrollment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating enrollment:", error);
    return NextResponse.json(
      { error: "Failed to update enrollment" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; enrollmentId: string }> }
) {
  try {
    const { id: institutionId, enrollmentId } = await params;
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

    // Get current enrollment data
    const currentEnrollment = await prisma.institutionEnrollment.findFirst({
      where: {
        id: enrollmentId,
        institutionId: institutionId,
      },
      select: {
        courseId: true,
        status: true,
      },
    });

    if (!currentEnrollment) {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 }
      );
    }

    // Delete enrollment
    await prisma.institutionEnrollment.delete({
      where: { id: enrollmentId },
    });

    // Update course student count if student was active
    if (currentEnrollment.courseId && currentEnrollment.status === "ACTIVE") {
      await prisma.institutionCourse.update({
        where: { id: currentEnrollment.courseId },
        data: { currentStudents: { decrement: 1 } },
      });
    }

    return NextResponse.json({ message: "Enrollment deleted successfully" });
  } catch (error) {
    console.error("Error deleting enrollment:", error);
    return NextResponse.json(
      { error: "Failed to delete enrollment" },
      { status: 500 }
    );
  }
}
