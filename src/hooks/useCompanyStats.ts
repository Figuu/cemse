"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: "full-time" | "part-time" | "contract" | "internship";
  applications: number;
  views: number;
  status: "active" | "paused" | "closed";
  postedDate: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
}

interface CompanyStats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  hiredCandidates: number;
  profileViews: number;
  responseRate: number;
}

interface UseCompanyStatsReturn {
  stats: CompanyStats | null;
  jobPostings: JobPosting[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCompanyStats(): UseCompanyStatsReturn {
  const { data: session } = useSession();
  const [stats, setStats] = useState<CompanyStats | null>(null);
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/company/stats");
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch company statistics");
      }

      const data = await response.json();
      setStats(data.stats);
      setJobPostings(data.jobPostings || []);
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
    jobPostings,
    isLoading,
    error,
    refetch: fetchStats,
  };
}
