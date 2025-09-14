import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get("timeRange") || "30d";
    const courseId = searchParams.get("courseId");
    const instructorId = searchParams.get("instructorId");
    const level = searchParams.get("level");
    const status = searchParams.get("status");

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
    const where: Record<string, unknown> = {
      createdAt: { gte: startDate },
    };

    if (courseId) {
      where.id = courseId;
    }

    if (instructorId) {
      where.instructorId = instructorId;
    }

    if (level) {
      where.level = level;
    }

    if (status) {
      where.status = status;
    }

    // Get comprehensive course analytics
    const [
      courseMetrics,
      enrollmentTrends,
      completionRates,
      studentEngagement,
      coursePerformance,
      instructorPerformance,
      contentAnalytics,
      timeSeriesData,
      topPerformingCourses,
      studentDemographics
    ] = await Promise.all([
      getCourseMetrics(where, startDate),
      getEnrollmentTrends(where, startDate),
      getCompletionRates(where, startDate),
      getStudentEngagement(where, startDate),
      getCoursePerformance(where, startDate),
      getInstructorPerformance(where, startDate),
      getContentAnalytics(where, startDate),
      getTimeSeriesData(where, startDate),
      getTopPerformingCourses(where, startDate),
      getStudentDemographics(where, startDate)
    ]);

    return NextResponse.json({
      success: true,
      analytics: {
        timeRange,
        period: {
          start: startDate.toISOString(),
          end: now.toISOString(),
        },
        courseMetrics,
        enrollmentTrends,
        completionRates,
        studentEngagement,
        coursePerformance,
        instructorPerformance,
        contentAnalytics,
        timeSeriesData,
        topPerformingCourses,
        studentDemographics,
      },
    });

  } catch (error) {
    console.error("Error fetching course analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch course analytics" },
      { status: 500 }
    );
  }
}

async function getCourseMetrics(where: Record<string, unknown>, _startDate: Date) {
  const [
    totalCourses,
    activeCourses,
    completedCourses,
    draftCourses,
    totalEnrollments,
    totalCompletions,
    averageCompletionRate,
    averageRating
  ] = await Promise.all([
    prisma.course.count({ where }),
    prisma.course.count({ where: { ...where, isActive: true } }),
    prisma.course.count({ where: { ...where, isActive: false } }),
    prisma.course.count({ where: { ...where, publishedAt: null } }),
    prisma.courseEnrollment.count({
      where: {
        course: where,
      },
    }),
    prisma.courseEnrollment.count({
      where: {
        course: where,
        completedAt: { not: null },
      },
    }),
    prisma.courseEnrollment.aggregate({
      where: {
        course: where,
      },
      _avg: {
        progress: true,
      },
    }),
    prisma.course.aggregate({
      where: {
        ...where,
        rating: { not: null },
      },
      _avg: {
        rating: true,
      },
    }),
  ]);

  const completionRate = totalEnrollments > 0 
    ? Math.round((totalCompletions / totalEnrollments) * 100)
    : 0;

  return {
    totalCourses,
    activeCourses,
    completedCourses,
    draftCourses,
    totalEnrollments,
    totalCompletions,
    completionRate,
    averageProgress: Math.round(Number(averageCompletionRate._avg.progress) || 0),
    averageRating: Math.round((Number(averageRating._avg.rating) || 0) * 10) / 10,
  };
}

async function getEnrollmentTrends(where: Record<string, unknown>, startDate: Date) {
  const enrollments = await prisma.courseEnrollment.findMany({
    where: {
      course: where,
      enrolledAt: { gte: startDate },
    },
    select: {
      enrolledAt: true,
      course: {
        select: {
          level: true,
          isActive: true,
        },
      },
    },
    orderBy: { enrolledAt: "asc" },
  });

  // Group by day and level
  const dailyData = enrollments.reduce((acc, enrollment) => {
    const date = enrollment.enrolledAt.toISOString().split("T")[0];
    const level = enrollment.course.level;
    
    if (!acc[date]) {
      acc[date] = { total: 0, byLevel: {} };
    }
    
    acc[date].total++;
    acc[date].byLevel[level] = (acc[date].byLevel[level] || 0) + 1;
    
    return acc;
  }, {} as Record<string, { total: number; byLevel: Record<string, number> }>);

  return Object.entries(dailyData).map(([date, data]) => ({
    date,
    total: data.total,
    byLevel: data.byLevel,
  }));
}

