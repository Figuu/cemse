"use client";

import { useQuery } from "@tanstack/react-query";

export interface CompanyAnalytics {
  company: {
    id: string;
    name: string;
    totalJobs: number;
    totalApplications: number;
    totalViews: number;
    totalFollowers: number;
    averageRating: number;
    totalReviews: number;
  };
  period: {
    startDate: string;
    endDate: string;
    days: number;
  };
  overview: {
    totalJobs: number;
    totalApplications: number;
    totalViews: number;
    totalLikes: number;
    totalShares: number;
    totalFollows: number;
    averageRating: number;
    totalReviews: number;
  };
  applicationStatusDistribution: Record<string, number>;
  jobPerformance: Array<{
    id: string;
    title: string;
    applications: number;
    views: number;
    likes: number;
    shares: number;
    applicationRate: number;
    engagementRate: number;
  }>;
  dailyMetrics: Array<{
    date: string;
    applications: number;
    views: number;
    likes: number;
    shares: number;
    follows: number;
  }>;
  topPerformingJobs: Array<{
    id: string;
    title: string;
    applications: number;
    views: number;
    likes: number;
    shares: number;
    applicationRate: number;
    engagementRate: number;
  }>;
  applicationSources: {
    direct: number;
    jobBoard: number;
    referral: number;
    social: number;
  };
  hiringFunnel: {
    views: number;
    applications: number;
    interviews: number;
    offers: number;
    hires: number;
  };
  conversionRates: {
    viewToApplication: number;
    applicationToInterview: number;
    interviewToOffer: number;
    offerToHire: number;
  };
  engagementMetrics: {
    averageJobViews: number;
    averageJobApplications: number;
    averageJobLikes: number;
    averageJobShares: number;
    engagementRate: number;
  };
  timeToHire: {
    average: number;
    median: number;
    min: number;
    max: number;
  };
  candidateQuality: {
    averageExperience: number;
    averageEducation: number;
    averageSkills: number;
    averageLanguages: number;
  };
}

export interface HiringMetrics {
  period: {
    startDate: string;
    endDate: string;
    days: number;
  };
  overview: {
    totalApplications: number;
    pendingApplications: number;
    reviewedApplications: number;
    interviewedApplications: number;
    rejectedApplications: number;
    hiredApplications: number;
    withdrawnApplications: number;
  };
  conversionRates: {
    applicationToReview: number;
    reviewToInterview: number;
    interviewToHire: number;
    overallHireRate: number;
  };
  timeMetrics: {
    averageTimeToReview: number;
    averageTimeToInterview: number;
    averageTimeToHire: number;
    averageTimeToReject: number;
  };
  applicationSources: {
    direct: number;
    jobBoard: number;
    referral: number;
    social: number;
  };
  departmentMetrics: Record<string, {
    total: number;
    hired: number;
    rejected: number;
    pending: number;
  }>;
  employmentTypeMetrics: Record<string, {
    total: number;
    hired: number;
    rejected: number;
    pending: number;
  }>;
  experienceLevelMetrics: Record<string, {
    total: number;
    hired: number;
    rejected: number;
    pending: number;
  }>;
  dailyHiringMetrics: Array<{
    date: string;
    applications: number;
    hires: number;
    rejections: number;
    interviews: number;
  }>;
  topPerformingJobs: Array<{
    jobId: string;
    title: string;
    department: string;
    totalApplications: number;
    hired: number;
    rejected: number;
    pending: number;
    hireRate: number;
  }>;
  candidateQuality: {
    averageExperience: number;
    averageEducation: number;
    averageSkills: number;
    averageLanguages: number;
    topSkills: string[];
    topLanguages: string[];
  };
  hiringEfficiency: {
    applicationsPerHire: number;
    interviewsPerHire: number;
    timeToFill: number;
    costPerHire: number;
    qualityOfHire: number;
  };
}

export interface AnalyticsFilters {
  period?: "7d" | "30d" | "90d" | "1y" | "all";
  startDate?: string;
  endDate?: string;
  jobId?: string;
}

