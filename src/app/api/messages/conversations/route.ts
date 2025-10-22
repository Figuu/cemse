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
    const contextType = searchParams.get("contextType");
    const contextId = searchParams.get("contextId");

    // Build where clause for context filtering
    const where: any = {
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

    // Get all messages for the user
    const messages = await prisma.message.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        sender: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        recipient: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Group messages by conversation (other user)
    const conversationMap = new Map<string, any>();

    messages.forEach((message) => {
      const otherUserId = message.senderId === session.user.id 
        ? message.recipientId 
        : message.senderId;
      
      const otherUser = message.senderId === session.user.id 
        ? message.recipient 
        : message.sender;

      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, {
          id: otherUserId,
          otherUser: {
            id: otherUserId,
            firstName: otherUser.firstName,
            lastName: otherUser.lastName,
            avatarUrl: otherUser.avatarUrl,
          },
          lastMessage: null,
          unreadCount: 0,
          contextId: message.contextId, // Add contextId from the message
          contextType: message.contextType, // Add contextType from the message
        });
      }

      const conversation = conversationMap.get(otherUserId);
      
      // Set the most recent message
      if (!conversation.lastMessage || new Date(message.createdAt) > new Date(conversation.lastMessage.createdAt)) {
        conversation.lastMessage = {
          content: message.content,
          createdAt: message.createdAt.toISOString(),
          readAt: message.readAt?.toISOString(),
        };
      }

      // Count unread messages (messages sent to current user that are not read)
      if (message.recipientId === session.user.id && !message.readAt) {
        conversation.unreadCount++;
      }
    });

    const conversations = Array.from(conversationMap.values());

    return NextResponse.json({
      conversations,
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}
