"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

export interface CourseRecommendation {
  id: string;
  title: string;
  description: string;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  category: string;
  tags: string[];
  duration: number;
  rating: number;
  instructor: {
    id: string;
    name: string;
    email: string;
  };
  stats: {
    totalStudents: number;
    totalModules: number;
    totalLessons: number;
  };
  recommendationScore: number;
  recommendationReason: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecommendationFilters {
  type?: "personalized" | "popular" | "similar" | "trending" | "based_on_skills" | "based_on_enrollment";
  limit?: number;
  courseId?: string; // For similar recommendations
}

interface UseCourseRecommendationsReturn {
  recommendations: CourseRecommendation[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getRecommendations: (filters: RecommendationFilters) => Promise<CourseRecommendation[]>;
}

export function useCourseRecommendations(filters?: RecommendationFilters): UseCourseRecommendationsReturn {
  const { data: session } = useSession();
  const [recommendations, setRecommendations] = useState<CourseRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters?.type) params.append("type", filters.type);
      if (filters?.limit) params.append("limit", filters.limit.toString());
      if (filters?.courseId) params.append("courseId", filters.courseId);

      const response = await fetch(`/api/courses/recommendations?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch recommendations");
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, filters]);

  const getRecommendations = async (newFilters: RecommendationFilters): Promise<CourseRecommendation[]> => {
    if (!session?.user?.id) return [];

    try {
      const params = new URLSearchParams();
      if (newFilters.type) params.append("type", newFilters.type);
      if (newFilters.limit) params.append("limit", newFilters.limit.toString());
      if (newFilters.courseId) params.append("courseId", newFilters.courseId);

      const response = await fetch(`/api/courses/recommendations?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch recommendations");
      }

      const data = await response.json();
      return data.recommendations || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch recommendations");
      return [];
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return {
    recommendations,
    isLoading,
    error,
    refetch: fetchRecommendations,
    getRecommendations,
  };
}

// Hook for personalized recommendations
export function usePersonalizedRecommendations(limit: number = 10) {
  const { recommendations, isLoading, error, refetch } = useCourseRecommendations({
    type: "personalized",
    limit,
  });

  return {
    recommendations,
    isLoading,
    error,
    refetch,
  };
}

// Hook for popular recommendations
export function usePopularRecommendations(limit: number = 10) {
  const { recommendations, isLoading, error, refetch } = useCourseRecommendations({
    type: "popular",
    limit,
  });

  return {
    recommendations,
    isLoading,
    error,
    refetch,
  };
}

// Hook for similar course recommendations
export function useSimilarRecommendations(courseId: string, limit: number = 5) {
  const { recommendations, isLoading, error, refetch } = useCourseRecommendations({
    type: "similar",
    courseId,
    limit,
  });

  return {
    recommendations,
    isLoading,
    error,
    refetch,
  };
}

// Hook for trending recommendations
export function useTrendingRecommendations(limit: number = 10) {
  const { recommendations, isLoading, error, refetch } = useCourseRecommendations({
    type: "trending",
    limit,
  });

  return {
    recommendations,
    isLoading,
    error,
    refetch,
  };
}

// Hook for skill-based recommendations
export function useSkillBasedRecommendations(limit: number = 10) {
  const { recommendations, isLoading, error, refetch } = useCourseRecommendations({
    type: "based_on_skills",
    limit,
  });

  return {
    recommendations,
    isLoading,
    error,
    refetch,
  };
}
