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

    const { id: applicationId } = await params;

    // Get application with full details
    const application = await prisma.jobApplication.findFirst({
      where: {
        id: applicationId,
        applicantId: session.user.id, // Ensure user can only access their own applications
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
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jobOffer = (application as any).jobOffer;

    // Get detailed timeline
    const timeline = await getDetailedTimeline(applicationId);

    // Map status to frontend format
    const statusMap = {
      "SENT": "applied",
      "UNDER_REVIEW": "reviewing", 
      "PRE_SELECTED": "shortlisted",
      "REJECTED": "rejected",
      "HIRED": "offered"
    };

    // Translation functions
    const translateContractType = (type: string) => {
      const translations = {
        "FULL_TIME": "tiempo-completo",
        "PART_TIME": "medio-tiempo", 
        "INTERNSHIP": "pasantía",
        "VOLUNTEER": "voluntario",
        "FREELANCE": "contrato"
      };
      return translations[type as keyof typeof translations] || "tiempo-completo";
    };

    const translateExperienceLevel = (level: string) => {
      const translations = {
        "NO_EXPERIENCE": "Sin experiencia",
        "ENTRY_LEVEL": "Nivel inicial",
        "MID_LEVEL": "Nivel intermedio", 
        "SENIOR_LEVEL": "Nivel senior"
      };
      return translations[level as keyof typeof translations] || "No especificado";
    };

    const translateWorkModality = (modality: string) => {
      const translations = {
        "ON_SITE": "Presencial",
        "REMOTE": "Remoto",
        "HYBRID": "Híbrido"
      };
      return translations[modality as keyof typeof translations] || "No especificado";
    };

    const transformedApplication = {
      id: application.id,
      jobId: application.jobOfferId,
      jobTitle: jobOffer?.title || "Unknown Job",
      company: jobOffer?.company?.name || "Unknown Company",
      companyLogo: jobOffer?.company?.logoUrl,
      companyOwnerId: jobOffer?.company?.ownerId,
      location: jobOffer?.location || "Unknown Location",
      appliedDate: application.appliedAt.toISOString(),
      status: statusMap[application.status as keyof typeof statusMap] || "applied",
      priority: calculatePriority(application),
      salary: jobOffer?.salaryMin && jobOffer?.salaryMax ? {
        min: Number(jobOffer.salaryMin),
        max: Number(jobOffer.salaryMax),
        currency: jobOffer.salaryCurrency || "BOB",
      } : undefined,
      jobType: translateContractType(jobOffer?.contractType || "FULL_TIME"),
      remote: jobOffer?.workModality === "REMOTE",
      experience: translateExperienceLevel(jobOffer?.experienceLevel || "ENTRY_LEVEL"),
      skills: Array.isArray(jobOffer?.skillsRequired) ? jobOffer.skillsRequired : [],
      requirements: Array.isArray(jobOffer?.requirements) ? jobOffer.requirements : [
        "Experiencia relevante en el campo",
        "Conocimientos técnicos específicos",
        "Capacidad de trabajo en equipo",
        "Comunicación efectiva"
      ],
      benefits: Array.isArray(jobOffer?.benefits) ? jobOffer.benefits : [
        "Salario competitivo",
        "Ambiente de trabajo colaborativo",
        "Oportunidades de crecimiento",
        "Beneficios adicionales"
      ],
      description: jobOffer?.description || "Descripción del puesto no disponible",
      notes: application.notes,
      nextSteps: getNextSteps(application.status, application.decisionReason || undefined),
      interviewDate: application.reviewedAt?.toISOString(),
      rejectionReason: application.status === "REJECTED" ? application.decisionReason : undefined,
      offerDetails: application.status === "HIRED" ? {
        salary: jobOffer?.salaryMin ? Number(jobOffer.salaryMin) : 0,
        startDate: application.reviewedAt?.toISOString() || new Date().toISOString(),
        benefits: []
      } : undefined,
      timeline,
      lastUpdated: application.reviewedAt?.toISOString() || application.appliedAt.toISOString(),
      daysSinceApplied: Math.floor((new Date().getTime() - application.appliedAt.getTime()) / (1000 * 60 * 60 * 24)),
      responseTime: application.reviewedAt ? 
        Math.floor((application.reviewedAt.getTime() - application.appliedAt.getTime()) / (1000 * 60 * 60 * 24)) : 
        null,
      coverLetter: application.coverLetter,
      documents: [], // Would come from file uploads
      communication: [], // Would come from messages/emails
      contactPerson: jobOffer?.company?.ownerId ? {
        name: jobOffer?.company?.name || "Representante de la empresa",
        title: "Representante de RRHH",
        email: `contacto@${jobOffer?.company?.name?.toLowerCase().replace(/\s+/g, '')}.com` || "contacto@empresa.com",
        phone: "+591 70000000"
      } : undefined,
    };

    return NextResponse.json({
      success: true,
      application: transformedApplication,
    });

  } catch (error) {
    console.error("Error fetching application details:", error);
    return NextResponse.json(
      { error: "Failed to fetch application details" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: applicationId } = await params;
    const body = await request.json();
    const { notes, status } = body;

    // Verify application belongs to user
    const existingApplication = await prisma.jobApplication.findFirst({
      where: {
        id: applicationId,
        applicantId: session.user.id,
      },
    });

    if (!existingApplication) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Update application
    const updatedApplication = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: {
        ...(notes !== undefined && { notes }),
        // Note: status updates would typically be done by the company/employer
        // This is just for user notes and tracking
      },
    });


    return NextResponse.json({
      success: true,
      application: {
        id: updatedApplication.id,
        notes: updatedApplication.notes,
        lastUpdated: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error("Error updating application:", error);
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: applicationId } = await params;

    // Verify application belongs to user
    const existingApplication = await prisma.jobApplication.findFirst({
      where: {
        id: applicationId,
        applicantId: session.user.id,
      },
    });

    if (!existingApplication) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Only allow deletion if application is still in early stages
    if (["PRE_SELECTED", "HIRED"].includes(existingApplication.status)) {
      return NextResponse.json({ 
        error: "Cannot delete application in current status" 
      }, { status: 400 });
    }

    // Delete application
    await prisma.jobApplication.delete({
      where: { id: applicationId },
    });

    return NextResponse.json({
      success: true,
      message: "Application deleted successfully",
    });

  } catch (error) {
    console.error("Error deleting application:", error);
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 }
    );
  }
}