async function getCompletionRates(where: Record<string, unknown>, _startDate: Date) {
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
    },
  });

  return courses.map(course => {
    const totalEnrollments = course.enrollments.length;
    const completedEnrollments = course.enrollments.filter(e => e.completedAt !== null).length;
    const averageProgress = totalEnrollments > 0 
      ? Math.round(course.enrollments.reduce((sum, e) => sum + Number(e.progress || 0), 0) / totalEnrollments)
      : 0;

    return {
      courseId: course.id,
      courseTitle: course.title,
      level: course.level,
      isActive: course.isActive,
      totalEnrollments,
      completedEnrollments,
      completionRate: totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0,
      averageProgress,
    };
  });
}

async function getStudentEngagement(where: Record<string, unknown>, startDate: Date) {
  const [
    quizAttempts,
    averageSessionTime,
    activeStudents
  ] = await Promise.all([
    prisma.quizAttempt.count({
      where: {
        quiz: {
          course: where,
        },
        completedAt: { gte: startDate },
      },
    }),
    prisma.courseEnrollment.aggregate({
      where: {
        course: where,
        enrolledAt: { gte: startDate },
      },
      _avg: {
        progress: true,
      },
    }),
    prisma.courseEnrollment.count({
      where: {
        course: where,
        enrolledAt: { gte: startDate },
      },
    }),
  ]);

  return {
    quizAttempts,
    averageProgress: Math.round(Number(averageSessionTime._avg.progress) || 0),
    activeStudents,
    engagementScore: calculateEngagementScore(0, 0, quizAttempts, activeStudents),
  };
}

async function getCoursePerformance(where: Record<string, unknown>, _startDate: Date) {
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
      _count: {
        select: {
          enrollments: true,
          modules: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return courses.map(course => {
    const totalEnrollments = course._count.enrollments;
    const completedEnrollments = course.enrollments.filter(e => e.completedAt !== null).length;
    const averageProgress = totalEnrollments > 0 
      ? Math.round(course.enrollments.reduce((sum, e) => sum + Number(e.progress || 0), 0) / totalEnrollments)
      : 0;

    return {
      id: course.id,
      title: course.title,
      level: course.level,
      isActive: course.isActive,
      totalEnrollments,
      completedEnrollments,
      completionRate: totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0,
      averageProgress,
      totalModules: course._count.modules,
      engagementScore: calculateEngagementScore(
        0,
        0,
        0, // quiz attempts not included in this query
        totalEnrollments
      ),
    };
  });
}

async function getInstructorPerformance(where: Record<string, unknown>, _startDate: Date) {
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
            },
          },
        },
      },
    },
  });

  return instructors.map(instructor => {
    const totalCourses = instructor.instructedCourses.length;
    const totalEnrollments = instructor.instructedCourses.reduce((sum, course) => sum + course._count.enrollments, 0);
    const totalCompletions = instructor.instructedCourses.reduce((sum, course) => 
      sum + course.enrollments.filter(e => e.completedAt !== null).length, 0
    );

    return {
      id: instructor.id,
      name: `${instructor.firstName || ''} ${instructor.lastName || ''}`.trim(),
      totalCourses,
      totalEnrollments,
      totalCompletions,
      completionRate: totalEnrollments > 0 ? Math.round((totalCompletions / totalEnrollments) * 100) : 0,
      engagementScore: calculateEngagementScore(0, 0, 0, totalEnrollments),
    };
  });
}

