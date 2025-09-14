import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      reportType, 
      timeRange, 
      courseId, 
      instructorId, 
      format = "json",
      includeCharts = false 
    } = body;

    if (!reportType) {
      return NextResponse.json({ error: "Report type is required" }, { status: 400 });
    }

    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    switch (timeRange) {
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(now.getDate() - 90);
        break;
      case "1y":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Build where clause
    const where: any = {
      createdAt: { gte: startDate },
    };

    if (courseId) {
      where.id = courseId;
    }

    if (instructorId) {
      where.instructorId = instructorId;
    }

    let reportData;

    switch (reportType) {
      case "course_performance":
        reportData = await generateCoursePerformanceReport(where, startDate, includeCharts);
        break;
      case "student_engagement":
        reportData = await generateStudentEngagementReport(where, startDate, includeCharts);
        break;
      case "instructor_analytics":
        reportData = await generateInstructorAnalyticsReport(where, startDate, includeCharts);
        break;
      case "completion_analysis":
        reportData = await generateCompletionAnalysisReport(where, startDate, includeCharts);
        break;
      case "content_analytics":
        reportData = await generateContentAnalyticsReport(where, startDate, includeCharts);
        break;
      case "comprehensive":
        reportData = await generateComprehensiveReport(where, startDate, includeCharts);
        break;
      default:
        return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
    }

    // Generate report metadata
    const reportMetadata = {
      id: `report_${Date.now()}`,
      type: reportType,
      timeRange,
      generatedAt: now.toISOString(),
      generatedBy: session.user.id,
      period: {
        start: startDate.toISOString(),
        end: now.toISOString(),
      },
      filters: {
        courseId: courseId || null,
        instructorId: instructorId || null,
      },
    };

    const report = {
      metadata: reportMetadata,
      data: reportData,
    };

    // Handle different output formats
    if (format === "csv") {
      const csvData = convertToCSV(reportData, reportType);
      return new NextResponse(csvData, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="course_analytics_${reportType}_${timeRange}.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      report,
    });

  } catch (error) {
    console.error("Error generating course analytics report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}

async function generateCoursePerformanceReport(where: Record<string, unknown>, _startDate: Date, _includeCharts: boolean) {
  const courses = await prisma.course.findMany({
    where,
    include: {
      enrollments: {
        select: {
          completedAt: true,
          progress: true,
          enrolledAt: true,
        },
      },
      instructor: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      _count: {
        select: {
          enrollments: true,
          modules: true,
          quizzes: true,
        },
      },
    },
  });

  const reportData = courses.map(course => {
    const totalEnrollments = course._count.enrollments;
    const completedEnrollments = course.enrollments.filter(e => e.completedAt !== null).length;
    const averageProgress = totalEnrollments > 0 
      ? Math.round(Number(course.enrollments.reduce((sum: number, e) => sum + Number(e.progress || 0), 0)) / totalEnrollments)
      : 0;

    return {
      courseId: course.id,
      courseTitle: course.title,
      instructor: `${course.instructor?.firstName || ''} ${course.instructor?.lastName || ''}`.trim(),
      level: course.level,
      status: course.isActive ? 'ACTIVE' : 'INACTIVE',
      totalEnrollments,
      completedEnrollments,
      completionRate: totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0,
      averageProgress,
      totalModules: course._count.modules,
      totalQuizzes: course._count.quizzes,
      createdAt: course.createdAt.toISOString(),
    };
  });

  return {
    summary: {
      totalCourses: courses.length,
      totalEnrollments: courses.reduce((sum, course) => sum + course._count.enrollments, 0),
      averageCompletionRate: courses.length > 0 
        ? Math.round(courses.reduce((sum: number, course) => {
            const completionRate = course._count.enrollments > 0 
              ? (course.enrollments.filter(e => e.completedAt !== null).length / course._count.enrollments) * 100
              : 0;
            return sum + completionRate;
          }, 0) / courses.length)
        : 0,
    },
    courses: reportData,
  };
}

async function generateStudentEngagementReport(where: Record<string, unknown>, startDate: Date, _includeCharts: boolean) {
  const [
    lessonProgress,
    quizAttempts,
    enrollments
  ] = await Promise.all([
    prisma.lessonProgress.findMany({
      where: {
        lesson: {
          module: {
            course: where,
          },
        },
        completedAt: { gte: startDate },
      },
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        lesson: {
          include: {
            module: {
              include: {
                course: {
                  select: {
                    title: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.quizAttempt.findMany({
      where: {
        quiz: {
          course: where,
        },
        completedAt: { gte: startDate },
      },
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        quiz: {
          include: {
            course: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    }),
    prisma.courseEnrollment.findMany({
      where: {
        course: where,
        enrolledAt: { gte: startDate },
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
          },
        },
      },
    }),
  ]);

  // Group by student
  const studentEngagement = enrollments.map(enrollment => {
    const studentId = enrollment.studentId;
    const studentLessonProgress = lessonProgress.filter(lp => lp.studentId === studentId).length;
    const studentQuizAttempts = quizAttempts.filter(qa => qa.studentId === studentId).length;

    return {
      studentId,
      studentName: `${enrollment.student?.firstName || ''} ${enrollment.student?.lastName || ''}`.trim(),
      courseTitle: enrollment.course.title,
      lessonProgress: studentLessonProgress,
      quizAttempts: studentQuizAttempts,
      totalEngagement: studentLessonProgress + studentQuizAttempts,
      progress: Number(enrollment.progress || 0),
      isCompleted: enrollment.completedAt !== null,
    };
  });

  return {
    summary: {
      totalStudents: enrollments.length,
      totalLessonProgress: lessonProgress.length,
      totalQuizAttempts: quizAttempts.length,
      averageEngagement: enrollments.length > 0 
        ? Math.round(studentEngagement.reduce((sum: number, student) => sum + student.totalEngagement, 0) / enrollments.length)
        : 0,
    },
    studentEngagement: studentEngagement.sort((a, b) => b.totalEngagement - a.totalEngagement),
  };
}

async function generateInstructorAnalyticsReport(where: Record<string, unknown>, _startDate: Date, _includeCharts: boolean) {
  const instructors = await prisma.profile.findMany({
    where: {
      instructedCourses: {
        some: where,
      },
    },
    include: {
      instructedCourses: {
        where,
        include: {
          enrollments: {
            select: {
              completedAt: true,
              progress: true,
            },
          },
          _count: {
            select: {
              enrollments: true,
              quizzes: true,
            },
          },
        },
      },
      user: {
        select: {
          email: true,
        },
      },
    },
  });

  const reportData = instructors.map(instructor => {
    const totalCourses = instructor.instructedCourses.length;
    const totalEnrollments = instructor.instructedCourses.reduce((sum: number, course) => sum + course._count.enrollments, 0);
    const totalCompletions = instructor.instructedCourses.reduce((sum: number, course) => 
      sum + course.enrollments.filter(e => e.completedAt !== null).length, 0
    );
    const totalQuizzes = instructor.instructedCourses.reduce((sum: number, course) => sum + course._count.quizzes, 0);

    return {
      instructorId: instructor.id,
      instructorName: `${instructor.firstName || ''} ${instructor.lastName || ''}`.trim(),
      email: instructor.user?.email || '',
      totalCourses,
      totalEnrollments,
      totalCompletions,
      completionRate: totalEnrollments > 0 ? Math.round((totalCompletions / totalEnrollments) * 100) : 0,
      totalQuizzes,
      engagementScore: totalEnrollments > 0 ? Math.round((totalQuizzes / totalEnrollments) * 100) / 100 : 0,
    };
  });

  return {
    summary: {
      totalInstructors: instructors.length,
      totalCourses: instructors.reduce((sum: number, instructor) => sum + instructor.instructedCourses.length, 0),
      totalEnrollments: instructors.reduce((sum: number, instructor) => 
        sum + instructor.instructedCourses.reduce((courseSum: number, course) => courseSum + course._count.enrollments, 0), 0
      ),
      averageCompletionRate: instructors.length > 0 
        ? Math.round(instructors.reduce((sum: number, instructor) => {
            const instructorCompletionRate = instructor.instructedCourses.reduce((courseSum: number, course) => {
              const courseCompletionRate = course._count.enrollments > 0 
                ? (course.enrollments.filter(e => e.completedAt !== null).length / course._count.enrollments) * 100
                : 0;
              return courseSum + courseCompletionRate;
            }, 0) / instructor.instructedCourses.length;
            return sum + instructorCompletionRate;
          }, 0) / instructors.length)
        : 0,
    },
    instructors: reportData.sort((a, b) => b.engagementScore - a.engagementScore),
  };
}

async function generateCompletionAnalysisReport(where: Record<string, unknown>, startDate: Date, _includeCharts: boolean) {
  const enrollments = await prisma.courseEnrollment.findMany({
    where: {
      course: where,
      enrolledAt: { gte: startDate },
    },
    include: {
      course: {
        select: {
          title: true,
          level: true,
        },
      },
      student: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  const completionAnalysis = enrollments.map(enrollment => {
    const enrollmentDate = enrollment.enrolledAt;
    const completionDate = enrollment.completedAt;
    const daysToComplete = completionDate 
      ? Math.floor((completionDate.getTime() - enrollmentDate.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    return {
      enrollmentId: enrollment.id,
      studentName: `${enrollment.student?.firstName || ''} ${enrollment.student?.lastName || ''}`.trim(),
      courseTitle: enrollment.course.title,
      courseLevel: enrollment.course.level,
      enrolledAt: enrollmentDate.toISOString(),
      completedAt: completionDate?.toISOString() || null,
      isCompleted: enrollment.completedAt !== null,
      progress: Number(enrollment.progress || 0),
      daysToComplete,
      experienceLevel: "NO_EXPERIENCE",
      educationLevel: "HIGH_SCHOOL",
    };
  });

  const completedEnrollments = completionAnalysis.filter(e => e.isCompleted);
  const averageDaysToComplete = completedEnrollments.length > 0 
    ? Math.round(completedEnrollments.reduce((sum: number, e) => sum + (e.daysToComplete || 0), 0) / completedEnrollments.length)
    : 0;

  return {
    summary: {
      totalEnrollments: enrollments.length,
      completedEnrollments: completedEnrollments.length,
      completionRate: enrollments.length > 0 ? Math.round((completedEnrollments.length / enrollments.length) * 100) : 0,
      averageDaysToComplete,
      averageProgress: enrollments.length > 0 
        ? Math.round(enrollments.reduce((sum: number, e) => sum + Number(e.progress || 0), 0) / enrollments.length)
        : 0,
    },
    enrollments: completionAnalysis,
  };
}

async function generateContentAnalyticsReport(where: Record<string, unknown>, _startDate: Date, _includeCharts: boolean) {
  const [
    modules,
    lessons,
    quizzes,
    mostAccessedLessons
  ] = await Promise.all([
    prisma.courseModule.findMany({
      where: {
        course: where,
      },
      include: {
        course: {
          select: {
            title: true,
          },
        },
        _count: {
          select: {
            lessons: true,
          },
        },
      },
    }),
    prisma.lesson.findMany({
      where: {
        module: {
          course: where,
        },
      },
      include: {
        module: {
          include: {
            course: {
              select: {
                title: true,
              },
            },
          },
        },
        _count: {
          select: {
            progress: true,
          },
        },
      },
    }),
    prisma.quiz.findMany({
      where: {
        course: where,
      },
      include: {
        course: {
          select: {
            title: true,
          },
        },
        _count: {
          select: {
            quizAttempts: true,
          },
        },
      },
    }),
    prisma.lesson.findMany({
      where: {
        module: {
          course: where,
        },
      },
      include: {
        module: {
          include: {
            course: {
              select: {
                title: true,
              },
            },
          },
        },
        _count: {
          select: {
            progress: true,
          },
        },
      },
      orderBy: {
        progress: {
          _count: "desc",
        },
      },
      take: 20,
    }),
  ]);

  return {
    summary: {
      totalModules: modules.length,
      totalLessons: lessons.length,
      totalQuizzes: quizzes.length,
      averageLessonsPerModule: modules.length > 0 ? Math.round(lessons.length / modules.length) : 0,
    },
    modules: modules.map(module => ({
      moduleId: module.id,
      moduleTitle: module.title,
      courseTitle: module.course.title,
      lessonCount: module._count.lessons,
      duration: module.estimatedDuration,
    })),
    lessons: lessons.map(lesson => ({
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      courseTitle: lesson.module.course.title,
      moduleTitle: lesson.module.title,
      duration: lesson.duration,
      accessCount: lesson._count.progress,
    })),
    quizzes: quizzes.map(quiz => ({
      quizId: quiz.id,
      quizTitle: quiz.title,
      courseTitle: quiz.course?.title || 'N/A',
      attemptCount: quiz._count.quizAttempts,
    })),
    mostAccessedLessons: mostAccessedLessons.map(lesson => ({
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      courseTitle: lesson.module.course.title,
      accessCount: lesson._count.progress,
    })),
  };
}

async function generateComprehensiveReport(where: Record<string, unknown>, startDate: Date, includeCharts: boolean) {
  const [
    coursePerformance,
    studentEngagement,
    instructorAnalytics,
    completionAnalysis,
    contentAnalytics
  ] = await Promise.all([
    generateCoursePerformanceReport(where, startDate, includeCharts),
    generateStudentEngagementReport(where, startDate, includeCharts),
    generateInstructorAnalyticsReport(where, startDate, includeCharts),
    generateCompletionAnalysisReport(where, startDate, includeCharts),
    generateContentAnalyticsReport(where, startDate, includeCharts),
  ]);

  return {
    coursePerformance,
    studentEngagement,
    instructorAnalytics,
    completionAnalysis,
    contentAnalytics,
  };
}

function convertToCSV(data: any, reportType: string): string {
  // This is a simplified CSV conversion
  // In a real implementation, you would use a proper CSV library
  const headers = Object.keys(data);
  const rows = [headers.join(",")];
  
  // Add data rows based on report type
  if (reportType === "course_performance" && data.courses) {
    data.courses.forEach((course: any) => {
      rows.push(Object.values(course).join(","));
    });
  }
  
  return rows.join("\n");
}
