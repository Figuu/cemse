import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is youth
    if (session.user.role !== "YOUTH") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const userId = session.user.id;

    // Get youth statistics
    const [
      completedCourses,
      totalCertificates,
      jobApplications,
      enrolledCourses,
      studyHours
    ] = await Promise.all([
      // Completed courses
      prisma.courseEnrollment.count({
        where: {
          studentId: userId,
          progress: {
            gte: 100
          }
        }
      }),
      
      // Total certificates (assuming certificates are issued for completed courses)
      prisma.courseEnrollment.count({
        where: {
          studentId: userId,
          progress: {
            gte: 100
          }
        }
      }),
      
      // Job applications
      prisma.jobApplication.count({
        where: {
          applicantId: userId
        }
      }),
      
      // Enrolled courses
      prisma.courseEnrollment.count({
        where: {
          studentId: userId,
          progress: {
            lt: 100
          }
        }
      }),
      
      // Study hours (estimated from course progress)
      prisma.courseEnrollment.aggregate({
        where: {
          studentId: userId
        },
        _sum: {
          progress: true
        }
      })
    ]);

    // Calculate study hours (rough estimate based on progress)
    const totalProgress = studyHours._sum.progress?.toNumber() || 0;
    const estimatedStudyHours = Math.round(totalProgress / 100 * 50); // Assuming 50 hours per course on average

    const stats = {
      completedCourses,
      totalCertificates,
      jobApplications,
      enrolledCourses,
      studyHours: estimatedStudyHours,
    };

    return NextResponse.json({
      success: true,
      stats,
    });

  } catch (error) {
    console.error("Error fetching youth stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch youth statistics" },
      { status: 500 }
    );
  }
}
