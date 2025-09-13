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
  { params }: { params: { id: string } }
) {
  try {
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
      where: { id: params.id },
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

    // Get students in date range
    const students = await prisma.institutionStudent.findMany({
      where: {
        institutionId: params.id,
        enrollmentDate: {
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
            email: true,
          },
        },
        program: {
          select: {
            id: true,
            name: true,
            level: true,
          },
        },
      },
    });

    // Get programs in date range
    const programs = await prisma.institutionProgram.findMany({
      where: {
        institutionId: params.id,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        _count: {
          select: {
            enrollments: true,
            courses: true,
          },
        },
      },
    });

    // Get courses in date range
    const courses = await prisma.institutionCourse.findMany({
      where: {
        institutionId: params.id,
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

    // Get enrollments in date range
    const enrollments = await prisma.institutionEnrollment.findMany({
      where: {
        institutionId: params.id,
        enrollmentDate: {
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
        program: {
          select: {
            id: true,
            name: true,
          },
        },
        course: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    // Get announcements in date range
    const announcements = await prisma.institutionAnnouncement.findMany({
      where: {
        institutionId: params.id,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Get events in date range
    const events = await prisma.institutionEvent.findMany({
      where: {
        institutionId: params.id,
        startDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Calculate metrics
    const totalStudents = students.length;
    const totalPrograms = programs.length;
    const totalCourses = courses.length;
    const totalEnrollments = enrollments.length;
    const totalAnnouncements = announcements.length;
    const totalEvents = events.length;

    // Calculate student status distribution
    const studentStatusDistribution = students.reduce((acc, student) => {
      acc[student.status] = (acc[student.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate program level distribution
    const programLevelDistribution = programs.reduce((acc, program) => {
      acc[program.level] = (acc[program.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate course level distribution
    const courseLevelDistribution = courses.reduce((acc, course) => {
      acc[course.level] = (acc[course.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate enrollment status distribution
    const enrollmentStatusDistribution = enrollments.reduce((acc, enrollment) => {
      acc[enrollment.status] = (acc[enrollment.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate daily metrics for charts
    const dailyMetrics = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayStart = new Date(currentDate);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);

      const dayStudents = students.filter(student => 
        student.enrollmentDate >= dayStart && student.enrollmentDate <= dayEnd
      ).length;

      const dayPrograms = programs.filter(program => 
        program.createdAt >= dayStart && program.createdAt <= dayEnd
      ).length;

      const dayCourses = courses.filter(course => 
        course.createdAt >= dayStart && course.createdAt <= dayEnd
      ).length;

      const dayEnrollments = enrollments.filter(enrollment => 
        enrollment.enrollmentDate >= dayStart && enrollment.enrollmentDate <= dayEnd
      ).length;

      const dayAnnouncements = announcements.filter(announcement => 
        announcement.createdAt >= dayStart && announcement.createdAt <= dayEnd
      ).length;

      const dayEvents = events.filter(event => 
        event.startDate >= dayStart && event.startDate <= dayEnd
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

    // Calculate top performing programs
    const programPerformance = programs.map(program => ({
      id: program.id,
      name: program.name,
      level: program.level,
      enrollments: program._count.enrollments,
      courses: program._count.courses,
      enrollmentRate: program.maxStudents ? (program._count.enrollments / program.maxStudents) * 100 : 0,
    }));

    const topPerformingPrograms = programPerformance
      .sort((a, b) => b.enrollments - a.enrollments)
      .slice(0, 5);

    // Calculate top performing courses
    const coursePerformance = courses.map(course => ({
      id: course.id,
      name: course.name,
      code: course.code,
      level: course.level,
      enrollments: course._count.enrollments,
      enrollmentRate: course.maxStudents ? (course._count.enrollments / course.maxStudents) * 100 : 0,
    }));

    const topPerformingCourses = coursePerformance
      .sort((a, b) => b.enrollments - a.enrollments)
      .slice(0, 5);

    // Calculate academic performance metrics
    const academicPerformance = {
      averageGrade: 0, // Will be calculated from enrollments with grades
      completionRate: 0, // Will be calculated from completed enrollments
      retentionRate: 0, // Will be calculated from active vs total students
      graduationRate: 0, // Will be calculated from graduated students
    };

    // Calculate average grade
    const enrollmentsWithGrades = enrollments.filter(e => e.grade !== null);
    if (enrollmentsWithGrades.length > 0) {
      academicPerformance.averageGrade = enrollmentsWithGrades.reduce((sum, e) => sum + (e.grade || 0), 0) / enrollmentsWithGrades.length;
    }

    // Calculate completion rate
    const completedEnrollments = enrollments.filter(e => e.status === "COMPLETED").length;
    academicPerformance.completionRate = totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0;

    // Calculate retention rate
    const activeStudents = students.filter(s => s.status === "ACTIVE").length;
    academicPerformance.retentionRate = totalStudents > 0 ? (activeStudents / totalStudents) * 100 : 0;

    // Calculate graduation rate
    const graduatedStudents = students.filter(s => s.status === "GRADUATED").length;
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
        { error: "Validation error", details: error.errors },
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
