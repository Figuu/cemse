import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const analyticsQuerySchema = z.object({
  period: z.enum(["7d", "30d", "90d", "1y", "all"]).default("30d"),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: institutionId } = await params;
    const { searchParams } = new URL(request.url);
    const query = {
      period: searchParams.get("period") || "30d",
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
    };

    const validatedQuery = analyticsQuerySchema.parse(query);

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    if (validatedQuery.startDate && validatedQuery.endDate) {
      startDate = new Date(validatedQuery.startDate);
      endDate = new Date(validatedQuery.endDate);
    } else {
      switch (validatedQuery.period) {
        case "7d":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30d":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "90d":
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case "1y":
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        case "all":
        default:
          startDate = new Date(0); // Beginning of time
          break;
      }
    }

    // Get institution basic info
    const institution = await prisma.institution.findUnique({
      where: { id: institutionId },
      select: {
        id: true,
        name: true,
        department: true,
        region: true,
        institutionType: true,
        createdAt: true,
      },
    });

    if (!institution) {
      return NextResponse.json(
        { error: "Institution not found" },
        { status: 404 }
      );
    }

    // Get profiles (students) associated with this institution
    const students = await prisma.profile.findMany({
      where: {
        institutionId: institutionId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        status: true,
        createdAt: true,
      },
    });

    // Get companies associated with this institution
    const programs = await prisma.company.findMany({
      where: {
        institutionId: institutionId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        _count: {
          select: {
            jobOffers: true,
            employees: true,
          },
        },
      },
    });

    // Get courses (using general courses, not institution-specific)
    const courses = await prisma.course.findMany({
      where: {
        instructor: {
          institutionId: institutionId,
        },
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    // Get course enrollments for students from this institution
    const enrollments = await prisma.courseEnrollment.findMany({
      where: {
        student: {
          institutionId: institutionId,
        },
        enrolledAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            category: true,
          },
        },
      },
    });

    // Get news articles (as announcements)
    const announcements = await prisma.newsArticle.findMany({
      where: {
        authorType: "INSTITUTION",
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Get entrepreneurship posts (as events) - using empty array for now
    const events: any[] = [];

    // Calculate metrics
    const totalStudents = students.length;
    const totalPrograms = programs.length;
    const totalCourses = courses.length;
    const totalEnrollments = enrollments.length;
    const totalAnnouncements = announcements.length;
    const totalEvents = events.length;

    // Calculate student status distribution
    const studentStatusDistribution = students.reduce((acc: Record<string, number>, student) => {
      acc[student.status] = (acc[student.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate program level distribution (using company size)
    const programLevelDistribution = programs.reduce((acc: Record<string, number>, program) => {
      const level = program.companySize || "MICRO";
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate course level distribution
    const courseLevelDistribution = courses.reduce((acc: Record<string, number>, course) => {
      acc[course.level] = (acc[course.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate enrollment status distribution
    const enrollmentStatusDistribution = enrollments.reduce((acc: Record<string, number>, enrollment) => {
      const status = enrollment.completedAt ? "COMPLETED" : "ACTIVE";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate daily metrics for charts
    const dailyMetrics = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayStart = new Date(currentDate);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);

      const dayStudents = students.filter((student: any) => 
        student.createdAt >= dayStart && student.createdAt <= dayEnd
      ).length;

      const dayPrograms = programs.filter((program: any) => 
        program.createdAt >= dayStart && program.createdAt <= dayEnd
      ).length;

      const dayCourses = courses.filter((course: any) => 
        course.createdAt >= dayStart && course.createdAt <= dayEnd
      ).length;

      const dayEnrollments = enrollments.filter((enrollment: any) => 
        enrollment.enrolledAt >= dayStart && enrollment.enrolledAt <= dayEnd
      ).length;

      const dayAnnouncements = announcements.filter((announcement: any) => 
        announcement.createdAt >= dayStart && announcement.createdAt <= dayEnd
      ).length;

      const dayEvents = events.filter((event: any) => 
        event.createdAt >= dayStart && event.createdAt <= dayEnd
      ).length;

      dailyMetrics.push({
        date: currentDate.toISOString().split('T')[0],
        students: dayStudents,
        programs: dayPrograms,
        courses: dayCourses,
        enrollments: dayEnrollments,
        announcements: dayAnnouncements,
        events: dayEvents,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Calculate top performing programs (companies)
    const programPerformance = programs.map((program: any) => ({
      id: program.id,
      name: program.name,
      level: program.companySize || "MICRO",
      enrollments: program._count.employees,
      courses: program._count.jobOffers,
      enrollmentRate: 0, // No max students for companies
    }));

    const topPerformingPrograms = programPerformance
      .sort((a: any, b: any) => b.enrollments - a.enrollments)
      .slice(0, 5);

    // Calculate top performing courses
    const coursePerformance = courses.map((course: any) => ({
      id: course.id,
      name: course.title,
      code: course.category,
      level: course.level,
      enrollments: course._count.enrollments,
      enrollmentRate: 0, // No max students for courses
    }));

    const topPerformingCourses = coursePerformance
      .sort((a: any, b: any) => b.enrollments - a.enrollments)
      .slice(0, 5);

    // Calculate academic performance metrics
    const academicPerformance = {
      averageGrade: 0, // Will be calculated from enrollments with grades
      completionRate: 0, // Will be calculated from completed enrollments
      retentionRate: 0, // Will be calculated from active vs total students
      graduationRate: 0, // Will be calculated from graduated students
    };

    // Calculate average grade (using course progress)
    const enrollmentsWithProgress = enrollments.filter((e: any) => e.progress !== null);
    if (enrollmentsWithProgress.length > 0) {
      academicPerformance.averageGrade = enrollmentsWithProgress.reduce((sum: number, e: any) => sum + Number(e.progress || 0), 0) / enrollmentsWithProgress.length;
    }

    // Calculate completion rate
    const completedEnrollments = enrollments.filter((e: any) => e.completedAt !== null).length;
    academicPerformance.completionRate = totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0;

    // Calculate retention rate
    const activeStudents = students.filter((s: any) => s.status === "ACTIVE").length;
    academicPerformance.retentionRate = totalStudents > 0 ? (activeStudents / totalStudents) * 100 : 0;

    // Calculate graduation rate
    const graduatedStudents = students.filter((s: any) => s.status === "ACTIVE").length; // Using active as graduated
    academicPerformance.graduationRate = totalStudents > 0 ? (graduatedStudents / totalStudents) * 100 : 0;

    // Calculate engagement metrics
    const engagementMetrics = {
      averageStudentsPerProgram: totalPrograms > 0 ? totalStudents / totalPrograms : 0,
      averageCoursesPerProgram: totalPrograms > 0 ? totalCourses / totalPrograms : 0,
      averageEnrollmentsPerCourse: totalCourses > 0 ? totalEnrollments / totalCourses : 0,
      announcementFrequency: Math.round(dailyMetrics.reduce((sum, day) => sum + day.announcements, 0) / dailyMetrics.length),
      eventFrequency: Math.round(dailyMetrics.reduce((sum, day) => sum + day.events, 0) / dailyMetrics.length),
    };

    const analytics = {
      institution,
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        days: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
      },
      overview: {
        totalStudents,
        totalPrograms,
        totalCourses,
        totalEnrollments,
        totalAnnouncements,
        totalEvents,
      },
      studentStatusDistribution,
      programLevelDistribution,
      courseLevelDistribution,
      enrollmentStatusDistribution,
      dailyMetrics,
      topPerformingPrograms,
      topPerformingCourses,
      academicPerformance,
      engagementMetrics,
    };

    return NextResponse.json(analytics);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error fetching institution analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch institution analytics" },
      { status: 500 }
    );
  }
}
