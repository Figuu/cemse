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
    const status = searchParams.get("status"); // "open", "answered", "closed"
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

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

    if (status) {
      if (status === "answered") {
        where.answers = { some: {} };
      } else if (status === "open") {
        where.answers = { none: {} };
      }
    }

    // Build orderBy clause
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [questions, totalCount] = await Promise.all([
      prisma.question.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          answers: {
            orderBy: { createdAt: "asc" },
          },
          _count: {
            select: {
              answers: true,
            },
          },
        },
      }),
      prisma.question.count({ where }),
    ]);

    // Transform questions for frontend
    const transformedQuestions = questions.map(question => ({
      id: question.id,
      title: question.title,
      content: question.content,
      category: question.category,
      difficulty: question.difficulty,
      points: question.points,
      isActive: question.isActive,
      createdAt: question.createdAt.toISOString(),
      updatedAt: question.updatedAt.toISOString(),
      answers: question.answers,
      answerCount: question._count.answers,
    }));

    return NextResponse.json({
      success: true,
      questions: transformedQuestions,
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
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
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

    // Create question
    const question = await prisma.question.create({
      data: {
        title,
        content,
        category: courseId ? 'course' : 'general',
      },
      include: {
        answers: {
          orderBy: { createdAt: "asc" },
        },
        _count: {
          select: {
            answers: true,
          },
        },
      },
    });

    // Transform question for frontend
    const transformedQuestion = {
      id: question.id,
      title: question.title,
      content: question.content,
      category: question.category,
      difficulty: question.difficulty,
      points: question.points,
      isActive: question.isActive,
      createdAt: question.createdAt.toISOString(),
      updatedAt: question.updatedAt.toISOString(),
      answers: question.answers,
      answerCount: question._count.answers,
    };

    return NextResponse.json({
      success: true,
      question: transformedQuestion,
    });

  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { error: "Failed to create question" },
      { status: 500 }
    );
  }
}
