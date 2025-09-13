"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

export interface CompanyAnalytics {
  company: {
    id: string;
    name: string;
  };
  timeRange: string;
  period: {
    start: string;
    end: string;
  };
  applicationMetrics: {
    total: number;
    new: number;
    byStatus: Record<string, number>;
    averageResponseTime: number;
    conversionRate: number;
  };
  jobPerformance: Array<{
    id: string;
    title: string;
    applications: number;
    views: number;
    conversionRate: number;
    averageResponseTime: number;
    status: string;
    postedAt: string;
  }>;
  candidateInsights: {
    totalCandidates: number;
    experienceLevels: Record<string, number>;
    educationLevels: Record<string, number>;
    topSkills: Array<{ skill: string; count: number }>;
    averageSkillsPerCandidate: number;
  };
  timeSeriesData: Array<{
    date: string;
    applications: number;
    hired: number;
    rejected: number;
  }>;
  topPerformingJobs: Array<{
    id: string;
    title: string;
    applications: number;
    hired: number;
    conversionRate: number;
    views: number;
    postedAt: string;
  }>;
  applicationSources: Array<{
    source: string;
    count: number;
    percentage: number;
  }>;
  candidateDemographics: {
    byLocation: Array<{
      location: string;
      count: number;
      percentage: number;
    }>;
    totalCandidates: number;
  };
  hiringFunnel: {
    applied: number;
    reviewed: number;
    shortlisted: number;
    hired: number;
    conversionRates: {
      reviewRate: number;
      shortlistRate: number;
      hireRate: number;
      overallHireRate: number;
    };
  };
}

interface UseCompanyAnalyticsReturn {
  analytics: CompanyAnalytics | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  timeRange: string;
  setTimeRange: (range: string) => void;
}

interface CompanyAnalyticsFilters {
  timeRange?: string;
  jobId?: string;
}

export function useCompanyAnalytics(filters?: CompanyAnalyticsFilters): UseCompanyAnalyticsReturn {
  const { data: session } = useSession();
  const [analytics, setAnalytics] = useState<CompanyAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState(filters?.timeRange || "30d");

  const fetchAnalytics = useCallback(async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (timeRange) params.append("timeRange", timeRange);
      if (filters?.jobId) params.append("jobId", filters.jobId);

      const response = await fetch(`/api/company/analytics?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch company analytics");
      }

      const data = await response.json();
      setAnalytics(data.analytics);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, timeRange, filters?.jobId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    isLoading,
    error,
    refetch: fetchAnalytics,
    timeRange,
    setTimeRange,
  };
}
