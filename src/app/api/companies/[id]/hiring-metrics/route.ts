import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const hiringMetricsQuerySchema = z.object({
  period: z.enum(["7d", "30d", "90d", "1y", "all"]).default("30d"),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  jobId: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const query = {
      period: searchParams.get("period") || "30d",
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      jobId: searchParams.get("jobId") || undefined,
    };

    const validatedQuery = hiringMetricsQuerySchema.parse(query);

    const { id: companyId } = await params;
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

    // Build where clause for applications
    const applicationWhere: any = {
      companyId: companyId,
      appliedAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (validatedQuery.jobId) {
      applicationWhere.jobId = validatedQuery.jobId;
    }

    // Get applications with detailed information
    const applications = await prisma.jobApplication.findMany({
      where: applicationWhere,
      include: {
        job: {
          select: {
            id: true,
            title: true,
            department: true,
            employmentType: true,
            experienceLevel: true,
            createdAt: true,
          },
        },
        applicant: {
          select: {
            id: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                address: true,
              },
            },
          },
        },
      },
      orderBy: { appliedAt: "desc" },
    });

    // Calculate hiring funnel metrics
    const totalApplications = applications.length;
    const pendingApplications = applications.filter(app => app.status === "PENDING").length;
    const reviewedApplications = applications.filter(app => app.status === "REVIEWED").length;
    const interviewedApplications = applications.filter(app => app.status === "INTERVIEWED").length;
    const rejectedApplications = applications.filter(app => app.status === "REJECTED").length;
    const hiredApplications = applications.filter(app => app.status === "HIRED").length;
    const withdrawnApplications = applications.filter(app => app.status === "WITHDRAWN").length;

    // Calculate conversion rates
    const conversionRates = {
      applicationToReview: totalApplications > 0 ? (reviewedApplications / totalApplications) * 100 : 0,
      reviewToInterview: reviewedApplications > 0 ? (interviewedApplications / reviewedApplications) * 100 : 0,
      interviewToHire: interviewedApplications > 0 ? (hiredApplications / interviewedApplications) * 100 : 0,
      overallHireRate: totalApplications > 0 ? (hiredApplications / totalApplications) * 100 : 0,
    };

    // Calculate time metrics
    const timeMetrics = {
      averageTimeToReview: 0, // Will be calculated below
      averageTimeToInterview: 0, // Will be calculated below
      averageTimeToHire: 0, // Will be calculated below
      averageTimeToReject: 0, // Will be calculated below
    };

    // Calculate time to review
    const reviewedApps = applications.filter(app => app.reviewedAt);
    if (reviewedApps.length > 0) {
      const totalTimeToReview = reviewedApps.reduce((sum, app) => {
        const appliedAt = new Date(app.appliedAt);
        const reviewedAt = new Date(app.reviewedAt!);
        return sum + (reviewedAt.getTime() - appliedAt.getTime());
      }, 0);
      timeMetrics.averageTimeToReview = totalTimeToReview / reviewedApps.length / (1000 * 60 * 60 * 24); // Convert to days
    }

    // Calculate time to interview
    const interviewedApps = applications.filter(app => app.interviewedAt);
    if (interviewedApps.length > 0) {
      const totalTimeToInterview = interviewedApps.reduce((sum, app) => {
        const appliedAt = new Date(app.appliedAt);
        const interviewedAt = new Date(app.interviewedAt!);
        return sum + (interviewedAt.getTime() - appliedAt.getTime());
      }, 0);
      timeMetrics.averageTimeToInterview = totalTimeToInterview / interviewedApps.length / (1000 * 60 * 60 * 24); // Convert to days
    }

    // Calculate time to hire
    const hiredApps = applications.filter(app => app.hiredAt);
    if (hiredApps.length > 0) {
      const totalTimeToHire = hiredApps.reduce((sum, app) => {
        const appliedAt = new Date(app.appliedAt);
        const hiredAt = new Date(app.hiredAt!);
        return sum + (hiredAt.getTime() - appliedAt.getTime());
      }, 0);
      timeMetrics.averageTimeToHire = totalTimeToHire / hiredApps.length / (1000 * 60 * 60 * 24); // Convert to days
    }

    // Calculate time to reject
    const rejectedApps = applications.filter(app => app.rejectedAt);
    if (rejectedApps.length > 0) {
      const totalTimeToReject = rejectedApps.reduce((sum, app) => {
        const appliedAt = new Date(app.appliedAt);
        const rejectedAt = new Date(app.rejectedAt!);
        return sum + (rejectedAt.getTime() - appliedAt.getTime());
      }, 0);
      timeMetrics.averageTimeToReject = totalTimeToReject / rejectedApps.length / (1000 * 60 * 60 * 24); // Convert to days
    }

    // Calculate application sources (mock data for now)
    const applicationSources = {
      direct: Math.floor(totalApplications * 0.4),
      jobBoard: Math.floor(totalApplications * 0.3),
      referral: Math.floor(totalApplications * 0.2),
      social: Math.floor(totalApplications * 0.1),
    };

    // Calculate department metrics
    const departmentMetrics = applications.reduce((acc, app) => {
      const department = app.job.department || "Sin departamento";
      if (!acc[department]) {
        acc[department] = {
          total: 0,
          hired: 0,
          rejected: 0,
          pending: 0,
        };
      }
      acc[department].total++;
      if (app.status === "HIRED") acc[department].hired++;
      if (app.status === "REJECTED") acc[department].rejected++;
      if (app.status === "PENDING") acc[department].pending++;
      return acc;
    }, {} as Record<string, { total: number; hired: number; rejected: number; pending: number }>);

    // Calculate employment type metrics
    const employmentTypeMetrics = applications.reduce((acc, app) => {
      const type = app.job.employmentType;
      if (!acc[type]) {
        acc[type] = {
          total: 0,
          hired: 0,
          rejected: 0,
          pending: 0,
        };
      }
      acc[type].total++;
      if (app.status === "HIRED") acc[type].hired++;
      if (app.status === "REJECTED") acc[type].rejected++;
      if (app.status === "PENDING") acc[type].pending++;
      return acc;
    }, {} as Record<string, { total: number; hired: number; rejected: number; pending: number }>);

    // Calculate experience level metrics
    const experienceLevelMetrics = applications.reduce((acc, app) => {
      const level = app.job.experienceLevel;
      if (!acc[level]) {
        acc[level] = {
          total: 0,
          hired: 0,
          rejected: 0,
          pending: 0,
        };
      }
      acc[level].total++;
      if (app.status === "HIRED") acc[level].hired++;
      if (app.status === "REJECTED") acc[level].rejected++;
      if (app.status === "PENDING") acc[level].pending++;
      return acc;
    }, {} as Record<string, { total: number; hired: number; rejected: number; pending: number }>);

    // Calculate daily hiring metrics
    const dailyHiringMetrics = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayStart = new Date(currentDate);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);

      const dayApplications = applications.filter(app => 
        app.appliedAt >= dayStart && app.appliedAt <= dayEnd
      );

      const dayHires = dayApplications.filter(app => app.status === "HIRED").length;
      const dayRejections = dayApplications.filter(app => app.status === "REJECTED").length;
      const dayInterviews = dayApplications.filter(app => app.status === "INTERVIEWED").length;

      dailyHiringMetrics.push({
        date: currentDate.toISOString().split('T')[0],
        applications: dayApplications.length,
        hires: dayHires,
        rejections: dayRejections,
        interviews: dayInterviews,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Calculate top performing jobs
    const jobPerformance = applications.reduce((acc, app) => {
      const jobId = app.job.id;
      if (!acc[jobId]) {
        acc[jobId] = {
          jobId,
          title: app.job.title,
          department: app.job.department,
          totalApplications: 0,
          hired: 0,
          rejected: 0,
          pending: 0,
          hireRate: 0,
        };
      }
      acc[jobId].totalApplications++;
      if (app.status === "HIRED") acc[jobId].hired++;
      if (app.status === "REJECTED") acc[jobId].rejected++;
      if (app.status === "PENDING") acc[jobId].pending++;
      return acc;
    }, {} as Record<string, any>);

    // Calculate hire rates for each job
    Object.values(jobPerformance).forEach((job: any) => {
      job.hireRate = job.totalApplications > 0 ? (job.hired / job.totalApplications) * 100 : 0;
    });

    const topPerformingJobs = Object.values(jobPerformance)
      .sort((a: any, b: any) => b.hireRate - a.hireRate)
      .slice(0, 10);

    // Calculate candidate quality metrics (mock data for now)
    const candidateQuality = {
      averageExperience: 3.2,
      averageEducation: 4.1,
      averageSkills: 8.5,
      averageLanguages: 2.1,
      topSkills: ["JavaScript", "React", "Node.js", "Python", "SQL"],
      topLanguages: ["Spanish", "English", "Portuguese"],
    };

    // Calculate hiring efficiency metrics
    const hiringEfficiency = {
      applicationsPerHire: hiredApplications > 0 ? totalApplications / hiredApplications : 0,
      interviewsPerHire: hiredApplications > 0 ? interviewedApplications / hiredApplications : 0,
      timeToFill: timeMetrics.averageTimeToHire,
      costPerHire: 0, // Would need cost data
      qualityOfHire: 0, // Would need performance data
    };

    const hiringMetrics = {
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        days: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
      },
      overview: {
        totalApplications,
        pendingApplications,
        reviewedApplications,
        interviewedApplications,
        rejectedApplications,
        hiredApplications,
        withdrawnApplications,
      },
      conversionRates,
      timeMetrics,
      applicationSources,
      departmentMetrics,
      employmentTypeMetrics,
      experienceLevelMetrics,
      dailyHiringMetrics,
      topPerformingJobs,
      candidateQuality,
      hiringEfficiency,
    };

    return NextResponse.json(hiringMetrics);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error fetching hiring metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch hiring metrics" },
      { status: 500 }
    );
  }
}
