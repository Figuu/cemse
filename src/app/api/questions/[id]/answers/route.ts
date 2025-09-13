import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const questionId = params.id;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "asc";

    const skip = (page - 1) * limit;

    // Verify question exists and user has access
    const question = await prisma.question.findFirst({
      where: {
        id: questionId,
        OR: [
          { courseId: { not: null }, course: { enrollments: { some: { studentId: session.user.id } } } },
          { courseId: { not: null }, course: { instructorId: session.user.id } },
          { lessonId: { not: null }, lesson: { module: { course: { enrollments: { some: { studentId: session.user.id } } } } } },
          { lessonId: { not: null }, lesson: { module: { course: { instructorId: session.user.id } } } },
        ],
      },
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found or access denied" }, { status: 404 });
    }

    // Build orderBy clause
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [answers, totalCount] = await Promise.all([
      prisma.answer.findMany({
        where: { questionId },
        orderBy,
        skip,
        take: limit,
        include: {
          student: {
            include: {
              profile: true,
            },
          },
          _count: {
            select: {
              votes: true,
            },
          },
        },
      }),
      prisma.answer.count({ where: { questionId } }),
    ]);

    // Transform answers for frontend
    const transformedAnswers = answers.map(answer => ({
      id: answer.id,
      content: answer.content,
      createdAt: answer.createdAt.toISOString(),
      updatedAt: answer.updatedAt.toISOString(),
      isAccepted: answer.isAccepted,
      student: {
        id: answer.student.id,
        name: `${answer.student.profile?.firstName || ''} ${answer.student.profile?.lastName || ''}`.trim(),
        email: answer.student.profile?.email || '',
        avatar: answer.student.profile?.avatar || null,
      },
      voteCount: answer._count.votes,
      isUpvoted: false,
    }));

    return NextResponse.json({
      success: true,
      answers: transformedAnswers,
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
    console.error("Error fetching question answers:", error);
    return NextResponse.json(
      { error: "Failed to fetch question answers" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const questionId = params.id;
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    // Verify question exists and user has access
    const question = await prisma.question.findFirst({
      where: {
        id: questionId,
        OR: [
          { courseId: { not: null }, course: { enrollments: { some: { studentId: session.user.id } } } },
          { courseId: { not: null }, course: { instructorId: session.user.id } },
          { lessonId: { not: null }, lesson: { module: { course: { enrollments: { some: { studentId: session.user.id } } } } } },
          { lessonId: { not: null }, lesson: { module: { course: { instructorId: session.user.id } } } },
        ],
      },
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found or access denied" }, { status: 404 });
    }

    // Create answer
    const answer = await prisma.answer.create({
      data: {
        questionId,
        studentId: session.user.id,
        content,
      },
      include: {
        student: {
          include: {
            profile: true,
          },
        },
        _count: {
          select: {
            votes: true,
          },
        },
      },
    });

    // Transform answer for frontend
    const transformedAnswer = {
      id: answer.id,
      content: answer.content,
      createdAt: answer.createdAt.toISOString(),
      updatedAt: answer.updatedAt.toISOString(),
      isAccepted: answer.isAccepted,
      student: {
        id: answer.student.id,
        name: `${answer.student.profile?.firstName || ''} ${answer.student.profile?.lastName || ''}`.trim(),
        email: answer.student.profile?.email || '',
        avatar: answer.student.profile?.avatar || null,
      },
      voteCount: answer._count.votes,
      isUpvoted: false,
    };

    return NextResponse.json({
      success: true,
      answer: transformedAnswer,
    });

  } catch (error) {
    console.error("Error creating answer:", error);
    return NextResponse.json(
      { error: "Failed to create answer" },
      { status: 500 }
    );
  }
}
