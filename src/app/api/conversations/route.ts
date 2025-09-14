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

    // Get all unique conversations for the user
    const conversations = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: session.user.id },
          { recipientId: session.user.id }
        ],
        ...(contextType && { contextType }),
        ...(contextId && { contextId }),
      },
      orderBy: { createdAt: "desc" },
      include: {
        sender: true,
        recipient: true,
      },
    });

    // Group messages by conversation partner and context
    const conversationMap = new Map();

    conversations.forEach(message => {
      const isSender = message.senderId === session.user.id;
      const otherUserId = isSender ? message.recipientId : message.senderId;
      const conversationKey = `${otherUserId}-${message.contextType}-${message.contextId || 'general'}`;
      
      if (!conversationMap.has(conversationKey)) {
        conversationMap.set(conversationKey, {
          id: conversationKey,
          otherUser: isSender ? message.recipient : message.sender,
          contextType: message.contextType,
          contextId: message.contextId,
          lastMessage: message,
          unreadCount: 0,
          totalMessages: 0,
        });
      }

      const conversation = conversationMap.get(conversationKey);
      conversation.totalMessages++;
      
      // Count unread messages (only for messages where current user is recipient)
      if (!isSender && !message.readAt) {
        conversation.unreadCount++;
      }

      // Update last message if this is more recent
      if (message.createdAt > conversation.lastMessage.createdAt) {
        conversation.lastMessage = message;
      }
    });

    // Convert to array and sort by last message date
    const conversationList = Array.from(conversationMap.values())
      .map(conversation => ({
        id: conversation.id,
        otherUser: {
          id: conversation.otherUser.id,
          name: `${conversation.otherUser.firstName || ''} ${conversation.otherUser.lastName || ''}`.trim(),
          role: conversation.otherUser.user?.role,
          avatar: conversation.otherUser.avatarUrl,
        },
        contextType: conversation.contextType,
        contextId: conversation.contextId,
        lastMessage: {
          id: conversation.lastMessage.id,
          content: conversation.lastMessage.content,
          messageType: conversation.lastMessage.messageType,
          isRead: !!conversation.lastMessage.readAt,
          createdAt: conversation.lastMessage.createdAt.toISOString(),
          sender: {
            id: conversation.lastMessage.sender.id,
            name: `${conversation.lastMessage.sender.firstName || ''} ${conversation.lastMessage.sender.lastName || ''}`.trim(),
            role: conversation.lastMessage.sender.user?.role,
            avatar: conversation.lastMessage.sender.avatarUrl,
          },
        },
        unreadCount: conversation.unreadCount,
        totalMessages: conversation.totalMessages,
      }))
      .sort((a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime());

    return NextResponse.json({
      success: true,
      conversations: conversationList,
    });

  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}