export function useCompanyAnalytics(companyId: string, filters: AnalyticsFilters = {}) {
  return useQuery({
    queryKey: ["company-analytics", companyId, filters],
    queryFn: async (): Promise<CompanyAnalytics> => {
      const params = new URLSearchParams();
      
      if (filters.period) params.append("period", filters.period);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);

      const response = await fetch(`/api/companies/${companyId}/analytics?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch company analytics");
      }
      return response.json();
    },
    enabled: !!companyId,
  });
}

export function useHiringMetrics(companyId: string, filters: AnalyticsFilters = {}) {
  return useQuery({
    queryKey: ["hiring-metrics", companyId, filters],
    queryFn: async (): Promise<HiringMetrics> => {
      const params = new URLSearchParams();
      
      if (filters.period) params.append("period", filters.period);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.jobId) params.append("jobId", filters.jobId);

      const response = await fetch(`/api/companies/${companyId}/hiring-metrics?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch hiring metrics");
      }
      return response.json();
    },
    enabled: !!companyId,
  });
}

// Predefined period options
export const ANALYTICS_PERIODS = [
  { value: "7d", label: "Últimos 7 días" },
  { value: "30d", label: "Últimos 30 días" },
  { value: "90d", label: "Últimos 90 días" },
  { value: "1y", label: "Último año" },
  { value: "all", label: "Todo el tiempo" },
];

// Application status labels
export const APPLICATION_STATUS_LABELS = {
  PENDING: "Pendiente",
  REVIEWED: "Revisado",
  INTERVIEWED: "Entrevistado",
  REJECTED: "Rechazado",
  HIRED: "Contratado",
  WITHDRAWN: "Retirado",
};

// Employment type labels
export const EMPLOYMENT_TYPE_LABELS = {
  FULL_TIME: "Tiempo Completo",
  PART_TIME: "Medio Tiempo",
  CONTRACT: "Contrato",
  INTERNSHIP: "Pasantía",
  FREELANCE: "Freelance",
  TEMPORARY: "Temporal",
};

// Experience level labels
export const EXPERIENCE_LEVEL_LABELS = {
  ENTRY_LEVEL: "Nivel Inicial",
  MID_LEVEL: "Nivel Medio",
  SENIOR_LEVEL: "Nivel Senior",
  EXECUTIVE: "Ejecutivo",
  INTERN: "Interno",
};

// Application source labels
export const APPLICATION_SOURCE_LABELS = {
  direct: "Directo",
  jobBoard: "Portal de Empleo",
  referral: "Referencia",
  social: "Redes Sociales",
};

// Helper functions for formatting metrics
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

export const formatNumber = (value: number): string => {
  return value.toLocaleString();
};

export const formatDays = (value: number): string => {
  if (value < 1) {
    return `${Math.round(value * 24)} horas`;
  }
  return `${Math.round(value)} días`;
};

export const formatCurrency = (value: number, currency: string = "USD"): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(value);
};

// Helper function to calculate growth rate
export const calculateGrowthRate = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

// Helper function to get status color
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    REVIEWED: "bg-blue-100 text-blue-800",
    INTERVIEWED: "bg-purple-100 text-purple-800",
    REJECTED: "bg-red-100 text-red-800",
    HIRED: "bg-green-100 text-green-800",
    WITHDRAWN: "bg-gray-100 text-gray-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

// Helper function to get performance level
export const getPerformanceLevel = (value: number, thresholds: { good: number; excellent: number }): "poor" | "average" | "good" | "excellent" => {
  if (value >= thresholds.excellent) return "excellent";
  if (value >= thresholds.good) return "good";
  if (value > 0) return "average";
  return "poor";
};

// Helper function to get performance color
export const getPerformanceColor = (level: "poor" | "average" | "good" | "excellent"): string => {
  const colors = {
    poor: "text-red-600",
    average: "text-yellow-600",
    good: "text-blue-600",
    excellent: "text-green-600",
  };
  return colors[level];
};