// Helper functions
interface TimelineItem {
  id: string;
  type: string;
  title: string;
  description: string;
  date: string;
  status: string;
  details: Record<string, any>;
}

async function getDetailedTimeline(applicationId: string): Promise<TimelineItem[]> {
  // This would typically come from an application_timeline table
  // For now, we'll generate a detailed timeline based on application data
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

  const timeline: TimelineItem[] = [
    {
      id: `${applicationId}-applied`,
      type: "applied",
      title: "Aplicación enviada",
      description: "Tu aplicación fue enviada exitosamente al empleador",
      date: application.appliedAt.toISOString(),
      status: "completed",
      details: {
        method: "Online",
        documents: ["CV", "Carta de presentación"],
        estimatedResponse: "7-14 días hábiles"
      }
    }
  ];

  if (application.reviewedAt) {
    timeline.push({
      id: `${applicationId}-reviewed`,
      type: "reviewed",
      title: "Aplicación revisada",
      description: `Tu aplicación fue ${application.status === "REJECTED" ? "rechazada" : "revisada"}`,
      date: application.reviewedAt.toISOString(),
      status: "completed",
      details: {
        method: "Online",
        documents: ["CV", "Carta de presentación"],
        estimatedResponse: "7-14 días hábiles",
        responseTime: Math.floor((application.reviewedAt.getTime() - application.appliedAt.getTime()) / (1000 * 60 * 60 * 24)),
        reason: application.decisionReason
      }
    });

    if (application.status === "PRE_SELECTED") {
      timeline.push({
        id: `${applicationId}-shortlisted`,
        type: "shortlisted",
        title: "Preseleccionado",
        description: "Has sido preseleccionado para la siguiente etapa del proceso",
        date: application.reviewedAt.toISOString(),
        status: "completed",
        details: {
          method: "Online",
          documents: ["CV", "Carta de presentación"],
          estimatedResponse: "7-14 días hábiles",
          nextStep: "Entrevista o prueba técnica",
          estimatedTime: "1-3 días hábiles"
        }
      });
    }

    if (application.status === "HIRED") {
      timeline.push({
        id: `${applicationId}-offered`,
        type: "offered",
        title: "Oferta recibida",
        description: "¡Felicitaciones! Has recibido una oferta de trabajo",
        date: application.reviewedAt.toISOString(),
        status: "completed",
        details: {
          method: "Online",
          documents: ["CV", "Carta de presentación"],
          estimatedResponse: "7-14 días hábiles",
          offerType: "Oferta de trabajo",
          responseDeadline: "5 días hábiles"
        }
      });
    }
  } else {
    // Add pending status if no response yet
    const daysSinceApplied = Math.floor((new Date().getTime() - application.appliedAt.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceApplied > 7) {
      timeline.push({
        id: `${applicationId}-pending`,
        type: "pending",
        title: "Esperando respuesta",
        description: `Han pasado ${daysSinceApplied} días desde tu aplicación`,
        date: new Date().toISOString(),
        status: "pending",
        details: {
          method: "Online",
          documents: ["CV", "Carta de presentación"],
          estimatedResponse: "7-14 días hábiles",
          daysWaiting: daysSinceApplied,
          suggestedAction: daysSinceApplied > 14 ? "Considera hacer seguimiento" : "Continúa esperando"
        }
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

