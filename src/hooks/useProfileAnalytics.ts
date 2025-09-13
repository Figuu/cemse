"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

interface ProfileAnalytics {
  profileViews: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    change: number;
  };
  profileCompleteness: {
    percentage: number;
    missingFields: string[];
  };
  jobApplications: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    change: number;
  };
  courseProgress: {
    enrolled: number;
    completed: number;
    inProgress: number;
    certificates: number;
  };
  connections: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    change: number;
  };
  skills: {
    total: number;
    verified: number;
    averageLevel: number;
    topSkills: { name: string; level: number; views: number }[];
  };
  engagement: {
    profileViews: { date: string; views: number }[];
    jobApplications: { date: string; applications: number }[];
    courseActivity: { date: string; activity: number }[];
  };
  recommendations: {
    skillSuggestions: string[];
    courseSuggestions: { title: string; reason: string }[];
    jobSuggestions: { title: string; company: string; match: number }[];
  };
}

interface UseProfileAnalyticsReturn {
  analytics: ProfileAnalytics | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  timeRange: string;
  setTimeRange: (range: string) => void;
}

export function useProfileAnalytics(userId?: string): UseProfileAnalyticsReturn {
  const { data: session } = useSession();
  const [analytics, setAnalytics] = useState<ProfileAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("30d");

  const fetchAnalytics = useCallback(async () => {
    if (!session?.user?.id && !userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append("timeRange", timeRange);
      if (userId) {
        params.append("userId", userId);
      }

      const response = await fetch(`/api/profiles/analytics?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch analytics");
      }

      const data = await response.json();
      setAnalytics(data.analytics);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, userId, timeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    isLoading,
    error,
    refetch: fetchAnalytics,
    timeRange,
    setTimeRange
  };
}

