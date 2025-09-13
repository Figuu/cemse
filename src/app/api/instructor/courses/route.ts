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
    const status = searchParams.get("status"); // "active", "draft", "completed"
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      instructorId: session.user.id,
    };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Build orderBy clause
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [courses, totalCount] = await Promise.all([
      prisma.course.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          instructor: {
            include: {
              profile: true,
            },
          },
          modules: {
            include: {
              lessons: true,
            },
          },
          enrollments: {
            include: {
              student: {
                include: {
                  profile: true,
                },
              },
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
      }),
      prisma.course.count({ where }),
    ]);

    // Transform courses for frontend
    const transformedCourses = courses.map(course => {
      const totalLessons = course.modules.reduce((acc, module) => acc + module.lessons.length, 0);
      const completedEnrollments = course.enrollments.filter(enrollment => enrollment.isCompleted).length;
      const averageProgress = course.enrollments.length > 0 
        ? course.enrollments.reduce((acc, enrollment) => acc + (enrollment.progress || 0), 0) / course.enrollments.length
        : 0;

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        status: course.status,
        level: course.level,
        duration: course.duration,
        createdAt: course.createdAt.toISOString(),
        updatedAt: course.updatedAt.toISOString(),
        instructor: {
          id: course.instructor.id,
          name: `${course.instructor.profile?.firstName || ''} ${course.instructor.profile?.lastName || ''}`.trim(),
          email: course.instructor.profile?.email || '',
        },
        stats: {
          totalStudents: course._count.enrollments,
          completedStudents: completedEnrollments,
          totalModules: course._count.modules,
          totalLessons: totalLessons,
          totalDiscussions: course._count.discussions,
          totalQuestions: course._count.questions,
          averageProgress: Math.round(averageProgress),
        },
        modules: course.modules.map(module => ({
          id: module.id,
          title: module.title,
          description: module.description,
          order: module.order,
          lessonCount: module.lessons.length,
        })),
        recentStudents: course.enrollments.slice(0, 5).map(enrollment => ({
          id: enrollment.student.id,
          name: `${enrollment.student.profile?.firstName || ''} ${enrollment.student.profile?.lastName || ''}`.trim(),
          email: enrollment.student.profile?.email || '',
          progress: enrollment.progress || 0,
          isCompleted: enrollment.isCompleted,
          enrolledAt: enrollment.enrolledAt.toISOString(),
        })),
      };
    });

    return NextResponse.json({
      success: true,
      courses: transformedCourses,
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
    console.error("Error fetching instructor courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only instructors can create courses
    if (session.user.role !== "INSTRUCTOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, level, duration, status = "draft" } = body;

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    // Create course
    const course = await prisma.course.create({
      data: {
        title,
        description,
        level: level || "BEGINNER",
        duration: duration || 0,
        status: status as "DRAFT" | "ACTIVE" | "COMPLETED",
        instructorId: session.user.id,
      },
      include: {
        instructor: {
          include: {
            profile: true,
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
    });

    // Transform course for frontend
    const transformedCourse = {
      id: course.id,
      title: course.title,
      description: course.description,
      status: course.status,
      level: course.level,
      duration: course.duration,
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
      instructor: {
        id: course.instructor.id,
        name: `${course.instructor.profile?.firstName || ''} ${course.instructor.profile?.lastName || ''}`.trim(),
        email: course.instructor.profile?.email || '',
      },
      stats: {
        totalStudents: 0,
        completedStudents: 0,
        totalModules: 0,
        totalLessons: 0,
        totalDiscussions: 0,
        totalQuestions: 0,
        averageProgress: 0,
      },
      modules: [],
      recentStudents: [],
    };

    return NextResponse.json({
      success: true,
      course: transformedCourse,
    });

  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}
