"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Company } from "@/types/company";

interface CompaniesFilters {
  page?: number;
  limit?: number;
  search?: string;
  industry?: string;
  size?: string;
  location?: string;
  isVerified?: boolean;
  isFeatured?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface CompaniesResponse {
  companies: Company[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function useCompanies(filters: CompaniesFilters = {}) {

  const query = useQuery({
    queryKey: ["companies", filters],
    queryFn: async (): Promise<CompaniesResponse> => {
      const params = new URLSearchParams();
      
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.search) params.append("search", filters.search);
      if (filters.industry) params.append("industry", filters.industry);
      if (filters.size) params.append("size", filters.size);
      if (filters.location) params.append("location", filters.location);
      if (filters.isVerified !== undefined) params.append("isVerified", filters.isVerified.toString());
      if (filters.isFeatured !== undefined) params.append("isFeatured", filters.isFeatured.toString());
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

      const response = await fetch(`/api/companies?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch companies");
      }
      return response.json();
    },
  });

  return query;
}

export function useCompany(id: string) {
  return useQuery({
    queryKey: ["company", id],
    queryFn: async (): Promise<Company> => {
      const response = await fetch(`/api/companies/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch company");
      }
      return response.json();
    },
    enabled: !!id,
  });
}

export function useCompanyByUser(userId: string) {
  return useQuery({
    queryKey: ["company", "by-user", userId],
    queryFn: async (): Promise<Company> => {
      const response = await fetch(`/api/companies/by-user/${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch company by user");
      }
      return response.json();
    },
    enabled: !!userId,
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Company>): Promise<Company> => {
      const response = await fetch("/api/companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create company");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      data 
    }: { 
      id: string; 
      data: Partial<Company> 
    }): Promise<Company> => {
      const response = await fetch(`/api/companies/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update company");
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["company", data.id] });
    },
  });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/companies/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete company");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
}

export function useFeaturedCompanies() {
  return useQuery({
    queryKey: ["companies", "featured"],
    queryFn: async (): Promise<CompaniesResponse> => {
      const response = await fetch("/api/companies?isFeatured=true&limit=6");
      if (!response.ok) {
        throw new Error("Failed to fetch featured companies");
      }
      return response.json();
    },
  });
}

export function useCompanyStats() {
  return useQuery({
    queryKey: ["companies", "stats"],
    queryFn: async () => {
      const response = await fetch("/api/companies/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch company stats");
      }
      return response.json();
    },
  });
}
