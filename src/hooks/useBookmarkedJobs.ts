"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { JobPosting } from "@/types/company";

interface BookmarkedJobsResponse {
  jobs: JobPosting[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface BookmarkFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export function useBookmarkedJobs(filters: BookmarkFilters = {}) {
  return useQuery({
    queryKey: ["bookmarked-jobs", filters],
    queryFn: async (): Promise<BookmarkedJobsResponse> => {
      const params = new URLSearchParams();
      
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.search) params.append("search", filters.search);
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

      const response = await fetch(`/api/jobs/bookmarked?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch bookmarked jobs");
      }
      return response.json();
    },
  });
}

export function useToggleJobBookmark(companyId: string, jobId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<{ bookmarked: boolean }> => {
      const response = await fetch(`/api/companies/${companyId}/jobs/${jobId}/bookmark`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to toggle job bookmark");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarked-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["job", companyId, jobId] });
    },
  });
}

export function useJobBookmarkStatus(companyId: string, jobId: string) {
  return useQuery({
    queryKey: ["job-bookmark-status", companyId, jobId],
    queryFn: async (): Promise<{ bookmarked: boolean }> => {
      const response = await fetch(`/api/companies/${companyId}/jobs/${jobId}/bookmark`);
      if (!response.ok) {
        throw new Error("Failed to check job bookmark status");
      }
      return response.json();
    },
    enabled: !!companyId && !!jobId,
  });
}
