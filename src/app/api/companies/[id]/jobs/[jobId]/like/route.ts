import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; jobId: string }> }
) {
  try {
    const { id: companyId, jobId } = await params;
    // Get user ID from session (in real app, this would come from auth)
    const userId = "user-1"; // Mock user ID

    // Check if job exists
    const job = await prisma.jobPosting.findFirst({
      where: { 
        id: jobId,
        companyId: companyId,
        isActive: true,
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    // Check if user already liked the job
    const existingLike = await prisma.jobLike.findUnique({
      where: {
        jobId_userId: {
          jobId: jobId,
          userId: userId,
        },
      },
    });

    if (existingLike) {
      // Unlike the job
      await prisma.jobLike.delete({
        where: {
          jobId_userId: {
            jobId: jobId,
            userId: userId,
          },
        },
      });

      // Decrement like count
      await prisma.jobPosting.update({
        where: { id: jobId },
        data: { totalLikes: { decrement: 1 } },
      });

      return NextResponse.json({ 
        message: "Job unliked successfully",
        liked: false,
      });
    } else {
      // Like the job
      await prisma.jobLike.create({
        data: {
          jobId: jobId,
          userId: userId,
        },
      });

      // Increment like count
      await prisma.jobPosting.update({
        where: { id: jobId },
        data: { totalLikes: { increment: 1 } },
      });

      return NextResponse.json({ 
        message: "Job liked successfully",
        liked: true,
      });
    }
  } catch (error) {
    console.error("Error toggling job like:", error);
    return NextResponse.json(
      { error: "Failed to toggle job like" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; jobId: string }> }
) {
  try {
    const { id: companyId, jobId } = await params;
    // Get user ID from session (in real app, this would come from auth)
    const userId = "user-1"; // Mock user ID

    // Check if user liked the job
    const like = await prisma.jobLike.findUnique({
      where: {
        jobId_userId: {
          jobId: jobId,
          userId: userId,
        },
      },
    });

    return NextResponse.json({ 
      liked: !!like,
    });
  } catch (error) {
    console.error("Error checking job like:", error);
    return NextResponse.json(
      { error: "Failed to check job like" },
      { status: 500 }
    );
  }
}
