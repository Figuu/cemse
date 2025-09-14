import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const analyticsQuerySchema = z.object({
  period: z.enum(["7d", "30d", "90d", "1y", "all"]).default("30d"),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: companyId } = await params;
    const { searchParams } = new URL(request.url);
    const query = {
      period: searchParams.get("period") || "30d",
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
    };

    const validatedQuery = analyticsQuerySchema.parse(query);

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    if (validatedQuery.startDate && validatedQuery.endDate) {
      startDate = new Date(validatedQuery.startDate);
      endDate = new Date(validatedQuery.endDate);
    } else {
      switch (validatedQuery.period) {
        case "7d":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30d":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "90d":
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case "1y":
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        case "all":
        default:
          startDate = new Date(0); // Beginning of time
          break;
      }
    }

    // Get company basic info
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        // Note: These fields would need to be added to Company model or calculated separately
        // totalJobs: true,
        // totalApplications: true,
        // totalViews: true,
        // totalFollowers: true,
        // averageRating: true,
        // totalReviews: true,
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    // Get job postings in date range
    const jobs = await prisma.jobOffer.findMany({
      where: {
        companyId: companyId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    // Get applications in date range
    const applications = await prisma.jobApplication.findMany({
      where: {
        jobOffer: {
          companyId: companyId,
        },
        appliedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        jobOffer: {
          select: {
            id: true,
            title: true,
          },
        },
        applicant: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Get company views in date range
    // TODO: const companyViews = await prisma.companyView.findMany({
    //   where: {
    //     companyId: companyId,
    //     viewedAt: {
    //       gte: startDate,
    //       lte: endDate,
    //     },
    //   },
    // });

    // Get company follows in date range
    // TODO: const companyFollows = await prisma.companyFollow.findMany({
    //   where: {
    //     companyId: companyId,
    //     createdAt: {
    //       gte: startDate,
    //       lte: endDate,
    //     },
    //   },
    // });

    // Get job likes in date range
    // TODO: const jobLikes = await prisma.jobLike.findMany({
    //   where: {
    //     jobOffer: {
    //       companyId: companyId,
    //     },
    //     createdAt: {
    //       gte: startDate,
    //       lte: endDate,
    //     },
    //   },
    // });

    // Get job shares in date range
    // TODO: const jobShares = await prisma.jobShare.findMany({
    //   where: {
    //     jobOffer: {
    //       companyId: companyId,
    //     },
    //     createdAt: {
    //       gte: startDate,
    //       lte: endDate,
    //     },
    //   },
    // });

    // Calculate metrics
    const totalJobs = jobs.length;
    const totalApplications = applications.length;
    const totalViews = 0 + jobs.reduce((sum, job) => sum + (job.viewsCount || 0), 0); // companyViews.length commented out
    const totalLikes = 0 + jobs.reduce((sum, job) => sum + 0, 0); // jobLikes.length commented out, totalLikes field doesn't exist
    const totalShares = 0 + jobs.reduce((sum, job) => sum + 0, 0); // jobShares.length commented out, totalShares field doesn't exist
    const totalFollows = 0; // companyFollows.length commented out

    // Calculate application status distribution
    const applicationStatusDistribution = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate job performance metrics
    const jobPerformance = jobs.map(job => ({
      id: job.id,
      title: job.title,
      applications: job._count.applications,
      views: job.viewsCount || 0,
      likes: 0, // likes field doesn't exist
      shares: 0, // shares field doesn't exist
      applicationRate: (job.viewsCount || 0) > 0 ? (job._count.applications / (job.viewsCount || 1)) * 100 : 0,
      engagementRate: (job.viewsCount || 0) > 0 ? ((0 + 0) / (job.viewsCount || 1)) * 100 : 0, // likes and shares fields don't exist
    }));

    // Calculate daily metrics for charts
    const dailyMetrics = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayStart = new Date(currentDate);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);

      const dayApplications = applications.filter(app => 
        app.appliedAt >= dayStart && app.appliedAt <= dayEnd
      ).length;

      const dayViews = 0; // companyViews commented out

      const dayLikes = 0; // jobLikes commented out

      const dayShares = 0; // jobShares commented out

      const dayFollows = 0; // companyFollows commented out

      dailyMetrics.push({
        date: currentDate.toISOString().split('T')[0],
        applications: dayApplications,
        views: dayViews,
        likes: dayLikes,
        shares: dayShares,
        follows: dayFollows,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Calculate top performing jobs
    const topPerformingJobs = jobPerformance
      .sort((a, b) => b.applications - a.applications)
      .slice(0, 5);

    // Calculate application sources (if we had source tracking)
    const applicationSources = {
      direct: Math.floor(totalApplications * 0.6), // Mock data
      jobBoard: Math.floor(totalApplications * 0.25),
      referral: Math.floor(totalApplications * 0.10),
      social: Math.floor(totalApplications * 0.05),
    };

    // Calculate hiring funnel metrics
    const hiringFunnel = {
      views: totalViews,
      applications: totalApplications,
      interviews: Math.floor(totalApplications * 0.3), // Mock data
      offers: Math.floor(totalApplications * 0.1), // Mock data
      hires: Math.floor(totalApplications * 0.05), // Mock data
    };

    // Calculate conversion rates
    const conversionRates = {
      viewToApplication: totalViews > 0 ? (totalApplications / totalViews) * 100 : 0,
      applicationToInterview: totalApplications > 0 ? (hiringFunnel.interviews / totalApplications) * 100 : 0,
      interviewToOffer: hiringFunnel.interviews > 0 ? (hiringFunnel.offers / hiringFunnel.interviews) * 100 : 0,
      offerToHire: hiringFunnel.offers > 0 ? (hiringFunnel.hires / hiringFunnel.offers) * 100 : 0,
    };

    // Calculate engagement metrics
    const engagementMetrics = {
      averageJobViews: totalJobs > 0 ? totalViews / totalJobs : 0,
      averageJobApplications: totalJobs > 0 ? totalApplications / totalJobs : 0,
      averageJobLikes: totalJobs > 0 ? totalLikes / totalJobs : 0,
      averageJobShares: totalJobs > 0 ? totalShares / totalJobs : 0,
      engagementRate: totalViews > 0 ? ((totalLikes + totalShares) / totalViews) * 100 : 0,
    };

    // Calculate time-based metrics
    const timeToHire = {
      average: 21, // Mock data - average days
      median: 18, // Mock data - median days
      min: 7, // Mock data - minimum days
      max: 45, // Mock data - maximum days
    };

    // Calculate candidate quality metrics
    const candidateQuality = {
      averageExperience: 3.2, // Mock data
      averageEducation: 4.1, // Mock data
      averageSkills: 8.5, // Mock data
      averageLanguages: 2.1, // Mock data
    };

    const analytics = {
      company,
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        days: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
      },
      overview: {
        totalJobs,
        totalApplications,
        totalViews,
        totalLikes,
        totalShares,
        totalFollows,
        averageRating: 0, // averageRating field doesn't exist
        totalReviews: 0, // totalReviews field doesn't exist
      },
      applicationStatusDistribution,
      jobPerformance,
      dailyMetrics,
      topPerformingJobs,
      applicationSources,
      hiringFunnel,
      conversionRates,
      engagementMetrics,
      timeToHire,
      candidateQuality,
    };

    return NextResponse.json(analytics);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error fetching company analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch company analytics" },
      { status: 500 }
    );
  }
}
