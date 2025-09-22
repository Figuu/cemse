"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

interface YouthStats {
  completedCourses: number;
  totalCertificates: number;
  jobApplications: number;
  enrolledCourses: number;
  studyHours: number;
}

interface UseYouthStatsReturn {
  stats: YouthStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useYouthStats(): UseYouthStatsReturn {
  const { data: session } = useSession();
  const [stats, setStats] = useState<YouthStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/youth/stats");
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch youth statistics");
      }

      const data = await response.json();
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  };
}
