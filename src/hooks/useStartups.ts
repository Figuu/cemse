"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

export interface FinancialProjections {
  revenue?: {
    year1?: number;
    year2?: number;
    year3?: number;
  };
  expenses?: {
    year1?: number;
    year2?: number;
    year3?: number;
  };
  profit?: {
    year1?: number;
    year2?: number;
    year3?: number;
  };
  funding?: {
    amount?: number;
    source?: string;
    date?: string;
  };
}

export interface BusinessPlan {
  id: string;
  executiveSummary?: string;
  marketAnalysis?: string;
  financialProjections?: FinancialProjections;
  marketingStrategy?: string;
  operationsPlan?: string;
  riskAnalysis?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Startup {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  businessStage: "IDEA" | "STARTUP" | "GROWING" | "ESTABLISHED";
  logo?: string;
  images: string[];
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  municipality: string;
  department: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  founded?: string;
  employees?: number;
  annualRevenue?: number;
  businessModel?: string;
  targetMarket?: string;
  isPublic: boolean;
  isActive: boolean;
  viewsCount: number;
  rating?: number;
  reviewsCount: number;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  };
  businessPlan?: BusinessPlan;
}

export interface StartupFilters {
  search?: string;
  category?: string;
  businessStage?: string;
  municipality?: string;
  isPublic?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateStartupData {
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  businessStage: "IDEA" | "STARTUP" | "GROWING" | "ESTABLISHED";
  logo?: string;
  images?: string[];
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  municipality: string;
  department?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  founded?: string;
  employees?: number;
  annualRevenue?: number;
  businessModel?: string;
  targetMarket?: string;
  isPublic?: boolean;
}

export interface BusinessPlanData {
  executiveSummary?: string;
  marketAnalysis?: string;
  financialProjections?: {
    revenue: Array<{ year: number; amount: number }>;
    expenses: Array<{ year: number; amount: number }>;
    profit: Array<{ year: number; amount: number }>;
    funding: {
      required: number;
      current: number;
      sources: string[];
    };
  };
  marketingStrategy?: string;
  operationsPlan?: string;
  riskAnalysis?: string;
}

interface UseStartupsReturn {
  startups: Startup[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  refetch: () => Promise<void>;
  createStartup: (data: CreateStartupData) => Promise<Startup | null>;
  updateStartup: (id: string, data: Partial<CreateStartupData>) => Promise<Startup | null>;
  deleteStartup: (id: string) => Promise<boolean>;
  getStartup: (id: string) => Promise<Startup | null>;
}

export function useStartups(filters?: StartupFilters): UseStartupsReturn {
  const { data: session } = useSession();
  const [startups, setStartups] = useState<Startup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const fetchStartups = useCallback(async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append("search", filters.search);
      if (filters?.category) params.append("category", filters.category);
      if (filters?.businessStage) params.append("businessStage", filters.businessStage);
      if (filters?.municipality) params.append("municipality", filters.municipality);
      if (filters?.isPublic !== undefined) params.append("isPublic", filters.isPublic.toString());
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());
      if (filters?.sortBy) params.append("sortBy", filters.sortBy);
      if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);

      const response = await fetch(`/api/startups?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch startups");
      }

      const data = await response.json();
      setStartups(data.startups || []);
      setPagination(data.pagination || (prev => prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, filters]);

  const createStartup = async (data: CreateStartupData): Promise<Startup | null> => {
    if (!session?.user?.id) return null;

    try {
      const response = await fetch("/api/startups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create startup");
      }

      const result = await response.json();
      await fetchStartups(); // Refresh the list
      return result.startup;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create startup");
      return null;
    }
  };

  const updateStartup = async (id: string, data: Partial<CreateStartupData>): Promise<Startup | null> => {
    if (!session?.user?.id) return null;

    try {
      const response = await fetch(`/api/startups/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update startup");
      }

      const result = await response.json();
      await fetchStartups(); // Refresh the list
      return result.startup;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update startup");
      return null;
    }
  };

  const deleteStartup = async (id: string): Promise<boolean> => {
    if (!session?.user?.id) return false;

    try {
      const response = await fetch(`/api/startups/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete startup");
      }

      await fetchStartups(); // Refresh the list
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete startup");
      return false;
    }
  };

  const getStartup = async (id: string): Promise<Startup | null> => {
    if (!session?.user?.id) return null;

    try {
      const response = await fetch(`/api/startups/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch startup");
      }

      const data = await response.json();
      return data.startup;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch startup");
      return null;
    }
  };

  useEffect(() => {
    fetchStartups();
  }, [fetchStartups]);

  return {
    startups,
    isLoading,
    error,
    pagination,
    refetch: fetchStartups,
    createStartup,
    updateStartup,
    deleteStartup,
    getStartup,
  };
}

// Hook for managing business plans
export function useBusinessPlan(startupId: string) {
  const { data: session } = useSession();
  const [businessPlan, setBusinessPlan] = useState<BusinessPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBusinessPlan = useCallback(async () => {
    if (!session?.user?.id || !startupId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/startups/${startupId}/business-plan`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch business plan");
      }

      const data = await response.json();
      setBusinessPlan(data.businessPlan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, startupId]);

  const createBusinessPlan = async (data: BusinessPlanData): Promise<boolean> => {
    if (!session?.user?.id) return false;

    try {
      const response = await fetch(`/api/startups/${startupId}/business-plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create business plan");
      }

      await fetchBusinessPlan(); // Refresh the business plan
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create business plan");
      return false;
    }
  };

  const updateBusinessPlan = async (data: BusinessPlanData): Promise<boolean> => {
    if (!session?.user?.id) return false;

    try {
      const response = await fetch(`/api/startups/${startupId}/business-plan`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update business plan");
      }

      await fetchBusinessPlan(); // Refresh the business plan
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update business plan");
      return false;
    }
  };

  useEffect(() => {
    fetchBusinessPlan();
  }, [fetchBusinessPlan]);

  return {
    businessPlan,
    isLoading,
    error,
    refetch: fetchBusinessPlan,
    createBusinessPlan,
    updateBusinessPlan,
  };
}
