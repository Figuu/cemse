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

    const interviewId = params.id;

    // Get interview with access control
    const interview = await prisma.interview.findFirst({
      where: {
        id: interviewId,
        OR: [
          // Company can see their interviews
          {
            application: {
              jobOffer: {
                company: {
                  createdBy: session.user.id,
                },
              },
            },
          },
          // Candidate can see their interviews
          {
            application: {
              applicantId: session.user.id,
            },
          },
        ],
      },
      include: {
        application: {
          include: {
            jobOffer: {
              include: {
                company: true,
              },
            },
            applicant: {
              include: {
                profile: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            sender: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
    });

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      interview: {
        id: interview.id,
        applicationId: interview.applicationId,
        status: interview.status,
        type: interview.type,
        scheduledAt: interview.scheduledAt.toISOString(),
        duration: interview.duration,
        location: interview.location,
        meetingLink: interview.meetingLink,
        notes: interview.notes,
        feedback: interview.feedback,
        createdAt: interview.createdAt.toISOString(),
        updatedAt: interview.updatedAt.toISOString(),
        application: {
          id: interview.application.id,
          jobTitle: interview.application.jobOffer.title,
          company: interview.application.jobOffer.company.name,
          candidate: {
            id: interview.application.applicant.id,
            name: `${interview.application.applicant.profile?.firstName || ''} ${interview.application.applicant.profile?.lastName || ''}`.trim(),
            email: interview.application.applicant.profile?.email || '',
          },
        },
        messages: interview.messages.map(message => ({
          id: message.id,
          senderId: message.senderId,
          message: message.message,
          createdAt: message.createdAt.toISOString(),
          sender: {
            id: message.sender.id,
            name: `${message.sender.profile?.firstName || ''} ${message.sender.profile?.lastName || ''}`.trim(),
            role: message.sender.role,
          },
        })),
      },
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
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const interviewId = params.id;
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

    // Verify interview access
    const existingInterview = await prisma.interview.findFirst({
      where: {
        id: interviewId,
        OR: [
          // Company can update their interviews
          {
            application: {
              jobOffer: {
                company: {
                  createdBy: session.user.id,
                },
              },
            },
          },
          // Candidate can update their interviews (limited fields)
          {
            application: {
              applicantId: session.user.id,
            },
          },
        ],
      },
    });

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

    // Update interview
    const updatedInterview = await prisma.interview.update({
      where: { id: interviewId },
      data: updateData,
    });

    // Send notification if status changed
    if (status && status !== existingInterview.status) {
      try {
        const interview = await prisma.interview.findUnique({
          where: { id: interviewId },
          include: {
            application: {
              include: {
                jobOffer: {
                  include: {
                    company: true,
                  },
                },
                applicant: true,
              },
            },
          },
        });

        if (interview) {
          const statusMessages = {
            CONFIRMED: "El candidato ha confirmado la entrevista",
            DECLINED: "El candidato ha declinado la entrevista",
            COMPLETED: "La entrevista ha sido completada",
            CANCELLED: "La entrevista ha sido cancelada",
          };

          const message = statusMessages[status as keyof typeof statusMessages] || "El estado de la entrevista ha cambiado";

          // Notify both parties
          await Promise.all([
            // Notify company
            prisma.notification.create({
              data: {
                userId: interview.application.jobOffer.company.createdBy,
                type: "INTERVIEW_STATUS_CHANGE",
                title: "Estado de Entrevista Actualizado",
                message: `${message} para ${interview.application.jobOffer.title}`,
                data: {
                  interviewId: interview.id,
                  applicationId: interview.applicationId,
                  status: status,
                },
              },
            }),
            // Notify candidate
            prisma.notification.create({
              data: {
                userId: interview.application.applicantId,
                type: "INTERVIEW_STATUS_CHANGE",
                title: "Estado de Entrevista Actualizado",
                message: `${message} para ${interview.application.jobOffer.title}`,
                data: {
                  interviewId: interview.id,
                  applicationId: interview.applicationId,
                  status: status,
                },
              },
            }),
          ]);
        }
      } catch (notificationError) {
        console.error("Error creating status change notification:", notificationError);
        // Don't fail the update if notification fails
      }
    }

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
