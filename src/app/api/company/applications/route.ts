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

    // Only COMPANIES role can access company applications
    if (session.user.role !== "COMPANIES") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get company ID from user
    const company = await prisma.company.findFirst({
      where: { 
        OR: [
          { createdBy: session.user.id },
          { ownerId: session.user.id }
        ]
      },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");

    // Map frontend status values to database status values
    const statusMap: Record<string, string> = {
      "pending": "SENT",
      "reviewing": "UNDER_REVIEW", 
      "shortlisted": "PRE_SELECTED",
      "hired": "HIRED",
      "rejected": "REJECTED"
    };

    const dbStatus = status && status !== "all" ? statusMap[status] : undefined;

    const applications = await prisma.jobApplication.findMany({
      where: {
        jobOffer: {
          companyId: company.id
        },
        ...(dbStatus && { status: dbStatus as "SENT" | "UNDER_REVIEW" | "PRE_SELECTED" | "REJECTED" | "HIRED" })
      },
      include: {
        jobOffer: {
          select: {
            id: true,
            title: true,
            company: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
              },
            },
          },
        },
        applicant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            city: true,
            state: true,
            educationLevel: true,
            experienceLevel: true,
            skills: true,
          },
        },
      },
      orderBy: {
        appliedAt: "desc",
      },
      take: limit,
    });

    // Transform data for frontend
    const transformedApplications = applications.map((app) => {
      const applicant = app.applicant;
      
      // Map status to frontend format
      const statusMap = {
        "SENT": "pending",
        "UNDER_REVIEW": "reviewing", 
        "PRE_SELECTED": "shortlisted",
        "REJECTED": "rejected",
        "HIRED": "hired"
      };

      return {
        id: app.id,
        jobId: app.jobOfferId,
        jobTitle: app.jobOffer.title,
        company: app.jobOffer.company.name,
        companyLogo: app.jobOffer.company.logoUrl,
        applicant: {
          id: applicant.id,
          name: `${applicant.firstName || ''} ${applicant.lastName || ''}`.trim() || 'Candidato',
          email: '', // TODO: Get email from user relation
          avatarUrl: '', // TODO: Get avatarUrl from user relation
          phone: applicant.phone,
          location: applicant.city && applicant.state ? `${applicant.city}, ${applicant.state}` : 'No especificado',
          educationLevel: applicant.educationLevel,
          experienceLevel: applicant.experienceLevel,
          skills: applicant.skills || [],
        },
        appliedDate: app.appliedAt.toISOString(),
        status: statusMap[app.status as keyof typeof statusMap] || "pending",
        coverLetter: app.coverLetter,
        notes: app.notes,
        reviewedAt: app.reviewedAt?.toISOString(),
        decisionReason: app.decisionReason,
        daysSinceApplied: Math.floor((new Date().getTime() - app.appliedAt.getTime()) / (1000 * 60 * 60 * 24)),
      };
    });

    return NextResponse.json({
      success: true,
      applications: transformedApplications,
    });

  } catch (error) {
    console.error("Error fetching company applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}
