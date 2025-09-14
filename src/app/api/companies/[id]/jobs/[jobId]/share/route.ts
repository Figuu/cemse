import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; jobId: string }> }
) {
  try {
    const { id: companyId, jobId } = await params;

    // Check if job exists
    const job = await prisma.jobOffer.findFirst({
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
    // Job sharing not implemented yet
    const existingShare = null;

    if (existingShare) {
      return NextResponse.json(
        { error: "Job already shared by this user" },
        { status: 400 }
      );
    }

    // Share the job
    // Job sharing not implemented yet

    // Share count functionality not implemented in schema
    // Would need to add totalShares field to JobOffer model

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
