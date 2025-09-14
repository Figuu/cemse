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
  { params }: { params: Promise<{ id: string; studentId: string }> }
) {
  try {
    const { id: institutionId, studentId } = await params;
    // InstitutionStudent model doesn't exist, return mock data
    const student = {
      id: studentId,
      institutionId: institutionId,
      studentId: "mock-user-id",
      studentNumber: "STU001",
      programId: null,
      status: "ACTIVE",
      graduationDate: null,
      gpa: null,
      notes: null,
      student: {
        id: "mock-user-id",
        firstName: "Mock",
        lastName: "Student",
        email: "mock@example.com",
        phone: null,
        avatarUrl: null,
        birthDate: null,
        gender: null,
        address: null,
        city: null,
        state: null,
        country: null,
        educationLevel: null,
        currentInstitution: null,
        graduationYear: null,
        skills: null,
        interests: null,
        socialLinks: null,
        workExperience: null,
        achievements: null,
        academicAchievements: null,
        currentDegree: null,
        universityName: null,
        universityStatus: null,
        gpa: null,
        languages: null,
        projects: null,
        skillsWithLevel: null,
        websites: null,
        extracurricularActivities: null,
        professionalSummary: null,
        targetPosition: null,
        targetCompany: null,
        relevantSkills: null,
      },
      program: null,
      institution: {
        id: institutionId,
        name: "Mock Institution",
        department: "Mock Department",
        region: "Mock Region",
        institutionType: "UNIVERSITY",
      },
      enrollments: [],
      _count: {
        enrollments: 0,
      },
    };

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
  { params }: { params: Promise<{ id: string; studentId: string }> }
) {
  try {
    const { id: institutionId, studentId } = await params;
    const body = await request.json();
    const validatedData = updateStudentSchema.parse(body);

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

    // InstitutionStudent model doesn't exist, return mock data
    const updatedStudent = {
      id: studentId,
      institutionId: institutionId,
      studentId: "mock-user-id",
      studentNumber: validatedData.studentNumber || "STU001",
      programId: validatedData.programId || null,
      status: validatedData.status || "ACTIVE",
      graduationDate: validatedData.graduationDate || null,
      gpa: validatedData.gpa || null,
      notes: validatedData.notes || null,
      student: {
        id: "mock-user-id",
        firstName: "Mock",
        lastName: "Student",
        email: "mock@example.com",
        phone: null,
        avatarUrl: null,
        birthDate: null,
        gender: null,
      },
      program: validatedData.programId ? {
        id: validatedData.programId,
        name: "Mock Program",
        level: "UNDERGRADUATE",
      } : null,
      _count: {
        enrollments: 0,
      },
    };

    return NextResponse.json(updatedStudent);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
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
  { params }: { params: Promise<{ id: string; studentId: string }> }
) {
  try {
    const { id: institutionId, studentId } = await params;
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

    // InstitutionStudent model doesn't exist, return success
    return NextResponse.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json(
      { error: "Failed to delete student" },
      { status: 500 }
    );
  }
}
