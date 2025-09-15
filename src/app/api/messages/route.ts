import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const sendMessageSchema = z.object({
  recipientId: z.string(),
  content: z.string().min(1, "Message content is required"),
  contextType: z.enum(["JOB_APPLICATION", "YOUTH_APPLICATION", "ENTREPRENEURSHIP", "GENERAL"]),
  contextId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Messages API - Session user ID:", session.user.id);

    const { searchParams } = new URL(request.url);
    const recipientId = searchParams.get("recipientId");
    const contextType = searchParams.get("contextType");
    const contextId = searchParams.get("contextId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    console.log("Messages API - Query params:", { recipientId, contextType, contextId, page, limit });

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      OR: [
        { senderId: session.user.id, recipientId: recipientId || undefined },
        { senderId: recipientId || undefined, recipientId: session.user.id }
      ]
    };

    if (contextType) {
      where.contextType = contextType;
    }

    if (contextId) {
      where.contextId = contextId;
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        orderBy: { createdAt: "asc" },
        skip,
        take: limit,
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
      }),
      prisma.message.count({ where }),
    ]);

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        recipientId: session.user.id,
        senderId: recipientId || undefined,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    return NextResponse.json({
      messages,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + limit < total,
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
    console.log("Messages API - POST body:", body);
    const validatedData = sendMessageSchema.parse(body);
    console.log("Messages API - Validated data:", validatedData);

    // Check if recipient exists
    console.log("Messages API - Looking for recipient with userId:", validatedData.recipientId);
    const recipient = await prisma.profile.findUnique({
      where: { userId: validatedData.recipientId },
    });

    console.log("Messages API - Recipient found:", recipient ? "Yes" : "No");
    if (recipient) {
      console.log("Messages API - Recipient details:", { id: recipient.id, userId: recipient.userId, firstName: recipient.firstName, lastName: recipient.lastName });
    }

    if (!recipient) {
      return NextResponse.json(
        { error: "Recipient not found" },
        { status: 404 }
      );
    }

    console.log("Messages API - Creating message with data:", {
      senderId: session.user.id,
      recipientId: validatedData.recipientId,
      content: validatedData.content,
      contextType: validatedData.contextType,
      contextId: validatedData.contextId,
    });

    const message = await prisma.message.create({
      data: {
        senderId: session.user.id,
        recipientId: validatedData.recipientId,
        content: validatedData.content,
        contextType: validatedData.contextType,
        contextId: validatedData.contextId,
      },
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

    console.log("Messages API - Message created successfully:", { id: message.id, content: message.content });
    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}