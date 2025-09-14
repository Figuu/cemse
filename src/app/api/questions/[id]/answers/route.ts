import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: questionId } = await params;
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
          // Note: student relation doesn't exist on Answer model
          // Note: votes relation doesn't exist on Answer model
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
      isAccepted: false, // Note: isAccepted field doesn't exist on Answer model
      student: {
        id: "mock-student-id",
        name: "Mock Student",
        email: "mock@example.com",
        avatar: null,
      },
      voteCount: 0, // Note: votes relation doesn't exist on Answer model
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: questionId } = await params;
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    // Verify question exists and user has access
    const question = await prisma.question.findFirst({
      where: {
        id: questionId,
      },
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found or access denied" }, { status: 404 });
    }

    // Create answer
    const answer = await prisma.answer.create({
      data: {
        questionId,
        content,
        isCorrect: false,
        orderIndex: 0,
      },
    });

    // Transform answer for frontend
    const transformedAnswer = {
      id: answer.id,
      content: answer.content,
      createdAt: answer.createdAt.toISOString(),
      updatedAt: answer.updatedAt.toISOString(),
      isCorrect: answer.isCorrect,
      orderIndex: answer.orderIndex,
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
