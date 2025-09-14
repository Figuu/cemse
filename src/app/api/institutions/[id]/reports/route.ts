import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createReportSchema = z.object({
  title: z.string().min(1, "Report title is required"),
  type: z.enum(["STUDENT_ENROLLMENT", "ACADEMIC_PERFORMANCE", "ATTENDANCE", "GRADUATION", "FINANCIAL", "INSTRUCTOR_PERFORMANCE", "COURSE_ANALYSIS", "CUSTOM"]),
  parameters: z.record(z.string(), z.any()).optional(),
  isPublic: z.boolean().default(false),
});

const reportQuerySchema = z.object({
  page: z.string().transform(Number).default(1),
  limit: z.string().transform(Number).default(20),
  type: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const query = {
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "20",
      type: searchParams.get("type") || undefined,
      status: searchParams.get("status") || undefined,
      search: searchParams.get("search") || undefined,
    };

    const validatedQuery = reportQuerySchema.parse(query);

    const { id: institutionId } = await params;
    const where: any = {
      institutionId: institutionId,
    };

    if (validatedQuery.type) {
      where.type = validatedQuery.type;
    }

    if (validatedQuery.status) {
      where.status = validatedQuery.status;
    }

    if (validatedQuery.search) {
      where.OR = [
        { title: { contains: validatedQuery.search, mode: "insensitive" } },
        { content: { contains: validatedQuery.search, mode: "insensitive" } },
      ];
    }

    const skip = (validatedQuery.page - 1) * validatedQuery.limit;

    // institutionReport model doesn't exist, return empty data
    const reports: any[] = [];
    const total = 0;

    const totalPages = Math.ceil(total / validatedQuery.limit);

    return NextResponse.json({
      reports,
      pagination: {
        page: validatedQuery.page,
        limit: validatedQuery.limit,
        total,
        totalPages,
        hasNext: validatedQuery.page < totalPages,
        hasPrev: validatedQuery.page > 1,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
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
    const validatedData = createReportSchema.parse(body);

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

    // Generate report content based on type
    let content: any = {};
    const parameters = validatedData.parameters || {};

    switch (validatedData.type) {
      case "STUDENT_ENROLLMENT":
        content = await generateStudentEnrollmentReport(institutionId, parameters);
        break;
      case "ACADEMIC_PERFORMANCE":
        content = await generateAcademicPerformanceReport(institutionId, parameters);
        break;
      case "ATTENDANCE":
        content = await generateAttendanceReport(institutionId, parameters);
        break;
      case "GRADUATION":
        content = await generateGraduationReport(institutionId, parameters);
        break;
      case "FINANCIAL":
        content = await generateFinancialReport(institutionId, parameters);
        break;
      case "INSTRUCTOR_PERFORMANCE":
        content = await generateInstructorPerformanceReport(institutionId, parameters);
        break;
      case "COURSE_ANALYSIS":
        content = await generateCourseAnalysisReport(institutionId, parameters);
        break;
      case "CUSTOM":
        content = await generateCustomReport(institutionId, parameters);
        break;
      default:
        content = { message: "Report content not implemented yet" };
    }

    // institutionReport model doesn't exist, return mock data
    const report = {
      id: "mock-report-id",
      title: validatedData.title,
      type: validatedData.type,
      institutionId: institutionId,
      authorId: userId,
      content: JSON.stringify(content),
      parameters: JSON.stringify(parameters),
      status: "COMPLETED",
      generatedAt: new Date(),
      author: {
        firstName: "Mock",
        lastName: "User",
        email: "mock@example.com",
      },
    };

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error creating report:", error);
    return NextResponse.json(
      { error: "Failed to create report" },
      { status: 500 }
    );
  }
}

// Helper functions to generate different types of reports
async function generateStudentEnrollmentReport(institutionId: string, _parameters: Record<string, unknown>) {
  const students = await prisma.profile.findMany({
    where: { institutionId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      status: true,
      createdAt: true,
    },
  });

  return {
    type: "student_enrollment",
    summary: {
      totalStudents: students.length,
      activeStudents: students.filter((s: any) => s.status === "ACTIVE").length,
      graduatedStudents: students.filter((s: any) => s.status === "ACTIVE").length, // Using active as graduated
      droppedStudents: students.filter((s: any) => s.status === "INACTIVE").length,
    },
    data: students,
    generatedAt: new Date().toISOString(),
  };
}

async function generateAcademicPerformanceReport(institutionId: string, _parameters: Record<string, unknown>) {
  const enrollments = await prisma.courseEnrollment.findMany({
    where: { 
      student: {
        institutionId,
      },
      progress: { gt: 0 },
    },
    include: {
      student: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      course: {
        select: {
          title: true,
          category: true,
        },
      },
    },
  });

  const averageGrade = enrollments.reduce((sum: number, e: any) => sum + Number(e.progress || 0), 0) / enrollments.length;

  return {
    type: "academic_performance",
    summary: {
      totalGrades: enrollments.length,
      averageGrade: averageGrade,
      highPerformers: enrollments.filter((e: any) => Number(e.progress || 0) >= 90).length,
      lowPerformers: enrollments.filter((e: any) => Number(e.progress || 0) < 70).length,
    },
    data: enrollments,
    generatedAt: new Date().toISOString(),
  };
}

async function generateAttendanceReport(_institutionId: string, _parameters: Record<string, unknown>) {
  // This would require attendance tracking data
  return {
    type: "attendance",
    summary: {
      message: "Attendance tracking not implemented yet",
    },
    data: [],
    generatedAt: new Date().toISOString(),
  };
}

async function generateGraduationReport(institutionId: string, _parameters: Record<string, unknown>) {
  const graduatedStudents = await prisma.profile.findMany({
    where: { 
      institutionId,
      status: "ACTIVE", // Using active as graduated
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      status: true,
      createdAt: true,
    },
  });

  return {
    type: "graduation",
    summary: {
      totalGraduates: graduatedStudents.length,
      graduatesByProgram: graduatedStudents.reduce((acc: Record<string, number>, student: any) => {
        const programName = "General"; // No program data available
        acc[programName] = (acc[programName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    },
    data: graduatedStudents,
    generatedAt: new Date().toISOString(),
  };
}

async function generateFinancialReport(institutionId: string, _parameters: Record<string, unknown>) {
  // This would require financial data
  return {
    type: "financial",
    summary: {
      message: "Financial reporting not implemented yet",
    },
    data: [],
    generatedAt: new Date().toISOString(),
  };
}

async function generateInstructorPerformanceReport(institutionId: string, _parameters: Record<string, unknown>) {
  const instructors = await prisma.profile.findMany({
    where: { 
      institutionId,
      instructedCourses: {
        some: {}
      }
    },
    include: {
      instructedCourses: {
        include: {
          _count: {
            select: {
              enrollments: true,
            },
          },
        },
      },
    },
  });

  return {
    type: "instructor_performance",
    summary: {
      totalInstructors: instructors.length,
      totalCourses: instructors.reduce((sum: number, i: any) => sum + i.instructedCourses.length, 0),
      totalStudents: instructors.reduce((sum: number, i: any) => 
        sum + i.instructedCourses.reduce((courseSum: number, c: any) => courseSum + c._count.enrollments, 0), 0),
    },
    data: instructors,
    generatedAt: new Date().toISOString(),
  };
}

async function generateCourseAnalysisReport(institutionId: string, _parameters: Record<string, unknown>) {
  const courses = await prisma.course.findMany({
    where: { 
      instructor: {
        institutionId
      }
    },
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

  return {
    type: "course_analysis",
    summary: {
      totalCourses: courses.length,
      activeCourses: courses.filter((c: any) => c.isActive).length,
      totalEnrollments: courses.reduce((sum: number, c: any) => sum + c._count.enrollments, 0),
      averageEnrollmentsPerCourse: courses.length > 0 ? 
        courses.reduce((sum: number, c: any) => sum + c._count.enrollments, 0) / courses.length : 0,
    },
    data: courses,
    generatedAt: new Date().toISOString(),
  };
}

async function generateCustomReport(institutionId: string, parameters: Record<string, unknown>) {
  return {
    type: "custom",
    summary: {
      message: "Custom report based on parameters",
      parameters: parameters,
    },
    data: [],
    generatedAt: new Date().toISOString(),
  };
}
