import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createReportSchema = z.object({
  title: z.string().min(1, "Report title is required"),
  type: z.enum(["STUDENT_ENROLLMENT", "ACADEMIC_PERFORMANCE", "ATTENDANCE", "GRADUATION", "FINANCIAL", "INSTRUCTOR_PERFORMANCE", "COURSE_ANALYSIS", "CUSTOM"]),
  parameters: z.record(z.any()).optional(),
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
  { params }: { params: { id: string } }
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

    const where: any = {
      institutionId: params.id,
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

    const [reports, total] = await Promise.all([
      prisma.institutionReport.findMany({
        where,
        skip,
        take: validatedQuery.limit,
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      prisma.institutionReport.count({ where }),
    ]);

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
        { error: "Validation error", details: error.errors },
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
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = createReportSchema.parse(body);

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

    // Generate report content based on type
    let content = "";
    let parameters = validatedData.parameters || {};

    switch (validatedData.type) {
      case "STUDENT_ENROLLMENT":
        content = await generateStudentEnrollmentReport(params.id, parameters);
        break;
      case "ACADEMIC_PERFORMANCE":
        content = await generateAcademicPerformanceReport(params.id, parameters);
        break;
      case "ATTENDANCE":
        content = await generateAttendanceReport(params.id, parameters);
        break;
      case "GRADUATION":
        content = await generateGraduationReport(params.id, parameters);
        break;
      case "FINANCIAL":
        content = await generateFinancialReport(params.id, parameters);
        break;
      case "INSTRUCTOR_PERFORMANCE":
        content = await generateInstructorPerformanceReport(params.id, parameters);
        break;
      case "COURSE_ANALYSIS":
        content = await generateCourseAnalysisReport(params.id, parameters);
        break;
      case "CUSTOM":
        content = await generateCustomReport(params.id, parameters);
        break;
      default:
        content = "Report content not implemented yet";
    }

    const report = await prisma.institutionReport.create({
      data: {
        ...validatedData,
        institutionId: params.id,
        authorId: userId,
        content: JSON.stringify(content),
        parameters: JSON.stringify(parameters),
        status: "COMPLETED",
        generatedAt: new Date(),
      },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
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
async function generateStudentEnrollmentReport(institutionId: string, parameters: any) {
  const students = await prisma.institutionStudent.findMany({
    where: { institutionId },
    include: {
      student: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      program: {
        select: {
          name: true,
          level: true,
        },
      },
    },
  });

  return {
    type: "student_enrollment",
    summary: {
      totalStudents: students.length,
      activeStudents: students.filter(s => s.status === "ACTIVE").length,
      graduatedStudents: students.filter(s => s.status === "GRADUATED").length,
      droppedStudents: students.filter(s => s.status === "DROPPED_OUT").length,
    },
    data: students,
    generatedAt: new Date().toISOString(),
  };
}

async function generateAcademicPerformanceReport(institutionId: string, parameters: any) {
  const enrollments = await prisma.institutionEnrollment.findMany({
    where: { 
      institutionId,
      grade: { not: null },
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
          name: true,
          code: true,
        },
      },
    },
  });

  const averageGrade = enrollments.reduce((sum, e) => sum + (e.grade || 0), 0) / enrollments.length;

  return {
    type: "academic_performance",
    summary: {
      totalGrades: enrollments.length,
      averageGrade: averageGrade,
      highPerformers: enrollments.filter(e => (e.grade || 0) >= 90).length,
      lowPerformers: enrollments.filter(e => (e.grade || 0) < 70).length,
    },
    data: enrollments,
    generatedAt: new Date().toISOString(),
  };
}

async function generateAttendanceReport(institutionId: string, parameters: any) {
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

async function generateGraduationReport(institutionId: string, parameters: any) {
  const graduatedStudents = await prisma.institutionStudent.findMany({
    where: { 
      institutionId,
      status: "GRADUATED",
    },
    include: {
      student: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      program: {
        select: {
          name: true,
          level: true,
        },
      },
    },
  });

  return {
    type: "graduation",
    summary: {
      totalGraduates: graduatedStudents.length,
      graduatesByProgram: graduatedStudents.reduce((acc, student) => {
        const programName = student.program?.name || "Sin programa";
        acc[programName] = (acc[programName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    },
    data: graduatedStudents,
    generatedAt: new Date().toISOString(),
  };
}

async function generateFinancialReport(institutionId: string, parameters: any) {
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

async function generateInstructorPerformanceReport(institutionId: string, parameters: any) {
  const instructors = await prisma.institutionInstructor.findMany({
    where: { institutionId },
    include: {
      instructor: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      courses: {
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
      totalCourses: instructors.reduce((sum, i) => sum + i.courses.length, 0),
      totalStudents: instructors.reduce((sum, i) => 
        sum + i.courses.reduce((courseSum, c) => courseSum + c._count.enrollments, 0), 0),
    },
    data: instructors,
    generatedAt: new Date().toISOString(),
  };
}

async function generateCourseAnalysisReport(institutionId: string, parameters: any) {
  const courses = await prisma.institutionCourse.findMany({
    where: { institutionId },
    include: {
      program: {
        select: {
          name: true,
          level: true,
        },
      },
      instructor: {
        select: {
          instructor: {
            select: {
              firstName: true,
              lastName: true,
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

  return {
    type: "course_analysis",
    summary: {
      totalCourses: courses.length,
      activeCourses: courses.filter(c => c.status === "ACTIVE").length,
      totalEnrollments: courses.reduce((sum, c) => sum + c._count.enrollments, 0),
      averageEnrollmentsPerCourse: courses.length > 0 ? 
        courses.reduce((sum, c) => sum + c._count.enrollments, 0) / courses.length : 0,
    },
    data: courses,
    generatedAt: new Date().toISOString(),
  };
}

async function generateCustomReport(institutionId: string, parameters: any) {
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
