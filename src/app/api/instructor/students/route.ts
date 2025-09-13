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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const courseId = searchParams.get("courseId");
    const status = searchParams.get("status"); // "active", "completed", "inactive"
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "enrolledAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    // Build where clause for enrollments
    const where: any = {
      course: {
        instructorId: session.user.id,
      },
    };

    if (courseId) {
      where.courseId = courseId;
    }

    if (status) {
      if (status === "completed") {
        where.isCompleted = true;
      } else if (status === "active") {
        where.isCompleted = false;
      }
    }

    if (search) {
      where.student = {
        profile: {
          OR: [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        },
      };
    }

    // Build orderBy clause
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [enrollments, totalCount] = await Promise.all([
      prisma.courseEnrollment.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          student: {
            include: {
              profile: true,
            },
          },
          course: {
            include: {
              modules: {
                include: {
                  lessons: true,
                },
              },
            },
          },
        },
      }),
      prisma.courseEnrollment.count({ where }),
    ]);

    // Transform enrollments for frontend
    const transformedStudents = enrollments.map(enrollment => {
      const totalLessons = enrollment.course.modules.reduce((acc, module) => acc + module.lessons.length, 0);
      const progressPercentage = totalLessons > 0 ? Math.round((enrollment.progress || 0) / totalLessons * 100) : 0;

      return {
        id: enrollment.student.id,
        name: `${enrollment.student.profile?.firstName || ''} ${enrollment.student.profile?.lastName || ''}`.trim(),
        email: enrollment.student.profile?.email || '',
        avatar: enrollment.student.profile?.avatar || null,
        course: {
          id: enrollment.course.id,
          title: enrollment.course.title,
        },
        enrollment: {
          id: enrollment.id,
          enrolledAt: enrollment.enrolledAt.toISOString(),
          completedAt: enrollment.completedAt?.toISOString() || null,
          isCompleted: enrollment.isCompleted,
          progress: enrollment.progress || 0,
          progressPercentage,
        },
        stats: {
          totalLessons: totalLessons,
          completedLessons: enrollment.progress || 0,
          lastActivity: enrollment.updatedAt.toISOString(),
        },
      };
    });

    return NextResponse.json({
      success: true,
      students: transformedStudents,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPreviousPage: page > 1,
      },
    });

  } catch (error) {
    console.error("Error fetching instructor students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}
