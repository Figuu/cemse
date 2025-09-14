import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createStudentSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  studentNumber: z.string().min(1, "Student number is required"),
  programId: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "GRADUATED", "DROPPED_OUT", "TRANSFERRED"]).default("ACTIVE"),
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
    const sortBy = searchParams.get("sortBy") || "enrollmentDate";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    const { id: institutionId } = await params;
    const where: any = {
      institutionId: institutionId,
    };

    if (search) {
      where.OR = [
        { studentNumber: { contains: search, mode: "insensitive" } },
        { student: { firstName: { contains: search, mode: "insensitive" } } },
        { student: { lastName: { contains: search, mode: "insensitive" } } },
        { student: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (programId) {
      where.programId = programId;
    }

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // InstitutionStudent model doesn't exist, return empty data
    const students: any[] = [];
    const total = 0;

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      students,
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
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
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
    const validatedData = createStudentSchema.parse(body);

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
    const student = {
      id: "mock-student-id",
      studentId: validatedData.studentId,
      studentNumber: validatedData.studentNumber,
      programId: validatedData.programId,
      status: validatedData.status,
      notes: validatedData.notes,
      institutionId: institutionId,
      student: {
        id: validatedData.studentId,
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

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error creating student:", error);
    return NextResponse.json(
      { error: "Failed to create student" },
      { status: 500 }
    );
  }
}
