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
    const courseId = searchParams.get("courseId");
    const lessonId = searchParams.get("lessonId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      isActive: true,
    };

    if (courseId) {
      where.courseId = courseId;
    }

    if (lessonId) {
      where.lessonId = lessonId;
    }

    // Get quizzes
    const [quizzes, totalCount] = await Promise.all([
      prisma.quiz.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          lesson: {
            include: {
              module: {
                include: {
                  course: true,
                },
              },
            },
          },
          course: true,
          attempts: {
            where: {
              studentId: session.user.id,
            },
            orderBy: { completedAt: "desc" },
            take: 1,
          },
          _count: {
            select: {
              attempts: true,
            },
          },
        },
      }),
      prisma.quiz.count({ where }),
    ]);

    // Transform quizzes for frontend
    const transformedQuizzes = quizzes.map(quiz => {
      const latestAttempt = quiz.attempts[0];
      const hasAttempts = quiz.attempts.length > 0;
      const canRetake = quiz.maxAttempts === 0 || (quiz.maxAttempts > 0 && quiz.attempts.length < quiz.maxAttempts);
      const isPassed = latestAttempt?.passed || false;
      const bestScore = hasAttempts ? Math.max(...quiz.attempts.map(a => Number(a.score))) : 0;

      return {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        timeLimit: quiz.timeLimit,
        passingScore: quiz.passingScore,
        maxAttempts: quiz.maxAttempts,
        isActive: quiz.isActive,
        questions: quiz.questions,
        lesson: quiz.lesson ? {
          id: quiz.lesson.id,
          title: quiz.lesson.title,
          module: {
            id: quiz.lesson.module.id,
            title: quiz.lesson.module.title,
            course: {
              id: quiz.lesson.module.course.id,
              title: quiz.lesson.module.course.title,
            },
          },
        } : null,
        course: quiz.course ? {
          id: quiz.course.id,
          title: quiz.course.title,
        } : null,
        attempts: {
          count: quiz._count.attempts,
          latest: latestAttempt ? {
            id: latestAttempt.id,
            score: Number(latestAttempt.score),
            passed: latestAttempt.passed,
            completedAt: latestAttempt.completedAt.toISOString(),
          } : null,
          bestScore,
          canRetake,
          isPassed,
        },
      };
    });

    return NextResponse.json({
      success: true,
      quizzes: transformedQuizzes,
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
    console.error("Error fetching quizzes:", error);
    return NextResponse.json(
      { error: "Failed to fetch quizzes" },
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

    // Only instructors and admins can create quizzes
    if (!["INSTRUCTOR", "SUPERADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      description,
      questions,
      timeLimit,
      passingScore,
      maxAttempts,
      courseId,
      lessonId,
    } = body;

    if (!title || !questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate that either courseId or lessonId is provided
    if (!courseId && !lessonId) {
      return NextResponse.json({ error: "Either courseId or lessonId is required" }, { status: 400 });
    }

    // Verify course/lesson access
    if (courseId) {
      const course = await prisma.course.findFirst({
        where: {
          id: courseId,
          instructorId: session.user.id,
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
              instructorId: session.user.id,
            },
          },
        },
      });

      if (!lesson) {
        return NextResponse.json({ error: "Lesson not found or access denied" }, { status: 404 });
      }
    }

    // Create quiz
    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        questions: questions,
        timeLimit: timeLimit || null,
        passingScore: passingScore || 70,
        maxAttempts: maxAttempts || 0,
        courseId: courseId || null,
        lessonId: lessonId || null,
      },
      include: {
        lesson: {
          include: {
            module: {
              include: {
                course: true,
              },
            },
          },
        },
        course: true,
      },
    });

    return NextResponse.json({
      success: true,
      quiz: {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        timeLimit: quiz.timeLimit,
        passingScore: quiz.passingScore,
        maxAttempts: quiz.maxAttempts,
        courseId: quiz.courseId,
        lessonId: quiz.lessonId,
        createdAt: quiz.createdAt.toISOString(),
      },
    });

  } catch (error) {
    console.error("Error creating quiz:", error);
    return NextResponse.json(
      { error: "Failed to create quiz" },
      { status: 500 }
    );
  }
}
