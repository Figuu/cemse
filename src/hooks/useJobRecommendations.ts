"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Job } from "./useJobs";

interface JobRecommendation extends Job {
  matchPercentage: number;
  reasons: string[];
  score: number;
}

interface UseJobRecommendationsReturn {
  recommendations: JobRecommendation[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  profile: {
    skills: string[];
    experienceLevel: string;
    educationLevel: string;
    location: string;
  } | null;
}

interface JobRecommendationFilters {
  limit?: number;
  includeApplied?: boolean;
}

export function useJobRecommendations(filters?: JobRecommendationFilters): UseJobRecommendationsReturn {
  const { data: session } = useSession();
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([]);
  const [profile, setProfile] = useState<{
    skills: string[];
    experienceLevel: string;
    educationLevel: string;
    location: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters?.limit) params.append("limit", filters.limit.toString());
      if (filters?.includeApplied) params.append("includeApplied", filters.includeApplied.toString());

      const response = await fetch(`/api/jobs/recommendations?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch job recommendations");
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []);
      setProfile(data.profile || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, filters?.limit, filters?.includeApplied]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return {
    recommendations,
    profile,
    isLoading,
    error,
    refetch: fetchRecommendations,
  };
}
