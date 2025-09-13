"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { DiscoveryFilters } from "@/lib/startupDiscoveryService";

export interface DiscoveryResult {
  startups: any[];
  total: number;
  facets: {
    categories: Array<{ name: string; count: number }>;
    businessStages: Array<{ name: string; count: number; value: string }>;
    municipalities: Array<{ name: string; count: number }>;
    departments: Array<{ name: string; count: number }>;
  };
  trending: any[];
  recommendations: any[];
}

export interface DiscoveryAnalytics {
  totalStartups: number;
  categoryStats: Array<{ name: string; count: number }>;
  stageStats: Array<{ name: string; count: number; value: string }>;
  locationStats: Array<{ name: string; count: number }>;
  recentActivity: number;
}

interface UseStartupDiscoveryReturn {
  discoveryResult: DiscoveryResult | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  discoverStartups: (filters: DiscoveryFilters) => Promise<DiscoveryResult | null>;
}

interface UseTrendingStartupsReturn {
  trendingStartups: any[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseRecommendedStartupsReturn {
  recommendedStartups: any[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseDiscoveryAnalyticsReturn {
  analytics: DiscoveryAnalytics | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useStartupDiscovery(filters?: DiscoveryFilters): UseStartupDiscoveryReturn {
  const { data: session } = useSession();
  const [discoveryResult, setDiscoveryResult] = useState<DiscoveryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const discoverStartups = async (newFilters: DiscoveryFilters): Promise<DiscoveryResult | null> => {
    if (!session?.user?.id) return null;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      // Add all filter parameters
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/startups/discover?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to discover startups");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDiscovery = useCallback(async () => {
    if (!session?.user?.id || !filters) return;

    const result = await discoverStartups(filters);
    if (result) {
      setDiscoveryResult(result);
    }
  }, [session?.user?.id, filters]);

  useEffect(() => {
    fetchDiscovery();
  }, [fetchDiscovery]);

  return {
    discoveryResult,
    isLoading,
    error,
    refetch: fetchDiscovery,
    discoverStartups,
  };
}

export function useTrendingStartups(limit: number = 10): UseTrendingStartupsReturn {
  const { data: session } = useSession();
  const [trendingStartups, setTrendingStartups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrending = useCallback(async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/startups/trending?limit=${limit}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch trending startups");
      }

      const data = await response.json();
      setTrendingStartups(data.startups || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, limit]);

  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);

  return {
    trendingStartups,
    isLoading,
    error,
    refetch: fetchTrending,
  };
}

export function useRecommendedStartups(limit: number = 10): UseRecommendedStartupsReturn {
  const { data: session } = useSession();
  const [recommendedStartups, setRecommendedStartups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/startups/recommendations?limit=${limit}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch recommended startups");
      }

      const data = await response.json();
      setRecommendedStartups(data.startups || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, limit]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return {
    recommendedStartups,
    isLoading,
    error,
    refetch: fetchRecommendations,
  };
}

export function useDiscoveryAnalytics(): UseDiscoveryAnalyticsReturn {
  const { data: session } = useSession();
  const [analytics, setAnalytics] = useState<DiscoveryAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/startups/analytics");
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch discovery analytics");
      }

      const data = await response.json();
      setAnalytics(data.analytics);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    isLoading,
    error,
    refetch: fetchAnalytics,
  };
}
