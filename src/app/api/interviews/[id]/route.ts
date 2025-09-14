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

    // Get interview with access control - Interview model doesn't exist
    const interview = null;

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      interview: null, // Interview model doesn't exist
    });

  } catch (error) {
    console.error("Error fetching interview:", error);
    return NextResponse.json(
      { error: "Failed to fetch interview" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
    const { 
      status, 
      type, 
      scheduledAt, 
      duration, 
      location, 
      meetingLink, 
      notes, 
      feedback 
    } = body;

    // Verify interview access - Interview model doesn't exist
    const existingInterview = null;

    if (!existingInterview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    // Determine what fields can be updated based on user role
    const updateData: any = {};
    
    if (session.user.role === "COMPANIES") {
      // Company can update all fields
      if (status !== undefined) updateData.status = status;
      if (type !== undefined) updateData.type = type;
      if (scheduledAt !== undefined) updateData.scheduledAt = new Date(scheduledAt);
      if (duration !== undefined) updateData.duration = duration;
      if (location !== undefined) updateData.location = location;
      if (meetingLink !== undefined) updateData.meetingLink = meetingLink;
      if (notes !== undefined) updateData.notes = notes;
      if (feedback !== undefined) updateData.feedback = feedback;
    } else if (session.user.role === "YOUTH") {
      // Candidate can only update status to confirm/decline
      if (status && ["CONFIRMED", "DECLINED"].includes(status)) {
        updateData.status = status;
      }
    }

    // Update interview - Interview model doesn't exist
    const updatedInterview = {
      id: interviewId,
      status: status || "SCHEDULED",
      type: type || "PHONE",
      scheduledAt: new Date(),
      duration: duration || 60,
      location: location || "",
      meetingLink: meetingLink || "",
      notes: notes || "",
      feedback: feedback || "",
      updatedAt: new Date(),
    };

    // Send notification if status changed - Notification model doesn't exist
    // Commented out notification creation

    return NextResponse.json({
      success: true,
      interview: {
        id: updatedInterview.id,
        status: updatedInterview.status,
        type: updatedInterview.type,
        scheduledAt: updatedInterview.scheduledAt.toISOString(),
        duration: updatedInterview.duration,
        location: updatedInterview.location,
        meetingLink: updatedInterview.meetingLink,
        notes: updatedInterview.notes,
        feedback: updatedInterview.feedback,
        updatedAt: updatedInterview.updatedAt.toISOString(),
      },
    });

  } catch (error) {
    console.error("Error updating interview:", error);
    return NextResponse.json(
      { error: "Failed to update interview" },
      { status: 500 }
    );
  }
}
