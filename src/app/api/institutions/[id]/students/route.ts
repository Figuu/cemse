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
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    const { id: institutionId } = await params;
    const where: any = {
      institutionId: institutionId,
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (status) {
      where.status = status;
    }

    // Note: programId filter is not applicable to Profile model directly
    // if (programId) {
    //   where.programId = programId;
    // }

    const orderBy: any = {};
    // Map sortBy fields to actual Profile fields
    if (sortBy === "enrollmentDate") {
      orderBy["createdAt"] = sortOrder;
    } else {
      orderBy[sortBy] = sortOrder;
    }

    // Debug logging
    console.log('Students API Debug:', {
      institutionId,
      where,
      page,
      limit,
    });

    // Get students from profiles associated with this institution
    const [students, total] = await Promise.all([
      prisma.profile.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
          institution: {
            select: {
              id: true,
              name: true,
              department: true,
              institutionType: true,
            },
          },
          _count: {
            select: {
              courseEnrollments: true,
            },
          },
        },
      }),
      prisma.profile.count({ where }),
    ]);

    console.log('Students Query Result:', {
      studentsCount: students.length,
      total,
    });

    const totalPages = Math.ceil(total / limit);

    // Transform the data to match the expected interface
    const transformedStudents = students.map(student => ({
      id: student.id,
      studentId: student.id,
      institutionId: student.institutionId || institutionId,
      studentNumber: student.id, // Using profile ID as student number
      enrollmentDate: student.createdAt.toISOString(),
      status: student.status || "ACTIVE",
      programId: null, // Not implemented yet
      graduationDate: null,
      gpa: null,
      notes: null,
      createdAt: student.createdAt.toISOString(),
      updatedAt: student.updatedAt.toISOString(),
      student: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.user?.email,
        phone: student.phone,
        avatarUrl: student.avatarUrl,
        birthDate: student.birthDate?.toISOString(),
        gender: student.gender,
        address: student.address,
        city: student.city,
        state: student.state,
        country: student.country,
        educationLevel: student.educationLevel,
        currentInstitution: student.institution?.name,
        graduationYear: student.graduationYear,
        skills: student.skills || [],
        interests: student.interests || [],
        socialLinks: student.socialLinks || {},
        workExperience: student.workExperience || [],
        achievements: student.achievements || [],
        academicAchievements: student.academicAchievements || [],
        currentDegree: student.currentDegree,
        universityName: student.universityName,
        universityStatus: student.universityStatus,
        gpa: student.gpa,
        languages: student.languages || [],
        projects: student.projects || [],
        skillsWithLevel: student.skillsWithLevel || [],
        websites: student.websites || [],
        extracurricularActivities: student.extracurricularActivities || [],
        professionalSummary: student.professionalSummary,
        targetPosition: student.targetPosition,
        targetCompany: student.targetCompany,
        relevantSkills: student.relevantSkills || [],
      },
      program: null, // Not implemented yet
      institution: student.institution,
      enrollments: [],
      _count: {
        enrollments: student._count.courseEnrollments,
      },
    }));

    return NextResponse.json({
      students: transformedStudents,
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
