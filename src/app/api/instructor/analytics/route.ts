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

    // Only instructors can access this endpoint
    if (session.user.role !== "INSTRUCTOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get("timeRange") || "30"; // days
    const courseId = searchParams.get("courseId");

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange));

    // Build where clause
    const where: any = {
      instructorId: session.user.id,
      createdAt: {
        gte: daysAgo,
      },
    };

    if (courseId) {
      where.id = courseId;
    }

    // Get basic stats
    const [
      totalCourses,
      activeCourses,
      completedCourses,
      totalStudents,
      completedStudents,
      totalModules,
      totalLessons,
      totalDiscussions,
      totalQuestions,
      totalCertificates,
    ] = await Promise.all([
      prisma.course.count({
        where: { instructorId: session.user.id },
      }),
      prisma.course.count({
        where: { instructorId: session.user.id, status: "ACTIVE" },
      }),
      prisma.course.count({
        where: { instructorId: session.user.id, status: "COMPLETED" },
      }),
      prisma.courseEnrollment.count({
        where: {
          course: { instructorId: session.user.id },
        },
      }),
      prisma.courseEnrollment.count({
        where: {
          course: { instructorId: session.user.id },
          isCompleted: true,
        },
      }),
      prisma.courseModule.count({
        where: {
          course: { instructorId: session.user.id },
        },
      }),
      prisma.lesson.count({
        where: {
          module: {
            course: { instructorId: session.user.id },
          },
        },
      }),
      prisma.discussion.count({
        where: {
          course: { instructorId: session.user.id },
        },
      }),
      prisma.question.count({
        where: {
          course: { instructorId: session.user.id },
        },
      }),
      prisma.certificate.count({
        where: {
          course: { instructorId: session.user.id },
        },
      }),
    ]);

    // Get course performance data
    const coursePerformance = await prisma.course.findMany({
      where: { instructorId: session.user.id },
      include: {
        enrollments: true,
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
      take: 10,
    });

    const transformedCoursePerformance = coursePerformance.map(course => {
      const completedEnrollments = course.enrollments.filter(e => e.isCompleted).length;
      const averageProgress = course.enrollments.length > 0 
        ? course.enrollments.reduce((acc, enrollment) => acc + (enrollment.progress || 0), 0) / course.enrollments.length
        : 0;

      return {
        id: course.id,
        title: course.title,
        status: course.status,
        totalStudents: course._count.enrollments,
        completedStudents: completedEnrollments,
        averageProgress: Math.round(averageProgress),
        totalModules: course._count.modules,
        totalDiscussions: course._count.discussions,
        totalQuestions: course._count.questions,
        completionRate: course._count.enrollments > 0 
          ? Math.round((completedEnrollments / course._count.enrollments) * 100)
          : 0,
      };
    });

    // Get student engagement data
    const studentEngagement = await prisma.courseEnrollment.findMany({
      where: {
        course: { instructorId: session.user.id },
        enrolledAt: { gte: daysAgo },
      },
      include: {
        student: {
          include: {
            profile: true,
          },
        },
        course: true,
      },
      orderBy: { enrolledAt: "desc" },
      take: 20,
    });

    const transformedStudentEngagement = studentEngagement.map(enrollment => ({
      id: enrollment.student.id,
      name: `${enrollment.student.profile?.firstName || ''} ${enrollment.student.profile?.lastName || ''}`.trim(),
      email: enrollment.student.profile?.email || '',
      course: {
        id: enrollment.course.id,
        title: enrollment.course.title,
      },
      progress: enrollment.progress || 0,
      isCompleted: enrollment.isCompleted,
      enrolledAt: enrollment.enrolledAt.toISOString(),
      lastActivity: enrollment.updatedAt.toISOString(),
    }));

    // Get recent activity
    const recentActivity = await prisma.notification.findMany({
      where: {
        type: {
          in: ["COURSE_ENROLLMENT", "COURSE_COMPLETION", "CERTIFICATE_ISSUED"],
        },
        data: {
          path: ["courseId"],
          in: coursePerformance.map(c => c.id),
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const transformedRecentActivity = recentActivity.map(activity => ({
      id: activity.id,
      type: activity.type,
      title: activity.title,
      message: activity.message,
      createdAt: activity.createdAt.toISOString(),
    }));

    // Calculate completion rate
    const completionRate = totalStudents > 0 ? Math.round((completedStudents / totalStudents) * 100) : 0;

    // Calculate average progress
    const allEnrollments = await prisma.courseEnrollment.findMany({
      where: {
        course: { instructorId: session.user.id },
      },
      select: { progress: true },
    });

    const averageProgress = allEnrollments.length > 0 
      ? Math.round(allEnrollments.reduce((acc, enrollment) => acc + (enrollment.progress || 0), 0) / allEnrollments.length)
      : 0;

    return NextResponse.json({
      success: true,
      analytics: {
        overview: {
          totalCourses,
          activeCourses,
          completedCourses,
          totalStudents,
          completedStudents,
          totalModules,
          totalLessons,
          totalDiscussions,
          totalQuestions,
          totalCertificates,
          completionRate,
          averageProgress,
        },
        coursePerformance: transformedCoursePerformance,
        studentEngagement: transformedStudentEngagement,
        recentActivity: transformedRecentActivity,
        timeRange: parseInt(timeRange),
      },
    });

  } catch (error) {
    console.error("Error fetching instructor analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
