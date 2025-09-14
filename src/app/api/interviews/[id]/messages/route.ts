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

    const { id: interviewId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const skip = (page - 1) * limit;

    // Verify interview access - Interview model doesn't exist
    const interview = null;

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    // Get messages - InterviewMessage model doesn't exist
    const messages: any[] = [];
    const totalCount = 0;

    // Transform messages for frontend - returning empty array since InterviewMessage model doesn't exist
    const transformedMessages: any[] = [];

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: interviewId } = await params;
    const body = await request.json();
    const { message } = body;

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Verify interview access - Interview model doesn't exist
    const interview = null;

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    // Create message - InterviewMessage model doesn't exist
    const newMessage = {
      id: "mock-message-id",
      interviewId,
      senderId: session.user.id,
      message: message.trim(),
      createdAt: new Date(),
    };

    // Send notification to the other party - Notification model doesn't exist
    // Commented out notification creation

    return NextResponse.json({
      success: true,
      message: {
        id: newMessage.id,
        senderId: newMessage.senderId,
        message: newMessage.message,
        createdAt: newMessage.createdAt.toISOString(),
        sender: {
          id: "mock-sender-id",
          name: "Mock Sender",
          role: "YOUTH" as any,
          avatar: null,
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
