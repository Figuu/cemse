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

    const discussionId = params.id;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "asc";

    const skip = (page - 1) * limit;

    // Verify discussion exists and user has access
    const discussion = await prisma.discussion.findFirst({
      where: {
        id: discussionId,
        OR: [
          { courseId: { not: null }, course: { enrollments: { some: { studentId: session.user.id } } } },
          { courseId: { not: null }, course: { instructorId: session.user.id } },
          { lessonId: { not: null }, lesson: { module: { course: { enrollments: { some: { studentId: session.user.id } } } } } },
          { lessonId: { not: null }, lesson: { module: { course: { instructorId: session.user.id } } } },
        ],
      },
    });

    if (!discussion) {
      return NextResponse.json({ error: "Discussion not found or access denied" }, { status: 404 });
    }

    // Build orderBy clause
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [replies, totalCount] = await Promise.all([
      prisma.discussionReply.findMany({
        where: { discussionId },
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
      prisma.discussionReply.count({ where: { discussionId } }),
    ]);

    // Transform replies for frontend
    const transformedReplies = replies.map(reply => ({
      id: reply.id,
      content: reply.content,
      createdAt: reply.createdAt.toISOString(),
      updatedAt: reply.updatedAt.toISOString(),
      student: {
        id: reply.student.id,
        name: `${reply.student.profile?.firstName || ''} ${reply.student.profile?.lastName || ''}`.trim(),
        email: reply.student.profile?.email || '',
        avatar: reply.student.profile?.avatar || null,
      },
      voteCount: reply._count.votes,
      isUpvoted: false, // Will be set by client-side logic
    }));

    return NextResponse.json({
      success: true,
      replies: transformedReplies,
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
    console.error("Error fetching discussion replies:", error);
    return NextResponse.json(
      { error: "Failed to fetch discussion replies" },
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

    const discussionId = params.id;
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    // Verify discussion exists and user has access
    const discussion = await prisma.discussion.findFirst({
      where: {
        id: discussionId,
        OR: [
          { courseId: { not: null }, course: { enrollments: { some: { studentId: session.user.id } } } },
          { courseId: { not: null }, course: { instructorId: session.user.id } },
          { lessonId: { not: null }, lesson: { module: { course: { enrollments: { some: { studentId: session.user.id } } } } } },
          { lessonId: { not: null }, lesson: { module: { course: { instructorId: session.user.id } } } },
        ],
      },
    });

    if (!discussion) {
      return NextResponse.json({ error: "Discussion not found or access denied" }, { status: 404 });
    }

    // Create reply
    const reply = await prisma.discussionReply.create({
      data: {
        discussionId,
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

    // Transform reply for frontend
    const transformedReply = {
      id: reply.id,
      content: reply.content,
      createdAt: reply.createdAt.toISOString(),
      updatedAt: reply.updatedAt.toISOString(),
      student: {
        id: reply.student.id,
        name: `${reply.student.profile?.firstName || ''} ${reply.student.profile?.lastName || ''}`.trim(),
        email: reply.student.profile?.email || '',
        avatar: reply.student.profile?.avatar || null,
      },
      voteCount: reply._count.votes,
      isUpvoted: false,
    };

    return NextResponse.json({
      success: true,
      reply: transformedReply,
    });

  } catch (error) {
    console.error("Error creating discussion reply:", error);
    return NextResponse.json(
      { error: "Failed to create discussion reply" },
      { status: 500 }
    );
  }
}
