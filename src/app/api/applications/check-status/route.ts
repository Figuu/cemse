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

    // Only YOUTH role can check application status
    if (session.user.role !== "YOUTH") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");

    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }

    // Check if user has applied to this job
    const application = await prisma.jobApplication.findFirst({
      where: {
        applicantId: session.user.id,
        jobOfferId: jobId,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (application) {
      return NextResponse.json({
        hasApplied: true,
        applicationId: application.id,
        status: application.status,
      });
    }

    return NextResponse.json({
      hasApplied: false,
    });

  } catch (error) {
    console.error("Error checking application status:", error);
    return NextResponse.json(
      { error: "Failed to check application status" },
      { status: 500 }
    );
  }
}
