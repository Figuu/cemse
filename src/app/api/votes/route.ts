import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { targetType, targetId, isUpvote } = body;

    if (!targetType || !targetId || typeof isUpvote !== "boolean") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate target type
    const validTargetTypes = ["discussion", "reply", "question", "answer"];
    if (!validTargetTypes.includes(targetType)) {
      return NextResponse.json({ error: "Invalid target type" }, { status: 400 });
    }

    // Check if vote already exists
    const existingVote = await prisma.vote.findFirst({
      where: {
        studentId: session.user.id,
        targetType,
        targetId,
      },
    });

    if (existingVote) {
      // Update existing vote
      const updatedVote = await prisma.vote.update({
        where: { id: existingVote.id },
        data: { isUpvote },
      });

      return NextResponse.json({
        success: true,
        vote: {
          id: updatedVote.id,
          isUpvote: updatedVote.isUpvote,
          targetType: updatedVote.targetType,
          targetId: updatedVote.targetId,
        },
      });
    } else {
      // Create new vote
      const newVote = await prisma.vote.create({
        data: {
          studentId: session.user.id,
          targetType,
          targetId,
          isUpvote,
        },
      });

      return NextResponse.json({
        success: true,
        vote: {
          id: newVote.id,
          isUpvote: newVote.isUpvote,
          targetType: newVote.targetType,
          targetId: newVote.targetId,
        },
      });
    }

  } catch (error) {
    console.error("Error creating/updating vote:", error);
    return NextResponse.json(
      { error: "Failed to create/update vote" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const targetType = searchParams.get("targetType");
    const targetId = searchParams.get("targetId");

    if (!targetType || !targetId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // Find and delete vote
    const vote = await prisma.vote.findFirst({
      where: {
        studentId: session.user.id,
        targetType,
        targetId,
      },
    });

    if (!vote) {
      return NextResponse.json({ error: "Vote not found" }, { status: 404 });
    }

    await prisma.vote.delete({
      where: { id: vote.id },
    });

    return NextResponse.json({
      success: true,
      message: "Vote removed successfully",
    });

  } catch (error) {
    console.error("Error deleting vote:", error);
    return NextResponse.json(
      { error: "Failed to delete vote" },
      { status: 500 }
    );
  }
}