async function getContentAnalytics(where: Record<string, unknown>, startDate: Date) {
  const [
    totalModules,
    totalLessons,
    totalQuizzes,
    averageModuleLength,
    averageLessonLength,
    mostAccessedContent
  ] = await Promise.all([
    prisma.courseModule.count({
      where: {
        course: where,
      },
    }),
    prisma.lesson.count({
      where: {
        module: {
          course: where,
        },
      },
    }),
    prisma.quiz.count({
      where: {
        course: where,
      },
    }),
    prisma.courseModule.aggregate({
      where: {
        course: where,
      },
      _avg: {
        estimatedDuration: true,
      },
    }),
    prisma.lesson.aggregate({
      where: {
        module: {
          course: where,
        },
      },
      _avg: {
        duration: true,
      },
    }),
    prisma.lesson.findMany({
      where: {
        module: {
          course: where,
        },
      },
      include: {
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
      take: 10,
    }),
  ]);

  return {
    totalModules,
    totalLessons,
    totalQuizzes,
    averageModuleLength: Math.round(averageModuleLength._avg?.estimatedDuration || 0),
    averageLessonLength: Math.round(averageLessonLength._avg?.duration || 0),
    mostAccessedContent: mostAccessedContent.map(lesson => ({
      id: lesson.id,
      title: lesson.title,
      accessCount: lesson._count.progress,
      duration: lesson.duration,
    })),
  };
}

async function getTimeSeriesData(where: Record<string, unknown>, startDate: Date) {
  const enrollments = await prisma.courseEnrollment.findMany({
    where: {
      course: where,
      enrolledAt: { gte: startDate },
    },
    select: {
      enrolledAt: true,
      completedAt: true,
    },
    orderBy: { enrolledAt: "asc" },
  });

  // Group by day
  const dailyData = enrollments.reduce((acc, enrollment) => {
    const date = enrollment.enrolledAt.toISOString().split("T")[0];
    if (!acc[date]) {
      acc[date] = { enrollments: 0, completions: 0 };
    }
    acc[date].enrollments++;
    if (enrollment.completedAt) {
      const completionDate = enrollment.completedAt.toISOString().split("T")[0];
      if (completionDate >= date) {
        acc[date].completions++;
      }
    }
    return acc;
  }, {} as Record<string, { enrollments: number; completions: number }>);

  return Object.entries(dailyData).map(([date, data]) => ({
    date,
    enrollments: data.enrollments,
    completions: data.completions,
  }));
}

async function getTopPerformingCourses(where: Record<string, unknown>, _startDate: Date) {
  const courses = await prisma.course.findMany({
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
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return courses.map(course => {
    const totalEnrollments = course._count.enrollments;
    const completedEnrollments = course.enrollments.filter(e => e.completedAt !== null).length;
    const averageProgress = totalEnrollments > 0 
      ? Math.round(course.enrollments.reduce((sum, e) => sum + Number(e.progress || 0), 0) / totalEnrollments)
      : 0;

    return {
      id: course.id,
      title: course.title,
      level: course.level,
      isActive: course.isActive,
      totalEnrollments,
      completedEnrollments,
      completionRate: totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0,
      averageProgress,
      totalDiscussions: 0,
      totalQuestions: 0,
      engagementScore: calculateEngagementScore(
        0,
        0,
        0,
        totalEnrollments
      ),
    };
  });
}

async function getStudentDemographics(where: Record<string, unknown>, startDate: Date) {
  const enrollments = await prisma.courseEnrollment.findMany({
    where: {
      course: where,
      enrolledAt: { gte: startDate },
    },
    include: {
      student: {
        select: {
          educationLevel: true,
          skills: true,
          address: true,
        },
      },
    },
  });

  // Analyze demographics
  const educationLevels = enrollments.reduce((acc, enrollment) => {
    const level = enrollment.student?.educationLevel || "PRIMARY";
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const allSkills = enrollments.flatMap(enrollment => 
    enrollment.student?.skills as string[] || []
  );
  const skillFrequency = allSkills.reduce((acc, skill) => {
    acc[skill] = (acc[skill] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topSkills = Object.entries(skillFrequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([skill, count]) => ({ skill, count }));

  return {
    totalStudents: enrollments.length,
    educationLevels,
    topSkills,
    averageSkillsPerStudent: allSkills.length / enrollments.length || 0,
  };
}

function calculateEngagementScore(discussions: number, questions: number, quizAttempts: number, totalStudents: number): number {
  if (totalStudents === 0) return 0;
  
  const engagement = (discussions + questions + quizAttempts) / totalStudents;
  return Math.round(engagement * 100) / 100;
}
