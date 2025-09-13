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

    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get("applicationId");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (applicationId) {
      where.applicationId = applicationId;
    }

    if (status) {
      where.status = status;
    }

    // Check if user is a company or candidate
    if (session.user.role === "COMPANIES") {
      // Company can see interviews for their job applications
      where.application = {
        jobOffer: {
          company: {
            createdBy: session.user.id,
          },
        },
      };
    } else if (session.user.role === "YOUTH") {
      // Candidate can see their own interviews
      where.application = {
        applicantId: session.user.id,
      };
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get interviews
    const [interviews, totalCount] = await Promise.all([
      prisma.interview.findMany({
        where,
        orderBy: { scheduledAt: "desc" },
        skip,
        take: limit,
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
      }),
      prisma.interview.count({ where }),
    ]);

    // Transform interviews for frontend
    const transformedInterviews = interviews.map(interview => ({
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
    }));

    return NextResponse.json({
      success: true,
      interviews: transformedInterviews,
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
    console.error("Error fetching interviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch interviews" },
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

    // Only companies can create interviews
    if (session.user.role !== "COMPANIES") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { 
      applicationId, 
      type, 
      scheduledAt, 
      duration, 
      location, 
      meetingLink, 
      notes 
    } = body;

    if (!applicationId || !type || !scheduledAt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify application belongs to company
    const application = await prisma.jobApplication.findFirst({
      where: {
        id: applicationId,
        jobOffer: {
          company: {
            createdBy: session.user.id,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Create interview
    const interview = await prisma.interview.create({
      data: {
        applicationId,
        type,
        scheduledAt: new Date(scheduledAt),
        duration: duration || 60, // Default 60 minutes
        location,
        meetingLink,
        notes,
        status: "SCHEDULED",
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
      },
    });

    // Send notification to candidate
    try {
      await prisma.notification.create({
        data: {
          userId: application.applicantId,
          type: "INTERVIEW_SCHEDULED",
          title: "Entrevista Programada",
          message: `Se ha programado una entrevista para ${interview.application.jobOffer.title} en ${interview.application.jobOffer.company.name}`,
          data: {
            interviewId: interview.id,
            applicationId: applicationId,
            scheduledAt: scheduledAt,
            type: type,
          },
        },
      });
    } catch (notificationError) {
      console.error("Error creating interview notification:", notificationError);
      // Don't fail the interview creation if notification fails
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
        createdAt: interview.createdAt.toISOString(),
      },
    });

  } catch (error) {
    console.error("Error creating interview:", error);
    return NextResponse.json(
      { error: "Failed to create interview" },
      { status: 500 }
    );
  }
}
