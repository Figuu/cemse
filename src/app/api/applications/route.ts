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

    // Only YOUTH role can access applications
    if (session.user.role !== "YOUTH") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // Build query with proper types

    const applications = await prisma.jobApplication.findMany({
      where: {
        applicantId: session.user.id,
        ...(status && status !== "all" && { status: status as "SENT" | "UNDER_REVIEW" | "PRE_SELECTED" | "REJECTED" | "HIRED" }),
        ...(search && {
          OR: [
            { jobOffer: { title: { contains: search, mode: "insensitive" } } },
            { jobOffer: { company: { name: { contains: search, mode: "insensitive" } } } },
          ]
        })
      },
      include: {
        jobOffer: {
          include: {
            company: true,
          },
        },
        applicant: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        appliedAt: "desc",
      },
    });

    // Transform data for frontend with enhanced tracking
    const transformedApplications = await Promise.all(applications.map(async (app) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const jobOffer = (app as any).jobOffer;
      
      // Get application timeline
      const timeline = await getApplicationTimeline(app.id);
      
      // Map status to frontend format
      const statusMap = {
        "SENT": "applied",
        "UNDER_REVIEW": "reviewing", 
        "PRE_SELECTED": "shortlisted",
        "REJECTED": "rejected",
        "HIRED": "offered"
      };

      return {
        id: app.id,
        jobId: app.jobOfferId,
        jobTitle: jobOffer?.title || "Unknown Job",
        company: jobOffer?.company?.name || "Unknown Company",
        companyLogo: jobOffer?.company?.logoUrl,
        location: jobOffer?.location || "Unknown Location",
        appliedDate: app.appliedAt.toISOString(),
        status: statusMap[app.status as keyof typeof statusMap] || "applied",
        priority: calculatePriority(app),
        salary: jobOffer?.salaryMin && jobOffer?.salaryMax ? {
          min: Number(jobOffer.salaryMin),
          max: Number(jobOffer.salaryMax),
          currency: jobOffer.salaryCurrency || "BOB",
        } : undefined,
        jobType: jobOffer?.contractType,
        remote: jobOffer?.workModality === "REMOTE",
        experience: jobOffer?.experienceLevel,
        skills: jobOffer?.skillsRequired || [],
        notes: app.notes,
        nextSteps: getNextSteps(app.status, app.decisionReason || undefined),
        interviewDate: app.reviewedAt?.toISOString(),
        rejectionReason: app.status === "REJECTED" ? app.decisionReason : undefined,
        offerDetails: app.status === "HIRED" ? {
          salary: jobOffer?.salaryMin ? Number(jobOffer.salaryMin) : 0,
          startDate: app.reviewedAt?.toISOString() || new Date().toISOString(),
          benefits: []
        } : undefined,
        timeline,
        lastUpdated: app.reviewedAt?.toISOString() || app.appliedAt.toISOString(),
        daysSinceApplied: Math.floor((new Date().getTime() - app.appliedAt.getTime()) / (1000 * 60 * 60 * 24)),
        responseTime: app.reviewedAt ? 
          Math.floor((app.reviewedAt.getTime() - app.appliedAt.getTime()) / (1000 * 60 * 60 * 24)) : 
          null,
      };
    }));

    return NextResponse.json({
      success: true,
      applications: transformedApplications,
    });

  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
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

    // Only YOUTH role can create applications
    if (session.user.role !== "YOUTH") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { jobId, coverLetter } = body;

    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }

    // Check if job offer exists
    const jobOffer = await prisma.jobOffer.findUnique({
      where: { id: jobId },
    });

    if (!jobOffer) {
      return NextResponse.json({ error: "Job offer not found" }, { status: 404 });
    }

    // Check if user already applied
    const existingApplication = await prisma.jobApplication.findFirst({
      where: {
        applicantId: session.user.id,
        jobOfferId: jobId,
      },
    });

    if (existingApplication) {
      return NextResponse.json({ error: "Already applied to this job" }, { status: 400 });
    }

    // Create application
    const application = await prisma.jobApplication.create({
      data: {
        applicantId: session.user.id,
        jobOfferId: jobId,
        status: "SENT",
        coverLetter,
        appliedAt: new Date(),
      },
      include: {
        jobOffer: {
          include: {
            company: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      application: {
        id: application.id,
        jobId: application.jobOfferId,
        jobTitle: application.jobOffer.title,
        company: application.jobOffer.company.name,
        status: application.status,
        appliedDate: application.appliedAt.toISOString(),
      },
    });

  } catch (error) {
    console.error("Error creating application:", error);
    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 }
    );
  }
}

// Helper functions for enhanced tracking
async function getApplicationTimeline(applicationId: string) {
  // This would typically come from an application_timeline table
  // For now, we'll generate a basic timeline based on application data
  const application = await prisma.jobApplication.findUnique({
    where: { id: applicationId },
    select: {
      appliedAt: true,
      reviewedAt: true,
      status: true,
      decisionReason: true,
    }
  });

  if (!application) return [];

  const timeline = [
    {
      id: `${applicationId}-applied`,
      type: "applied" as const,
      title: "Aplicación enviada",
      description: "Tu aplicación fue enviada exitosamente",
      date: application.appliedAt.toISOString(),
      status: "completed" as const,
    }
  ];

  if (application.reviewedAt) {
    timeline.push({
      id: `${applicationId}-reviewed`,
      type: "applied" as const,
      title: "Aplicación revisada",
      description: `Tu aplicación fue ${application.status === "REJECTED" ? "rechazada" : "revisada"}`,
      date: application.reviewedAt.toISOString(),
      status: "completed" as const,
    });

    if (application.status === "PRE_SELECTED") {
      timeline.push({
        id: `${applicationId}-shortlisted`,
        type: "applied" as const,
        title: "Preseleccionado",
        description: "Has sido preseleccionado para la siguiente etapa",
        date: application.reviewedAt.toISOString(),
        status: "completed" as const,
      });
    }

    if (application.status === "HIRED") {
      timeline.push({
        id: `${applicationId}-offered`,
        type: "applied" as const,
        title: "Oferta recibida",
        description: "¡Felicitaciones! Has recibido una oferta de trabajo",
        date: application.reviewedAt.toISOString(),
        status: "completed" as const,
      });
    }
  }

  return timeline;
}

function calculatePriority(application: Record<string, unknown>) {
  const daysSinceApplied = Math.floor((new Date().getTime() - (application.appliedAt as Date).getTime()) / (1000 * 60 * 60 * 24));
  
  // High priority if it's been more than 14 days without response
  if (daysSinceApplied > 14 && !application.reviewedAt) {
    return "high";
  }
  
  // Medium priority if it's been more than 7 days
  if (daysSinceApplied > 7) {
    return "medium";
  }
  
  return "low";
}

function getNextSteps(status: string, decisionReason?: string) {
  switch (status) {
    case "SENT":
      return "Esperando respuesta del empleador. Revisa tu perfil y mantén actualizada tu información de contacto.";
    case "UNDER_REVIEW":
      return "Tu aplicación está siendo revisada. Mantente disponible para posibles comunicaciones.";
    case "PRE_SELECTED":
      return "Has sido preseleccionado. Prepárate para posibles entrevistas o pruebas adicionales.";
    case "REJECTED":
      return decisionReason || "Aplicación rechazada. Considera aplicar a otras oportunidades similares.";
    case "HIRED":
      return "¡Felicidades! Has sido contratado. Revisa los detalles de la oferta y confirma tu aceptación.";
    default:
      return "Revisa regularmente el estado de tu aplicación.";
  }
}
