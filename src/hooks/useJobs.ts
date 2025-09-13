"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { JobPosting, JobApplication } from "@/types/company";

interface JobsFilters {
  companyId?: string;
  page?: number;
  limit?: number;
  search?: string;
  employmentType?: string;
  experienceLevel?: string;
  location?: string;
  isActive?: boolean;
  isUrgent?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface JobsResponse {
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

interface ApplicationsFilters {
  companyId?: string;
  jobId?: string;
  page?: number;
  limit?: number;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface ApplicationsResponse {
  applications: JobApplication[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function useJobs(filters: JobsFilters = {}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["jobs", filters],
    queryFn: async (): Promise<JobsResponse> => {
      const params = new URLSearchParams();
      
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.search) params.append("search", filters.search);
      if (filters.employmentType) params.append("employmentType", filters.employmentType);
      if (filters.experienceLevel) params.append("experienceLevel", filters.experienceLevel);
      if (filters.location) params.append("location", filters.location);
      if (filters.isActive !== undefined) params.append("isActive", filters.isActive.toString());
      if (filters.isUrgent !== undefined) params.append("isUrgent", filters.isUrgent.toString());
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

      const url = filters.companyId 
        ? `/api/companies/${filters.companyId}/jobs?${params.toString()}`
        : `/api/jobs?${params.toString()}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }
      return response.json();
    },
  });

  return query;
}

export function useJob(companyId: string, jobId: string) {
  return useQuery({
    queryKey: ["job", companyId, jobId],
    queryFn: async (): Promise<JobPosting> => {
      const response = await fetch(`/api/companies/${companyId}/jobs/${jobId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch job");
      }
      return response.json();
    },
    enabled: !!companyId && !!jobId,
  });
}

export function useCreateJob(companyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<JobPosting>): Promise<JobPosting> => {
      const response = await fetch(`/api/companies/${companyId}/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create job");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["company", companyId] });
    },
  });
}

export function useUpdateJob(companyId: string, jobId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<JobPosting>): Promise<JobPosting> => {
      const response = await fetch(`/api/companies/${companyId}/jobs/${jobId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update job");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["job", companyId, jobId] });
      queryClient.invalidateQueries({ queryKey: ["company", companyId] });
    },
  });
}

export function useDeleteJob(companyId: string, jobId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      const response = await fetch(`/api/companies/${companyId}/jobs/${jobId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete job");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["company", companyId] });
    },
  });
}

export function useJobApplications(filters: ApplicationsFilters = {}) {
  const query = useQuery({
    queryKey: ["job-applications", filters],
    queryFn: async (): Promise<ApplicationsResponse> => {
      const params = new URLSearchParams();
      
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.status) params.append("status", filters.status);
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

      const url = filters.companyId && filters.jobId
        ? `/api/companies/${filters.companyId}/jobs/${filters.jobId}/applications?${params.toString()}`
        : `/api/applications?${params.toString()}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch applications");
      }
      return response.json();
    },
  });

  return query;
}

export function useJobApplication(companyId: string, jobId: string, applicationId: string) {
  return useQuery({
    queryKey: ["job-application", companyId, jobId, applicationId],
    queryFn: async (): Promise<JobApplication> => {
      const response = await fetch(`/api/companies/${companyId}/jobs/${jobId}/applications/${applicationId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch application");
      }
      return response.json();
    },
    enabled: !!companyId && !!jobId && !!applicationId,
  });
}

export function useCreateJobApplication(companyId: string, jobId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<JobApplication>): Promise<JobApplication> => {
      const response = await fetch(`/api/companies/${companyId}/jobs/${jobId}/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create application");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-applications"] });
      queryClient.invalidateQueries({ queryKey: ["job", companyId, jobId] });
      queryClient.invalidateQueries({ queryKey: ["company", companyId] });
    },
  });
}

export function useUpdateJobApplication(companyId: string, jobId: string, applicationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<JobApplication>): Promise<JobApplication> => {
      const response = await fetch(`/api/companies/${companyId}/jobs/${jobId}/applications/${applicationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update application");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-applications"] });
      queryClient.invalidateQueries({ queryKey: ["job-application", companyId, jobId, applicationId] });
      queryClient.invalidateQueries({ queryKey: ["job", companyId, jobId] });
    },
  });
}

export function useDeleteJobApplication(companyId: string, jobId: string, applicationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      const response = await fetch(`/api/companies/${companyId}/jobs/${jobId}/applications/${applicationId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete application");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-applications"] });
      queryClient.invalidateQueries({ queryKey: ["job", companyId, jobId] });
      queryClient.invalidateQueries({ queryKey: ["company", companyId] });
    },
  });
}

export function useJobLike(companyId: string, jobId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["job-like", companyId, jobId],
    queryFn: async (): Promise<{ liked: boolean }> => {
      const response = await fetch(`/api/companies/${companyId}/jobs/${jobId}/like`);
      if (!response.ok) {
        throw new Error("Failed to check job like");
      }
      return response.json();
    },
    enabled: !!companyId && !!jobId,
  });

  const mutation = useMutation({
    mutationFn: async (): Promise<{ liked: boolean }> => {
      const response = await fetch(`/api/companies/${companyId}/jobs/${jobId}/like`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to toggle job like");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-like", companyId, jobId] });
      queryClient.invalidateQueries({ queryKey: ["job", companyId, jobId] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });

  return {
    ...query,
    toggleLike: mutation.mutate,
    isToggling: mutation.isPending,
  };
}

export function useJobShare(companyId: string, jobId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      const response = await fetch(`/api/companies/${companyId}/jobs/${jobId}/share`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to share job");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job", companyId, jobId] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}