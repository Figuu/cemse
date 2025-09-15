import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export interface DateFilter {
  user: Prisma.UserWhereInput;
  company: Prisma.CompanyWhereInput;
  jobOffer: Prisma.JobOfferWhereInput;
  jobApplication: Prisma.JobApplicationWhereInput;
  course: Prisma.CourseWhereInput;
  courseEnrollment: Prisma.CourseEnrollmentWhereInput;
  message: Prisma.MessageWhereInput;
  businessPlan: Prisma.BusinessPlanWhereInput;
  profile: Prisma.ProfileWhereInput;
  certificate: Prisma.CertificateWhereInput;
}

export interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalCompanies: number;
    totalJobs: number;
    totalApplications: number;
    totalCourses: number;
    totalEnrollments: number;
    totalMessages: number;
    totalBusinessPlans: number;
  };
  userEngagement: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    averageSessionDuration: number;
    pageViews: number;
    bounceRate: number;
  };
  jobPlacement: {
    totalApplications: number;
    applicationsByStatus: Record<string, number>;
    applicationsByMonth: Array<{ month: string; count: number }>;
    averageTimeToHire: number;
    placementRate: number;
    topHiringCompanies: Array<{ company: string; count: number }>;
    topJobCategories: Array<{ category: string; count: number }>;
  };
  courseCompletion: {
    totalEnrollments: number;
    completedCourses: number;
    completionRate: number;
    averageCompletionTime: number;
    topCourses: Array<{ course: string; enrollments: number; completions: number }>;
    certificatesIssued: number;
    courseRatings: Array<{ course: string; rating: number; reviews: number }>;
  };
  entrepreneurship: {
    totalBusinessPlans: number;
    plansByStage: Record<string, number>;
    totalFundingRaised: number;
    averageFundingGoal: number;
    topIndustries: Array<{ industry: string; count: number }>;
    successStories: number;
  };
  revenue: {
    totalRevenue: number;
    revenueByMonth: Array<{ month: string; amount: number }>;
    revenueBySource: Record<string, number>;
    averageRevenuePerUser: number;
    churnRate: number;
  };
  demographics: {
    usersByAge: Array<{ ageGroup: string; count: number }>;
    usersByLocation: Array<{ location: string; count: number }>;
    usersByEducation: Array<{ education: string; count: number }>;
    usersByExperience: Array<{ experience: string; count: number }>;
  };
}

export class AnalyticsService {
  // Note: This service contains type assertions due to schema mismatches
  // The actual database models don't match all the expected fields
  // This is a work-in-progress analytics service that needs schema alignment
  /**
   * Get comprehensive analytics data
   */
  static async getAnalyticsData(
    startDate?: Date,
    endDate?: Date
  ): Promise<AnalyticsData> {
    const dateFilter = this.buildDateFilter(startDate, endDate);

    const [
      overview,
      userEngagement,
      jobPlacement,
      courseCompletion,
      entrepreneurship,
      revenue,
      demographics
    ] = await Promise.all([
      this.getOverviewData(dateFilter),
      this.getUserEngagementData(dateFilter),
      this.getJobPlacementData(dateFilter),
      this.getCourseCompletionData(dateFilter),
      this.getEntrepreneurshipData(dateFilter),
      this.getRevenueData(dateFilter),
      this.getDemographicsData(dateFilter)
    ]);

    return {
      overview,
      userEngagement,
      jobPlacement,
      courseCompletion,
      entrepreneurship,
      revenue,
      demographics
    };
  }

  /**
   * Get overview statistics
   */
  private static async getOverviewData(dateFilter: DateFilter) {
    const [
      totalUsers,
      totalCompanies,
      totalJobs,
      totalApplications,
      totalCourses,
      totalEnrollments,
      totalMessages,
      totalBusinessPlans
    ] = await Promise.all([
      prisma.user.count({ where: dateFilter.user }),
      prisma.company.count({ where: dateFilter.company }),
      prisma.jobOffer.count({ where: dateFilter.jobOffer }),
      prisma.jobApplication.count({ where: dateFilter.jobApplication }),
      prisma.course.count({ where: dateFilter.course }),
      prisma.courseEnrollment.count({ where: dateFilter.courseEnrollment }),
      prisma.message.count({ where: dateFilter.message }),
      prisma.businessPlan.count({ where: dateFilter.businessPlan })
    ]);

    return {
      totalUsers,
      totalCompanies,
      totalJobs,
      totalApplications,
      totalCourses,
      totalEnrollments,
      totalMessages,
      totalBusinessPlans
    };
  }

