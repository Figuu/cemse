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

    const { id: messageId } = await params;

    // Get message with access verification
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        OR: [
          { senderId: session.user.id },
          { recipientId: session.user.id }
        ],
      },
      include: {
        sender: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            user: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
          },
        },
        recipient: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            user: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: {
        id: message.id,
        senderId: message.senderId,
        recipientId: message.recipientId,
        content: message.content,
        messageType: message.messageType,
        isRead: !!message.readAt,
        contextType: message.contextType,
        contextId: message.contextId,
        createdAt: message.createdAt.toISOString(),
        updatedAt: message.createdAt.toISOString(), // Use createdAt since updatedAt doesn't exist
        sender: {
          id: message.sender.user.id,
          name: `${message.sender.firstName || ''} ${message.sender.lastName || ''}`.trim(),
          role: message.sender.user.role,
          avatar: message.sender.avatarUrl,
        },
        recipient: {
          id: message.recipient.user.id,
          name: `${message.recipient.firstName || ''} ${message.recipient.lastName || ''}`.trim(),
          role: message.recipient.user.role,
          avatar: message.recipient.avatarUrl,
        },
      },
    });

  } catch (error) {
    console.error("Error fetching message:", error);
    return NextResponse.json(
      { error: "Failed to fetch message" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: messageId } = await params;
    const body = await request.json();
    const { content, isRead } = body;

    // Verify message access and ownership
    const existingMessage = await prisma.message.findFirst({
      where: {
        id: messageId,
        OR: [
          { senderId: session.user.id },
          { recipientId: session.user.id }
        ],
      },
    });

    if (!existingMessage) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Only sender can edit content, recipient can mark as read
    const updateData: any = {};
    
    if (content !== undefined && existingMessage.senderId === session.user.id) {
      updateData.content = content.trim();
    }
    
    if (isRead !== undefined && existingMessage.recipientId === session.user.id) {
      updateData.readAt = isRead ? new Date() : null;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid updates provided" }, { status: 400 });
    }

    // Update message
    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: updateData,
      include: {
        sender: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            user: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
          },
        },
        recipient: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            user: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: {
        id: updatedMessage.id,
        senderId: updatedMessage.senderId,
        recipientId: updatedMessage.recipientId,
        content: updatedMessage.content,
        messageType: updatedMessage.messageType,
        isRead: !!updatedMessage.readAt,
        contextType: updatedMessage.contextType,
        contextId: updatedMessage.contextId,
        createdAt: updatedMessage.createdAt.toISOString(),
        updatedAt: updatedMessage.createdAt.toISOString(), // Use createdAt since updatedAt doesn't exist
        sender: {
          id: updatedMessage.sender.user.id,
          name: `${updatedMessage.sender.firstName || ''} ${updatedMessage.sender.lastName || ''}`.trim(),
          role: updatedMessage.sender.user.role,
          avatar: updatedMessage.sender.avatarUrl,
        },
        recipient: {
          id: updatedMessage.recipient.user.id,
          name: `${updatedMessage.recipient.firstName || ''} ${updatedMessage.recipient.lastName || ''}`.trim(),
          role: updatedMessage.recipient.user.role,
          avatar: updatedMessage.recipient.avatarUrl,
        },
      },
    });

  } catch (error) {
    console.error("Error updating message:", error);
    return NextResponse.json(
      { error: "Failed to update message" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: messageId } = await params;

    // Verify message ownership (only sender can delete)
    const existingMessage = await prisma.message.findFirst({
      where: {
        id: messageId,
        senderId: session.user.id,
      },
    });

    if (!existingMessage) {
      return NextResponse.json({ error: "Message not found or access denied" }, { status: 404 });
    }

    // Delete message
    await prisma.message.delete({
      where: { id: messageId },
    });

    return NextResponse.json({
      success: true,
      message: "Message deleted successfully",
    });

  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 }
    );
  }
}
