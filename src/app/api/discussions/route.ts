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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const courseId = searchParams.get("courseId");
    const lessonId = searchParams.get("lessonId");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (courseId) {
      where.courseId = courseId;
    }

    if (lessonId) {
      where.lessonId = lessonId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    // Build orderBy clause
    const orderBy: Record<string, string> = {};
    orderBy[sortBy] = sortOrder;

    const [discussions, totalCount] = await Promise.all([
      prisma.discussion.findMany({
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
          lesson: {
            include: {
              module: {
                include: {
                  course: true,
                },
              },
            },
          },
          course: {
            include: {
              instructor: {
                include: {
                  profile: true,
                },
              },
            },
          },
          _count: {
            select: {
              replies: true,
            },
          },
        },
      }),
      prisma.discussion.count({ where }),
    ]);

    // Transform discussions for frontend
    const transformedDiscussions = discussions.map(discussion => ({
      id: discussion.id,
      title: discussion.title,
      content: discussion.content,
      createdAt: discussion.createdAt.toISOString(),
      updatedAt: discussion.updatedAt.toISOString(),
      student: {
        id: discussion.student.id,
        name: `${discussion.student.profile?.firstName || ''} ${discussion.student.profile?.lastName || ''}`.trim(),
        email: discussion.student.profile?.email || '',
        avatar: discussion.student.profile?.avatar || null,
      },
      course: discussion.course ? {
        id: discussion.course.id,
        title: discussion.course.title,
        instructor: discussion.course.instructor ? {
          id: discussion.course.instructor.id,
          name: `${discussion.course.instructor.profile?.firstName || ''} ${discussion.course.instructor.profile?.lastName || ''}`.trim(),
        } : null,
      } : null,
      lesson: discussion.lesson ? {
        id: discussion.lesson.id,
        title: discussion.lesson.title,
        module: {
          id: discussion.lesson.module.id,
          title: discussion.lesson.module.title,
          course: {
            id: discussion.lesson.module.course.id,
            title: discussion.lesson.module.course.title,
          },
        },
      } : null,
      replyCount: discussion._count.replies,
    }));

    return NextResponse.json({
      success: true,
      discussions: transformedDiscussions,
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
    console.error("Error fetching discussions:", error);
    return NextResponse.json(
      { error: "Failed to fetch discussions" },
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

    const body = await request.json();
    const { title, content, courseId, lessonId } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    if (!courseId && !lessonId) {
      return NextResponse.json({ error: "Either courseId or lessonId is required" }, { status: 400 });
    }

    // Verify access to course or lesson
    if (courseId) {
      const course = await prisma.course.findFirst({
        where: {
          id: courseId,
          OR: [
            { instructorId: session.user.id },
            { enrollments: { some: { studentId: session.user.id } } },
          ],
        },
      });

      if (!course) {
        return NextResponse.json({ error: "Course not found or access denied" }, { status: 404 });
      }
    }

    if (lessonId) {
      const lesson = await prisma.lesson.findFirst({
        where: {
          id: lessonId,
          module: {
            course: {
              OR: [
                { instructorId: session.user.id },
                { enrollments: { some: { studentId: session.user.id } } },
              ],
            },
          },
        },
      });

      if (!lesson) {
        return NextResponse.json({ error: "Lesson not found or access denied" }, { status: 404 });
      }
    }

    // Create discussion
    const discussion = await prisma.discussion.create({
      data: {
        studentId: session.user.id,
        title,
        content,
        courseId: courseId || null,
        lessonId: lessonId || null,
      },
      include: {
        student: {
          include: {
            profile: true,
          },
        },
        lesson: {
          include: {
            module: {
              include: {
                course: true,
              },
            },
          },
        },
        course: {
          include: {
            instructor: {
              include: {
                profile: true,
              },
            },
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
    });

    // Transform discussion for frontend
    const transformedDiscussion = {
      id: discussion.id,
      title: discussion.title,
      content: discussion.content,
      createdAt: discussion.createdAt.toISOString(),
      updatedAt: discussion.updatedAt.toISOString(),
      student: {
        id: discussion.student.id,
        name: `${discussion.student.profile?.firstName || ''} ${discussion.student.profile?.lastName || ''}`.trim(),
        email: discussion.student.profile?.email || '',
        avatar: discussion.student.profile?.avatar || null,
      },
      course: discussion.course ? {
        id: discussion.course.id,
        title: discussion.course.title,
        instructor: discussion.course.instructor ? {
          id: discussion.course.instructor.id,
          name: `${discussion.course.instructor.profile?.firstName || ''} ${discussion.course.instructor.profile?.lastName || ''}`.trim(),
        } : null,
      } : null,
      lesson: discussion.lesson ? {
        id: discussion.lesson.id,
        title: discussion.lesson.title,
        module: {
          id: discussion.lesson.module.id,
          title: discussion.lesson.module.title,
          course: {
            id: discussion.lesson.module.course.id,
            title: discussion.lesson.module.course.title,
          },
        },
      } : null,
      replyCount: discussion._count.replies,
    };

    return NextResponse.json({
      success: true,
      discussion: transformedDiscussion,
    });

  } catch (error) {
    console.error("Error creating discussion:", error);
    return NextResponse.json(
      { error: "Failed to create discussion" },
      { status: 500 }
    );
  }
}
