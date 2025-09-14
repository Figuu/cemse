import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createEnrollmentSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  programId: z.string().optional(),
  courseId: z.string().optional(),
  semester: z.string().optional(),
  year: z.number().int().positive().optional(),
  notes: z.string().optional(),
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
    const status = searchParams.get("status") || "";
    const programId = searchParams.get("programId") || "";
    const courseId = searchParams.get("courseId") || "";
    const semester = searchParams.get("semester") || "";
    const year = searchParams.get("year") || "";
    const sortBy = searchParams.get("sortBy") || "enrollmentDate";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    const { id: institutionId } = await params;
    const where: any = {
      institutionId: institutionId,
    };

    if (search) {
      where.OR = [
        { student: { firstName: { contains: search, mode: "insensitive" } } },
        { student: { lastName: { contains: search, mode: "insensitive" } } },
        { student: { email: { contains: search, mode: "insensitive" } } },
        { program: { name: { contains: search, mode: "insensitive" } } },
        { course: { name: { contains: search, mode: "insensitive" } } },
        { course: { code: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (programId) {
      where.programId = programId;
    }

    if (courseId) {
      where.courseId = courseId;
    }

    if (semester) {
      where.semester = semester;
    }

    if (year) {
      where.year = parseInt(year);
    }

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // InstitutionEnrollment model doesn't exist, return empty data
    const enrollments: any[] = [];
    const total = 0;

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      enrollments,
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
    console.error("Error fetching enrollments:", error);
    return NextResponse.json(
      { error: "Failed to fetch enrollments" },
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
    const validatedData = createEnrollmentSchema.parse(body);

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

    // Validate that either programId or courseId is provided
    if (!validatedData.programId && !validatedData.courseId) {
      return NextResponse.json(
        { error: "Either programId or courseId must be provided" },
        { status: 400 }
      );
    }

    // Check if student exists in this institution
    // institutionStudent model doesn't exist, skip validation for now
    // const institutionStudent = await prisma.institutionStudent.findFirst({
    //   where: {
    //     studentId: validatedData.studentId,
    //     institutionId: institutionId,
    //   },
    // });

    // if (!institutionStudent) {
    //   return NextResponse.json(
    //     { error: "Student not found in this institution" },
    //     { status: 400 }
    //   );
    // }

    // InstitutionEnrollment model doesn't exist, return mock data
    const enrollment = {
      id: "mock-enrollment-id",
      studentId: validatedData.studentId,
      institutionId: institutionId,
      programId: validatedData.programId || null,
      courseId: validatedData.courseId || null,
      status: (validatedData as any).status || "ACTIVE",
      enrolledAt: new Date(),
      student: {
        id: validatedData.studentId,
        firstName: "Mock",
        lastName: "Student",
        email: "mock@example.com",
        avatarUrl: null,
        studentNumber: "STU001",
      },
      program: validatedData.programId ? {
        id: validatedData.programId,
        name: "Mock Program",
        level: "UNDERGRADUATE",
      } : null,
      course: validatedData.courseId ? {
        id: validatedData.courseId,
        name: "Mock Course",
        code: "MOCK001",
        credits: 3,
        level: "UNDERGRADUATE",
      } : null,
    };

    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error creating enrollment:", error);
    return NextResponse.json(
      { error: "Failed to create enrollment" },
      { status: 500 }
    );
  }
}
