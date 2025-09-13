import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateStudentSchema = z.object({
  studentNumber: z.string().min(1).optional(),
  programId: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "GRADUATED", "DROPPED_OUT", "TRANSFERRED"]).optional(),
  graduationDate: z.string().datetime().optional(),
  gpa: z.number().min(0).max(4).optional(),
  notes: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; studentId: string } }
) {
  try {
    const student = await prisma.institutionStudent.findFirst({
      where: {
        id: params.studentId,
        institutionId: params.id,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatarUrl: true,
            birthDate: true,
            gender: true,
            address: true,
            city: true,
            state: true,
            country: true,
            educationLevel: true,
            currentInstitution: true,
            graduationYear: true,
            skills: true,
            interests: true,
            socialLinks: true,
            workExperience: true,
            achievements: true,
            academicAchievements: true,
            currentDegree: true,
            universityName: true,
            universityStatus: true,
            gpa: true,
            languages: true,
            projects: true,
            skillsWithLevel: true,
            websites: true,
            extracurricularActivities: true,
            professionalSummary: true,
            targetPosition: true,
            targetCompany: true,
            relevantSkills: true,
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
        institution: {
          select: {
            id: true,
            name: true,
            department: true,
            region: true,
            institutionType: true,
          },
        },
        enrollments: {
          include: {
            course: {
              select: {
                id: true,
                name: true,
                code: true,
                credits: true,
                level: true,
                status: true,
              },
            },
            program: {
              select: {
                id: true,
                name: true,
                level: true,
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

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error("Error fetching student:", error);
    return NextResponse.json(
      { error: "Failed to fetch student" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; studentId: string } }
) {
  try {
    const body = await request.json();
    const validatedData = updateStudentSchema.parse(body);

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

    // Get current student data
    const currentStudent = await prisma.institutionStudent.findFirst({
      where: {
        id: params.studentId,
        institutionId: params.id,
      },
      select: {
        programId: true,
        status: true,
      },
    });

    if (!currentStudent) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    // Check if student number is already taken (if being updated)
    if (validatedData.studentNumber) {
      const existingStudentNumber = await prisma.institutionStudent.findFirst({
        where: {
          studentNumber: validatedData.studentNumber,
          id: { not: params.studentId },
        },
      });

      if (existingStudentNumber) {
        return NextResponse.json(
          { error: "Student number already taken" },
          { status: 400 }
        );
      }
    }

    const updatedStudent = await prisma.institutionStudent.update({
      where: { id: params.studentId },
      data: validatedData,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatarUrl: true,
            birthDate: true,
            gender: true,
          },
        },
        program: {
          select: {
            id: true,
            name: true,
            level: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    // Update program student counts if program changed
    if (validatedData.programId && validatedData.programId !== currentStudent.programId) {
      // Decrement old program count
      if (currentStudent.programId) {
        await prisma.institutionProgram.update({
          where: { id: currentStudent.programId },
          data: { currentStudents: { decrement: 1 } },
        });
      }

      // Increment new program count
      await prisma.institutionProgram.update({
        where: { id: validatedData.programId },
        data: { currentStudents: { increment: 1 } },
      });
    }

    return NextResponse.json(updatedStudent);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating student:", error);
    return NextResponse.json(
      { error: "Failed to update student" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; studentId: string } }
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

    // Get current student data
    const currentStudent = await prisma.institutionStudent.findFirst({
      where: {
        id: params.studentId,
        institutionId: params.id,
      },
      select: {
        programId: true,
      },
    });

    if (!currentStudent) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    // Delete student
    await prisma.institutionStudent.delete({
      where: { id: params.studentId },
    });

    // Update program student count
    if (currentStudent.programId) {
      await prisma.institutionProgram.update({
        where: { id: currentStudent.programId },
        data: { currentStudents: { decrement: 1 } },
      });
    }

    return NextResponse.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json(
      { error: "Failed to delete student" },
      { status: 500 }
    );
  }
}
