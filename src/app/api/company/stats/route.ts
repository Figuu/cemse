import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a company
    if (session.user.role !== "COMPANIES") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get company ID from user
    const company = await prisma.company.findFirst({
      where: { createdBy: session.user.id },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Get company statistics
    const [
      totalJobs,
      activeJobs,
      totalApplications,
      hiredCandidates,
      jobPostings
    ] = await Promise.all([
      prisma.jobOffer.count({
        where: { companyId: company.id }
      }),
      prisma.jobOffer.count({
        where: { 
          companyId: company.id,
          isActive: true
        }
      }),
      prisma.jobApplication.count({
        where: {
          jobOffer: {
            companyId: company.id
          }
        }
      }),
      prisma.jobApplication.count({
        where: {
          jobOffer: {
            companyId: company.id
          },
          status: "HIRED"
        }
      }),
      prisma.jobOffer.findMany({
        where: { companyId: company.id },
        include: {
          _count: {
            select: {
              applications: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        take: 10
      })
    ]);

    const profileViews = 0; // CompanyView model doesn't exist

    // Calculate response rate (simplified)
    const responseRate = totalApplications > 0 ? Math.round((hiredCandidates / totalApplications) * 100) : 0;

    const stats = {
      totalJobs,
      activeJobs,
      totalApplications,
      hiredCandidates,
      profileViews,
      responseRate,
    };

    // Transform job postings
    const jobPostingsData = jobPostings.map(job => ({
      id: job.id,
      title: job.title,
      department: job.department || "General",
      location: job.location,
      type: job.contractType,
      applications: job._count.applications,
      views: job.viewsCount,
      status: job.isActive ? "active" : "paused",
      postedDate: job.createdAt.toISOString(),
      salary: job.salaryMin && job.salaryMax ? {
        min: job.salaryMin,
        max: job.salaryMax,
        currency: job.salaryCurrency || "BOB",
      } : undefined,
    }));

    return NextResponse.json({
      success: true,
      stats,
      jobPostings: jobPostingsData,
    });

  } catch (error) {
    console.error("Error fetching company stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch company statistics" },
      { status: 500 }
    );
  }
}
