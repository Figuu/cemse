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

    const messageId = params.id;

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
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const messageId = params.id;
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
      updateData.isRead = isRead;
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

    return NextResponse.json({
      success: true,
      message: {
        id: updatedMessage.id,
        senderId: updatedMessage.senderId,
        recipientId: updatedMessage.recipientId,
        content: updatedMessage.content,
        messageType: updatedMessage.messageType,
        isRead: updatedMessage.isRead,
        contextType: updatedMessage.contextType,
        contextId: updatedMessage.contextId,
        createdAt: updatedMessage.createdAt.toISOString(),
        updatedAt: updatedMessage.updatedAt.toISOString(),
        sender: {
          id: updatedMessage.sender.id,
          name: `${updatedMessage.sender.profile?.firstName || ''} ${updatedMessage.sender.profile?.lastName || ''}`.trim(),
          role: updatedMessage.sender.role,
          avatar: updatedMessage.sender.profile?.avatarUrl,
        },
        recipient: {
          id: updatedMessage.recipient.id,
          name: `${updatedMessage.recipient.profile?.firstName || ''} ${updatedMessage.recipient.profile?.lastName || ''}`.trim(),
          role: updatedMessage.recipient.role,
          avatar: updatedMessage.recipient.profile?.avatarUrl,
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
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const messageId = params.id;

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
