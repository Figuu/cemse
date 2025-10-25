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

    // Simple and straightforward - just get the counts!

    // 1. Count all courses for this institution
    const totalCourses = await prisma.course.count({
      where: {
        institutionId: institutionId,
      },
    });

    // 2. Count active courses (courses that are active and not null)
    const activeCourses = await prisma.course.count({
      where: {
        institutionId: institutionId,
        isActive: true,
      },
    });

    // 3. Count all students (profiles) for this institution
    const totalStudents = await prisma.profile.count({
      where: {
        institutionId: institutionId,
      },
    });

    // 4. Count all programs (companies) for this institution
    const totalPrograms = await prisma.company.count({
      where: {
        institutionId: institutionId,
      },
    });

    // 5. Count all enrollments for students from this institution
    const totalEnrollments = await prisma.courseEnrollment.count({
      where: {
        student: {
          institutionId: institutionId,
        },
      },
    });

    // 6. Count resources (news articles) - you might want to adjust this based on your resource model
    const totalResources = await prisma.newsArticle.count({
      where: {
        authorType: "INSTITUTION",
        // Add institution relation if available
      },
    });

    // 7. Get institution basic info
    const institution = await prisma.institution.findUnique({
      where: { id: institutionId },
      select: {
        id: true,
        name: true,
        department: true,
        region: true,
        institutionType: true,
      },
    });

    if (!institution) {
      return NextResponse.json(
        { error: "Institution not found" },
        { status: 404 }
      );
    }

    // Debug logging
    console.log('Analytics Debug:', {
      institutionId,
      totalStudents,
      totalPrograms,
      totalCourses,
      activeCourses,
      totalEnrollments,
      totalResources,
    });

    // Simple response with just the counts
    const analytics = {
      institution,
      overview: {
        totalStudents,
        totalPrograms,
        totalCourses,
        activeCourses,
        totalEnrollments,
        totalResources,
        totalAnnouncements: totalResources, // Using resources as announcements
        totalEvents: 0, // Set to 0 for now
      },
      // Keep these empty for now to not break the UI
      studentStatusDistribution: {},
      programLevelDistribution: {},
      courseLevelDistribution: {},
      enrollmentStatusDistribution: {},
      dailyMetrics: [],
      topPerformingPrograms: [],
      topPerformingCourses: [],
      academicPerformance: {
        averageGrade: 0,
        completionRate: 0,
        retentionRate: 0,
        graduationRate: 0,
      },
      engagementMetrics: {
        averageStudentsPerProgram: totalPrograms > 0 ? totalStudents / totalPrograms : 0,
        averageCoursesPerProgram: totalPrograms > 0 ? totalCourses / totalPrograms : 0,
        averageEnrollmentsPerCourse: totalCourses > 0 ? totalEnrollments / totalCourses : 0,
        announcementFrequency: 0,
        eventFrequency: 0,
      },
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
