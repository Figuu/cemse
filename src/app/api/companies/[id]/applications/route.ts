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

    // Only COMPANY role can access this endpoint
    if (session.user.role !== "COMPANIES") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: companyId } = await params;
    // Verify the user owns this company
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { createdBy: true },
    });

    if (!company || company.createdBy !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status") || "";
    const sortBy = searchParams.get("sortBy") || "appliedAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const jobId = searchParams.get("jobId");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {
      jobOffer: {
        companyId: companyId,
      },
    };

    if (status && status !== "all") {
      where.status = status;
    }

    if (jobId) {
      where.jobOfferId = jobId;
    }

    // Build orderBy clause
    const orderBy: Record<string, string> = {};
    orderBy[sortBy] = sortOrder;

    const [applications, total] = await Promise.all([
      prisma.jobApplication.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          applicant: {
            select: {
              userId: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
              phone: true,
              address: true,
              city: true,
              skillsWithLevel: true,
              workExperience: true,
              educationLevel: true,
              cvUrl: true,
            },
          },
          jobOffer: {
            select: {
              id: true,
              title: true,
              location: true,
              contractType: true,
              company: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
      prisma.jobApplication.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    // Transform applications for frontend
    const transformedApplications = applications.map(app => ({
      id: app.id,
      applicant: {
        id: app.applicant.userId,
        profile: {
          firstName: app.applicant.firstName || "",
          lastName: app.applicant.lastName || "",
          avatarUrl: app.applicant.avatarUrl,
          phone: app.applicant.phone,
          address: app.applicant.address,
          city: app.applicant.city,
          skills: app.applicant.skillsWithLevel || [],
          experience: app.applicant.workExperience || [],
          education: app.applicant.educationLevel,
          cvUrl: app.applicant.cvUrl,
        },
      },
      jobOffer: {
        id: app.jobOffer.id,
        title: app.jobOffer.title,
        location: app.jobOffer.location,
        contractType: app.jobOffer.contractType,
        company: app.jobOffer.company,
      },
      status: app.status,
      appliedAt: app.appliedAt.toISOString(),
      reviewedAt: app.reviewedAt?.toISOString(),
      coverLetter: app.coverLetter,
      notes: app.notes,
      rating: app.rating,
      cvFile: app.cvFile,
      coverLetterFile: app.coverLetterFile,
      decisionReason: app.decisionReason,
      hiredAt: app.hiredAt?.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      applications: transformedApplications,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });

  } catch (error) {
    console.error("Error fetching company applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}
