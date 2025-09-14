import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: postId } = await params;
    const userId = session.user.id;

    // Check if post exists
    const post = await prisma.entrepreneurshipPost.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if user already shared the post
    const existingShare = await prisma.postShare.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (existingShare) {
      return NextResponse.json({ error: "Post already shared" }, { status: 400 });
    }

    // Create share record
    await prisma.postShare.create({
      data: {
        postId,
        userId,
      },
    });

    // Increase share count
    await prisma.entrepreneurshipPost.update({
      where: { id: postId },
      data: {
        shares: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ message: "Post shared successfully" });
  } catch (error) {
    console.error("Error sharing post:", error);
    return NextResponse.json(
      { error: "Failed to share post" },
      { status: 500 }
    );
  }
}