  /**
   * Get user engagement metrics
   */
  private static async getUserEngagementData(dateFilter: DateFilter) {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [dailyActiveUsers, weeklyActiveUsers, monthlyActiveUsers] = await Promise.all([
      prisma.user.count({
        where: {
          ...dateFilter.user,
          // Note: lastLoginAt field doesn't exist in User model, using createdAt as fallback
          createdAt: { gte: oneDayAgo }
        }
      }),
      prisma.user.count({
        where: {
          ...dateFilter.user,
          createdAt: { gte: oneWeekAgo }
        }
      }),
      prisma.user.count({
        where: {
          ...dateFilter.user,
          createdAt: { gte: oneMonthAgo }
        }
      })
    ]);

    // Calculate average session duration (placeholder - would need session tracking)
    const averageSessionDuration = 15; // minutes
    const pageViews = 1000; // placeholder
    const bounceRate = 0.35; // 35%

    return {
      dailyActiveUsers,
      weeklyActiveUsers,
      monthlyActiveUsers,
      averageSessionDuration,
      pageViews,
      bounceRate
    };
  }

  /**
   * Get job placement analytics
   */
  private static async getJobPlacementData(dateFilter: DateFilter) {
    const applications = await prisma.jobApplication.findMany({
      where: dateFilter.jobApplication,
      include: {
        jobOffer: {
          include: {
            company: true
          }
        }
      }
    });

    const applicationsByStatus = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group applications by month
    const applicationsByMonth = applications.reduce((acc, app) => {
      const month = app.appliedAt.toISOString().substring(0, 7);
      const existing = acc.find((item) => item.month === month);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ month, count: 1 });
      }
      return acc;
    }, [] as Array<{ month: string; count: number }>);

    // Calculate average time to hire (placeholder)
    const averageTimeToHire = 14; // days

    // Calculate placement rate
    const hiredApplications = applications.filter(app => app.status === 'HIRED').length;
    const placementRate = applications.length > 0 ? (hiredApplications / applications.length) * 100 : 0;

    // Top hiring companies
    const companyCounts = applications.reduce((acc, app) => {
      const companyName = app.jobOffer.company.name;
      acc[companyName] = (acc[companyName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topHiringCompanies = Object.entries(companyCounts)
      .map(([company, count]) => ({ company, count }))
      .sort((a, b) => (b.count as number) - (a.count as number))
      .slice(0, 10);

    // Top job categories (using experience level as category)
    const categoryCounts = applications.reduce((acc, app) => {
      const category = app.jobOffer.experienceLevel;
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topJobCategories = Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => (b.count as number) - (a.count as number))
      .slice(0, 10);

    return {
      totalApplications: applications.length,
      applicationsByStatus,
      applicationsByMonth,
      averageTimeToHire,
      placementRate,
      topHiringCompanies,
      topJobCategories
    };
  }

  /**
   * Get course completion analytics
   */
  private static async getCourseCompletionData(dateFilter: DateFilter) {
    const enrollments = await prisma.courseEnrollment.findMany({
      where: dateFilter.courseEnrollment,
      include: {
        course: true
        // progress field doesn't exist in CourseEnrollment model
      }
    });

    const completedEnrollments = enrollments.filter(enrollment => 
      enrollment.completedAt !== null
    );

    const completionRate = enrollments.length > 0 ? 
      (completedEnrollments.length / enrollments.length) * 100 : 0;

    // Calculate average completion time (placeholder)
    const averageCompletionTime = 30; // days

    // Top courses by enrollments
    const courseCounts = enrollments.reduce((acc, enrollment) => {
      const courseName = enrollment.course.title;
      if (!acc[courseName]) {
        acc[courseName] = { enrollments: 0, completions: 0 };
      }
      acc[courseName].enrollments++;
      if (enrollment.completedAt !== null) {
        acc[courseName].completions++;
      }
      return acc;
    }, {} as Record<string, { enrollments: number; completions: number }>);

    const topCourses = Object.entries(courseCounts)
      .map(([course, data]) => ({ course, ...(data as { enrollments: number; completions: number }) }))
      .sort((a, b) => b.enrollments - a.enrollments)
      .slice(0, 10);

    // Get certificates issued
    const certificatesIssued = await prisma.certificate.count({
      where: dateFilter.certificate
    });

    // Course ratings (placeholder)
    const courseRatings = topCourses.map(course => ({
      course: course.course,
      rating: 4.2 + Math.random() * 0.8, // Random rating between 4.2-5.0
      reviews: Math.floor(Math.random() * 50) + 10 // Random reviews between 10-60
    }));

    return {
      totalEnrollments: enrollments.length,
      completedCourses: completedEnrollments.length,
      completionRate,
      averageCompletionTime,
      topCourses,
      certificatesIssued,
      courseRatings
    };
  }

  /**
   * Get entrepreneurship analytics
   */
  private static async getEntrepreneurshipData(dateFilter: DateFilter) {
    const businessPlans = await prisma.businessPlan.findMany({
      where: dateFilter.businessPlan
    });

    const plansByStage = businessPlans.reduce((acc, plan) => {
      acc[plan.status] = (acc[plan.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Extract funding data from content JSON (placeholder logic)
    const totalFundingRaised = businessPlans.reduce((sum, plan) => {
      const content = plan.content as Record<string, unknown>;
      return sum + (Number(content.currentFunding) || 0);
    }, 0);
    
    const averageFundingGoal = businessPlans.length > 0 ? 
      businessPlans.reduce((sum, plan) => {
        const content = plan.content as Record<string, unknown>;
        return sum + (Number(content.fundingGoal) || 0);
      }, 0) / businessPlans.length : 0;

    // Top industries (extracted from content)
    const industryCounts = businessPlans.reduce((acc, plan) => {
      const content = plan.content as Record<string, unknown>;
      const industry = content.industry as string || 'Unknown';
      acc[industry] = (acc[industry] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topIndustries = Object.entries(industryCounts)
      .map(([industry, count]) => ({ industry, count }))
      .sort((a, b) => (b.count as number) - (a.count as number))
      .slice(0, 10);

    // Success stories (based on status)
    const successStories = businessPlans.filter(plan => 
      plan.status === 'published'
    ).length;

    return {
      totalBusinessPlans: businessPlans.length,
      plansByStage,
      totalFundingRaised,
      averageFundingGoal,
      topIndustries,
      successStories
    };
  }

  /**
   * Get revenue analytics
   */
  private static async getRevenueData(_dateFilter: DateFilter) {
    // Placeholder revenue data - would need actual revenue tracking
    const totalRevenue = 50000; // USD
    const averageRevenuePerUser = 25; // USD
    const churnRate = 0.05; // 5%

    // Revenue by month (placeholder)
    const revenueByMonth = [
      { month: '2024-01', amount: 4500 },
      { month: '2024-02', amount: 5200 },
      { month: '2024-03', amount: 4800 },
      { month: '2024-04', amount: 6100 },
      { month: '2024-05', amount: 5800 },
      { month: '2024-06', amount: 6500 }
    ];

    const revenueBySource = {
      'subscriptions': 30000,
      'premium_features': 15000,
      'certifications': 5000
    };

    return {
      totalRevenue,
      revenueByMonth,
      revenueBySource,
      averageRevenuePerUser,
      churnRate
    };
  }

  /**
   * Get demographics data
   */
  private static async getDemographicsData(dateFilter: DateFilter) {
    const profiles = await prisma.profile.findMany({
      where: dateFilter.profile
    });

    // Users by age group
    const usersByAge = profiles.reduce((acc, profile) => {
      const age = profile.birthDate ? 
        new Date().getFullYear() - new Date(profile.birthDate).getFullYear() : 0;
      
      let ageGroup = 'Unknown';
      if (age >= 18 && age <= 24) ageGroup = '18-24';
      else if (age >= 25 && age <= 34) ageGroup = '25-34';
      else if (age >= 35 && age <= 44) ageGroup = '35-44';
      else if (age >= 45 && age <= 54) ageGroup = '45-54';
      else if (age >= 55) ageGroup = '55+';

      acc[ageGroup] = (acc[ageGroup] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Users by location
    const usersByLocation = profiles.reduce((acc, profile) => {
      const location = profile.city || 'Unknown';
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Users by education (placeholder)
    const usersByEducation = [
      { education: 'High School', count: 25 },
      { education: 'Bachelor\'s', count: 45 },
      { education: 'Master\'s', count: 20 },
      { education: 'PhD', count: 5 },
      { education: 'Other', count: 5 }
    ];

    // Users by experience (using graduation year as proxy)
    const usersByExperience = profiles.reduce((acc, profile) => {
      const currentYear = new Date().getFullYear();
      const experience = profile.graduationYear ? 
        currentYear - profile.graduationYear : 0;
      
      let experienceGroup = 'No Experience';
      if (experience >= 1 && experience <= 2) experienceGroup = '1-2 years';
      else if (experience >= 3 && experience <= 5) experienceGroup = '3-5 years';
      else if (experience >= 6 && experience <= 10) experienceGroup = '6-10 years';
      else if (experience > 10) experienceGroup = '10+ years';

      acc[experienceGroup] = (acc[experienceGroup] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      usersByAge: Object.entries(usersByAge).map(([ageGroup, count]) => ({ ageGroup, count })),
      usersByLocation: Object.entries(usersByLocation)
        .map(([location, count]) => ({ location, count }))
        .sort((a, b) => (b.count as number) - (a.count as number))
        .slice(0, 10),
      usersByEducation,
      usersByExperience: Object.entries(usersByExperience).map(([experience, count]) => ({ experience, count }))
    };
  }

  /**
   * Build date filter for queries
   */
  private static buildDateFilter(startDate?: Date, endDate?: Date): DateFilter {
    const baseFilter: Record<string, unknown> = {};
    
    if (startDate || endDate) {
      const createdAt: Record<string, unknown> = {};
      if (startDate) createdAt.gte = startDate;
      if (endDate) createdAt.lte = endDate;
      baseFilter.createdAt = createdAt;
    }

    return {
      user: baseFilter as Prisma.UserWhereInput,
      company: baseFilter as Prisma.CompanyWhereInput,
      jobOffer: baseFilter as Prisma.JobOfferWhereInput,
      jobApplication: baseFilter as Prisma.JobApplicationWhereInput,
      course: baseFilter as Prisma.CourseWhereInput,
      courseEnrollment: baseFilter as Prisma.CourseEnrollmentWhereInput,
      message: baseFilter as Prisma.MessageWhereInput,
      businessPlan: baseFilter as Prisma.BusinessPlanWhereInput,
      profile: baseFilter as Prisma.ProfileWhereInput,
      certificate: baseFilter as Prisma.CertificateWhereInput
    };
  }

  /**
   * Get analytics for specific user role
   */
  static async getRoleAnalytics(role: string, userId?: string) {
    switch (role) {
      case 'YOUTH':
        return this.getYouthAnalytics(userId);
      case 'COMPANIES':
        return this.getCompanyAnalytics(userId);
      case 'INSTITUTION':
        return this.getInstitutionAnalytics(userId);
      case 'SUPERADMIN':
        return this.getAnalyticsData();
      default:
        return null;
    }
  }

  /**
   * Get analytics for youth users
   */
  private static async getYouthAnalytics(userId?: string) {
    if (!userId) return null;

    const [applications, enrollments, businessPlans] = await Promise.all([
      prisma.jobApplication.findMany({
        where: { applicantId: userId },
        include: { jobOffer: { include: { company: true } } }
      }),
      prisma.courseEnrollment.findMany({
        where: { studentId: userId },
        include: { course: true }
      }),
      prisma.businessPlan.findMany({
        where: { entrepreneurshipId: userId }
      })
    ]);

    return {
      applications: applications.length,
      applicationsByStatus: applications.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      enrolledCourses: enrollments.length,
      completedCourses: enrollments.filter(e => e.completedAt !== null).length,
      businessPlans: businessPlans.length,
      certificates: await prisma.certificate.count({ where: { studentId: userId } })
    };
  }

  /**
   * Get analytics for company users
   */
  private static async getCompanyAnalytics(userId?: string) {
    if (!userId) return null;

    const company = await prisma.company.findFirst({
      where: { createdBy: userId }
    });

    if (!company) return null;

    const [jobs, applications, employees] = await Promise.all([
      prisma.jobOffer.findMany({ where: { companyId: company.id } }),
      prisma.jobApplication.findMany({
        where: { jobOffer: { companyId: company.id } }
      }),
      prisma.companyEmployee.findMany({ where: { companyId: company.id } })
    ]);

    return {
      totalJobs: jobs.length,
      totalApplications: applications.length,
      applicationsByStatus: applications.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      totalEmployees: employees.length,
      activeJobs: jobs.filter(job => job.status === 'ACTIVE').length
    };
  }

  /**
   * Get analytics for institution users
   */
  private static async getInstitutionAnalytics(userId?: string) {
    if (!userId) return null;

    const institution = await prisma.institution.findFirst({
      where: { createdBy: userId }
    });

    if (!institution) return null;

    const [courses, enrollments, certificates] = await Promise.all([
      prisma.course.findMany({ where: { institutionName: institution.name } }),
      prisma.courseEnrollment.findMany({
        where: { course: { institutionName: institution.name } }
      }),
      prisma.certificate.findMany({
        where: { course: { institutionName: institution.name } }
      })
    ]);

    return {
      totalCourses: courses.length,
      totalEnrollments: enrollments.length,
      totalCertificates: certificates.length,
      averageRating: courses.reduce((sum, course) => sum + Number(course.rating || 0), 0) / courses.length || 0
    };
  }
}
