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
    const contextType = searchParams.get("contextType") as "JOB_APPLICATION" | "YOUTH_APPLICATION" | "ENTREPRENEURSHIP" | "GENERAL" | null;
    const contextId = searchParams.get("contextId");
    const recipientId = searchParams.get("recipientId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const skip = (page - 1) * limit;

    // Build where clause based on filters
    const where: Record<string, unknown> = {
      OR: [
        { senderId: session.user.id },
        { recipientId: session.user.id }
      ]
    };

    if (contextType) {
      where.contextType = contextType;
    }

    if (contextId) {
      where.contextId = contextId;
    }

    if (recipientId) {
      where.AND = [
        {
          OR: [
            { senderId: session.user.id, recipientId },
            { senderId: recipientId, recipientId: session.user.id }
          ]
        }
      ];
    }

    // Get messages with pagination
    const [messages, totalCount] = await Promise.all([
      prisma.message.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          sender: {
            include: {
              profile: true,
            },
          },
          recipient: {
            include: {
              profile: true,
            },
          },
        },
      }),
      prisma.message.count({ where }),
    ]);

    // Transform messages for frontend
    const transformedMessages = messages.map(message => ({
      id: message.id,
      senderId: message.senderId,
      recipientId: message.recipientId,
      content: message.content,
      messageType: message.messageType,
      isRead: message.isRead,
      contextType: message.contextType,
      contextId: message.contextId,
      createdAt: message.createdAt.toISOString(),
      updatedAt: message.updatedAt.toISOString(),
      sender: {
        id: message.sender.id,
        name: `${message.sender.profile?.firstName || ''} ${message.sender.profile?.lastName || ''}`.trim(),
        role: message.sender.role,
        avatar: message.sender.profile?.avatarUrl,
      },
      recipient: {
        id: message.recipient.id,
        name: `${message.recipient.profile?.firstName || ''} ${message.recipient.profile?.lastName || ''}`.trim(),
        role: message.recipient.role,
        avatar: message.recipient.profile?.avatarUrl,
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
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
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
    const { 
      recipientId, 
      content, 
      messageType = "text", 
      contextType = "GENERAL", 
      contextId = null 
    } = body;

    if (!recipientId || !content || content.trim().length === 0) {
      return NextResponse.json({ error: "Recipient ID and content are required" }, { status: 400 });
    }

    // Verify recipient exists
    const recipient = await prisma.profile.findUnique({
      where: { userId: recipientId },
    });

    if (!recipient) {
      return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
    }

    // Create message
    const newMessage = await prisma.message.create({
      data: {
        senderId: session.user.id,
        recipientId,
        content: content.trim(),
        messageType,
        contextType,
        contextId,
      },
      include: {
        sender: {
          include: {
            profile: true,
          },
        },
        recipient: {
          include: {
            profile: true,
          },
        },
      },
    });

    // Create notification for recipient
    try {
      await prisma.notification.create({
        data: {
          userId: recipientId,
          type: "MESSAGE",
          title: "Nuevo Mensaje",
          message: `Nuevo mensaje de ${newMessage.sender.profile?.firstName} ${newMessage.sender.profile?.lastName}`,
          data: {
            messageId: newMessage.id,
            senderId: session.user.id,
            contextType,
            contextId,
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
        recipientId: newMessage.recipientId,
        content: newMessage.content,
        messageType: newMessage.messageType,
        isRead: newMessage.isRead,
        contextType: newMessage.contextType,
        contextId: newMessage.contextId,
        createdAt: newMessage.createdAt.toISOString(),
        updatedAt: newMessage.updatedAt.toISOString(),
        sender: {
          id: newMessage.sender.id,
          name: `${newMessage.sender.profile?.firstName || ''} ${newMessage.sender.profile?.lastName || ''}`.trim(),
          role: newMessage.sender.role,
          avatar: newMessage.sender.profile?.avatarUrl,
        },
        recipient: {
          id: newMessage.recipient.id,
          name: `${newMessage.recipient.profile?.firstName || ''} ${newMessage.recipient.profile?.lastName || ''}`.trim(),
          role: newMessage.recipient.role,
          avatar: newMessage.recipient.profile?.avatarUrl,
        },
      },
    });

  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 }
    );
  }
}
