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

    const interviewId = params.id;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const skip = (page - 1) * limit;

    // Verify interview access
    const interview = await prisma.interview.findFirst({
      where: {
        id: interviewId,
        OR: [
          // Company can see their interview messages
          {
            application: {
              jobOffer: {
                company: {
                  createdBy: session.user.id,
                },
              },
            },
          },
          // Candidate can see their interview messages
          {
            application: {
              applicantId: session.user.id,
            },
          },
        ],
      },
    });

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    // Get messages
    const [messages, totalCount] = await Promise.all([
      prisma.interviewMessage.findMany({
        where: { interviewId },
        orderBy: { createdAt: "asc" },
        skip,
        take: limit,
        include: {
          sender: {
            include: {
              profile: true,
            },
          },
        },
      }),
      prisma.interviewMessage.count({ where: { interviewId } }),
    ]);

    // Transform messages for frontend
    const transformedMessages = messages.map(message => ({
      id: message.id,
      senderId: message.senderId,
      message: message.message,
      createdAt: message.createdAt.toISOString(),
      sender: {
        id: message.sender.id,
        name: `${message.sender.profile?.firstName || ''} ${message.sender.profile?.lastName || ''}`.trim(),
        role: message.sender.role,
        avatar: message.sender.profile?.avatarUrl,
      },
    }));

    return NextResponse.json({
      success: true,
      messages: transformedMessages,
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
    console.error("Error fetching interview messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch interview messages" },
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

    const interviewId = params.id;
    const body = await request.json();
    const { message } = body;

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Verify interview access
    const interview = await prisma.interview.findFirst({
      where: {
        id: interviewId,
        OR: [
          // Company can send messages to their interviews
          {
            application: {
              jobOffer: {
                company: {
                  createdBy: session.user.id,
                },
              },
            },
          },
          // Candidate can send messages to their interviews
          {
            application: {
              applicantId: session.user.id,
            },
          },
        ],
      },
    });

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    // Create message
    const newMessage = await prisma.interviewMessage.create({
      data: {
        interviewId,
        senderId: session.user.id,
        message: message.trim(),
      },
      include: {
        sender: {
          include: {
            profile: true,
          },
        },
      },
    });

    // Send notification to the other party
    try {
      const otherUserId = session.user.role === "COMPANIES" 
        ? interview.application.applicantId 
        : interview.application.jobOffer.company.createdBy;

      await prisma.notification.create({
        data: {
          userId: otherUserId,
          type: "INTERVIEW_MESSAGE",
          title: "Nuevo Mensaje de Entrevista",
          message: `Nuevo mensaje en la entrevista para ${interview.application.jobOffer.title}`,
          data: {
            interviewId: interview.id,
            applicationId: interview.applicationId,
            senderId: session.user.id,
          },
        },
      });
    } catch (notificationError) {
      console.error("Error creating message notification:", notificationError);
      // Don't fail the message creation if notification fails
    }

    return NextResponse.json({
      success: true,
      message: {
        id: newMessage.id,
        senderId: newMessage.senderId,
        message: newMessage.message,
        createdAt: newMessage.createdAt.toISOString(),
        sender: {
          id: newMessage.sender.id,
          name: `${newMessage.sender.profile?.firstName || ''} ${newMessage.sender.profile?.lastName || ''}`.trim(),
          role: newMessage.sender.role,
          avatar: newMessage.sender.profile?.avatarUrl,
        },
      },
    });

  } catch (error) {
    console.error("Error creating interview message:", error);
    return NextResponse.json(
      { error: "Failed to create interview message" },
      { status: 500 }
    );
  }
}
