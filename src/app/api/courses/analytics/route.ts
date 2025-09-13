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
    const where: any = {
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

async function getCourseMetrics(where: any, startDate: Date) {
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
    prisma.course.count({ where: { ...where, status: "ACTIVE" } }),
    prisma.course.count({ where: { ...where, status: "COMPLETED" } }),
    prisma.course.count({ where: { ...where, status: "DRAFT" } }),
    prisma.courseEnrollment.count({
      where: {
        course: where,
      },
    }),
    prisma.courseEnrollment.count({
      where: {
        course: where,
        isCompleted: true,
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
    averageProgress: Math.round(averageCompletionRate._avg.progress || 0),
    averageRating: Math.round((averageRating._avg.rating || 0) * 10) / 10,
  };
}

async function getEnrollmentTrends(where: any, startDate: Date) {
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
          status: true,
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

async function getCompletionRates(where: any, startDate: Date) {
  const courses = await prisma.course.findMany({
    where,
    include: {
      enrollments: {
        select: {
          isCompleted: true,
          progress: true,
          enrolledAt: true,
        },
      },
    },
  });

  return courses.map(course => {
    const totalEnrollments = course.enrollments.length;
    const completedEnrollments = course.enrollments.filter(e => e.isCompleted).length;
    const averageProgress = totalEnrollments > 0 
      ? Math.round(course.enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / totalEnrollments)
      : 0;

    return {
      courseId: course.id,
      courseTitle: course.title,
      level: course.level,
      status: course.status,
      totalEnrollments,
      completedEnrollments,
      completionRate: totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0,
      averageProgress,
    };
  });
}

async function getStudentEngagement(where: any, startDate: Date) {
  const [
    discussionCount,
    questionCount,
    quizAttempts,
    averageSessionTime,
    activeStudents
  ] = await Promise.all([
    prisma.discussion.count({
      where: {
        course: where,
        createdAt: { gte: startDate },
      },
    }),
    prisma.question.count({
      where: {
        course: where,
        createdAt: { gte: startDate },
      },
    }),
    prisma.quizAttempt.count({
      where: {
        quiz: {
          course: where,
        },
        createdAt: { gte: startDate },
      },
    }),
    prisma.courseEnrollment.aggregate({
      where: {
        course: where,
        lastAccessedAt: { gte: startDate },
      },
      _avg: {
        timeSpent: true,
      },
    }),
    prisma.courseEnrollment.count({
      where: {
        course: where,
        lastAccessedAt: { gte: startDate },
      },
    }),
  ]);

  return {
    discussionCount,
    questionCount,
    quizAttempts,
    averageSessionTime: Math.round(averageSessionTime._avg.timeSpent || 0),
    activeStudents,
    engagementScore: calculateEngagementScore(discussionCount, questionCount, quizAttempts, activeStudents),
  };
}

async function getCoursePerformance(where: any, startDate: Date) {
  const courses = await prisma.course.findMany({
    where,
    include: {
      enrollments: {
        select: {
          isCompleted: true,
          progress: true,
          enrolledAt: true,
        },
      },
      _count: {
        select: {
          enrollments: true,
          modules: true,
          discussions: true,
          questions: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return courses.map(course => {
    const totalEnrollments = course._count.enrollments;
    const completedEnrollments = course.enrollments.filter(e => e.isCompleted).length;
    const averageProgress = totalEnrollments > 0 
      ? Math.round(course.enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / totalEnrollments)
      : 0;

    return {
      id: course.id,
      title: course.title,
      level: course.level,
      status: course.status,
      totalEnrollments,
      completedEnrollments,
      completionRate: totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0,
      averageProgress,
      totalModules: course._count.modules,
      totalDiscussions: course._count.discussions,
      totalQuestions: course._count.questions,
      engagementScore: calculateEngagementScore(
        course._count.discussions,
        course._count.questions,
        0, // quiz attempts not included in this query
        totalEnrollments
      ),
    };
  });
}

async function getInstructorPerformance(where: any, startDate: Date) {
  const instructors = await prisma.user.findMany({
    where: {
      role: "INSTRUCTOR",
      courses: {
        some: where,
      },
    },
    include: {
      courses: {
        where,
        include: {
          enrollments: {
            select: {
              isCompleted: true,
              progress: true,
            },
          },
          _count: {
            select: {
              enrollments: true,
              discussions: true,
              questions: true,
            },
          },
        },
      },
      profile: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  return instructors.map(instructor => {
    const totalCourses = instructor.courses.length;
    const totalEnrollments = instructor.courses.reduce((sum, course) => sum + course._count.enrollments, 0);
    const totalCompletions = instructor.courses.reduce((sum, course) => 
      sum + course.enrollments.filter(e => e.isCompleted).length, 0
    );
    const totalDiscussions = instructor.courses.reduce((sum, course) => sum + course._count.discussions, 0);
    const totalQuestions = instructor.courses.reduce((sum, course) => sum + course._count.questions, 0);

    return {
      id: instructor.id,
      name: `${instructor.profile?.firstName || ''} ${instructor.profile?.lastName || ''}`.trim(),
      email: instructor.profile?.email || '',
      totalCourses,
      totalEnrollments,
      totalCompletions,
      completionRate: totalEnrollments > 0 ? Math.round((totalCompletions / totalEnrollments) * 100) : 0,
      totalDiscussions,
      totalQuestions,
      engagementScore: calculateEngagementScore(totalDiscussions, totalQuestions, 0, totalEnrollments),
    };
  });
}

async function getContentAnalytics(where: any, startDate: Date) {
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
        createdAt: { gte: startDate },
      },
    }),
    prisma.lesson.count({
      where: {
        module: {
          course: where,
        },
        createdAt: { gte: startDate },
      },
    }),
    prisma.quiz.count({
      where: {
        course: where,
        createdAt: { gte: startDate },
      },
    }),
    prisma.courseModule.aggregate({
      where: {
        course: where,
        createdAt: { gte: startDate },
      },
      _avg: {
        duration: true,
      },
    }),
    prisma.lesson.aggregate({
      where: {
        module: {
          course: where,
        },
        createdAt: { gte: startDate },
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
    averageModuleLength: Math.round(averageModuleLength._avg.duration || 0),
    averageLessonLength: Math.round(averageLessonLength._avg.duration || 0),
    mostAccessedContent: mostAccessedContent.map(lesson => ({
      id: lesson.id,
      title: lesson.title,
      accessCount: lesson._count.progress,
      duration: lesson.duration,
    })),
  };
}

async function getTimeSeriesData(where: any, startDate: Date) {
  const enrollments = await prisma.courseEnrollment.findMany({
    where: {
      course: where,
      enrolledAt: { gte: startDate },
    },
    select: {
      enrolledAt: true,
      isCompleted: true,
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
    if (enrollment.isCompleted && enrollment.completedAt) {
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

async function getTopPerformingCourses(where: any, startDate: Date) {
  const courses = await prisma.course.findMany({
    where,
    include: {
      enrollments: {
        select: {
          isCompleted: true,
          progress: true,
        },
      },
      _count: {
        select: {
          enrollments: true,
          discussions: true,
          questions: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return courses.map(course => {
    const totalEnrollments = course._count.enrollments;
    const completedEnrollments = course.enrollments.filter(e => e.isCompleted).length;
    const averageProgress = totalEnrollments > 0 
      ? Math.round(course.enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / totalEnrollments)
      : 0;

    return {
      id: course.id,
      title: course.title,
      level: course.level,
      status: course.status,
      totalEnrollments,
      completedEnrollments,
      completionRate: totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0,
      averageProgress,
      totalDiscussions: course._count.discussions,
      totalQuestions: course._count.questions,
      engagementScore: calculateEngagementScore(
        course._count.discussions,
        course._count.questions,
        0,
        totalEnrollments
      ),
    };
  });
}

async function getStudentDemographics(where: any, startDate: Date) {
  const enrollments = await prisma.courseEnrollment.findMany({
    where: {
      course: where,
      enrolledAt: { gte: startDate },
    },
    include: {
      student: {
        include: {
          profile: {
            select: {
              experienceLevel: true,
              educationLevel: true,
              skills: true,
              address: true,
            },
          },
        },
      },
    },
  });

  // Analyze demographics
  const experienceLevels = enrollments.reduce((acc, enrollment) => {
    const level = enrollment.student.profile?.experienceLevel || "NO_EXPERIENCE";
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const educationLevels = enrollments.reduce((acc, enrollment) => {
    const level = enrollment.student.profile?.educationLevel || "HIGH_SCHOOL";
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const allSkills = enrollments.flatMap(enrollment => 
    enrollment.student.profile?.skills as string[] || []
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
    experienceLevels,
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
