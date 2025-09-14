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

    // Check if user already shared the job
    const existingShare = await prisma.jobShare.findUnique({
      where: {
        jobId_userId: {
          jobId: jobId,
          userId: userId,
        },
      },
    });

    if (existingShare) {
      return NextResponse.json(
        { error: "Job already shared by this user" },
        { status: 400 }
      );
    }

    // Share the job
    await prisma.jobShare.create({
      data: {
        jobId: jobId,
        userId: userId,
      },
    });

    // Increment share count
    await prisma.jobPosting.update({
      where: { id: jobId },
      data: { totalShares: { increment: 1 } },
    });

    return NextResponse.json({ 
      message: "Job shared successfully",
    });
  } catch (error) {
    console.error("Error sharing job:", error);
    return NextResponse.json(
      { error: "Failed to share job" },
      { status: 500 }
    );
  }
}
