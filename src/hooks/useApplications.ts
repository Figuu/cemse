"use client";

import { useCallback } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface ApplicationCommunication {
  id: string;
  type: "email" | "phone" | "meeting" | "message" | "note";
  direction: "inbound" | "outbound";
  subject?: string;
  content: string;
  sender: {
    id: string;
    name: string;
    email?: string;
    role: "applicant" | "recruiter" | "hiring_manager" | "hr";
  };
  recipient: {
    id: string;
    name: string;
    email?: string;
    role: "applicant" | "recruiter" | "hiring_manager" | "hr";
  };
  timestamp: string;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  isRead: boolean;
  priority?: "low" | "medium" | "high";
}

interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  companyLogo?: string;
  location: string;
  appliedDate: string;
  status: "applied" | "reviewing" | "shortlisted" | "interview" | "offered" | "rejected" | "withdrawn";
  priority: "low" | "medium" | "high";
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  jobType: "full-time" | "part-time" | "contract" | "internship";
  remote: boolean;
  experience: string;
  skills: string[];
  notes?: string;
  nextSteps?: string;
  interviewDate?: string;
  rejectionReason?: string;
  offerDetails?: {
    salary: number;
    startDate: string;
    benefits: string[];
  };
  timeline: ApplicationTimelineEvent[];
  lastUpdated: string;
  daysSinceApplied: number;
  responseTime: number | null;
  coverLetter?: string;
  documents?: string[];
  communication?: ApplicationCommunication[];
}

interface ApplicationTimelineEvent {
  id: string;
  type: "applied" | "reviewed" | "shortlisted" | "interview_scheduled" | "interview_completed" | "offered" | "rejected" | "withdrawn";
  title: string;
  description: string;
  date: string;
  status: "completed" | "pending" | "cancelled";
}

interface UseApplicationsReturn {
  applications: JobApplication[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createApplication: (data: CreateApplicationData) => Promise<void>;
  updateApplication: (id: string, data: Partial<JobApplication>) => Promise<void>;
  deleteApplication: (id: string) => Promise<void>;
}

interface CreateApplicationData {
  jobId: string;
  coverLetter?: string;
  notes?: string;
  cvFile?: string;
  coverLetterFile?: string;
  resumeUrl?: string;
  additionalDocuments?: string[];
}

export function useApplications(filters?: {
  status?: string;
  priority?: string;
  search?: string;
}): UseApplicationsReturn {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["applications", filters],
    queryFn: async (): Promise<{ applications: JobApplication[] }> => {
      if (!session?.user?.id) {
        throw new Error("User not authenticated");
      }

      const params = new URLSearchParams();
      if (filters?.status) params.append("status", filters.status);
      if (filters?.priority) params.append("priority", filters.priority);
      if (filters?.search) params.append("search", filters.search);

      const response = await fetch(`/api/applications?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch applications");
      }

      return response.json();
    },
    enabled: !!session?.user?.id,
  });

  const createApplicationMutation = useMutation({
    mutationFn: async (data: CreateApplicationData): Promise<void> => {
      if (!session?.user?.id) {
        throw new Error("User not authenticated");
      }

      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create application");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });

  const updateApplicationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<JobApplication> }): Promise<void> => {
      if (!session?.user?.id) {
        throw new Error("User not authenticated");
      }

      const response = await fetch(`/api/applications/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update application");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });

  const deleteApplicationMutation = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      if (!session?.user?.id) {
        throw new Error("User not authenticated");
      }

      const response = await fetch(`/api/applications/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete application");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });

  const createApplication = useCallback(async (data: CreateApplicationData) => {
    return createApplicationMutation.mutateAsync(data);
  }, [createApplicationMutation]);

  const updateApplication = useCallback(async (id: string, data: Partial<JobApplication>) => {
    return updateApplicationMutation.mutateAsync({ id, data });
  }, [updateApplicationMutation]);

  const deleteApplication = useCallback(async (id: string) => {
    return deleteApplicationMutation.mutateAsync(id);
  }, [deleteApplicationMutation]);

  return {
    applications: query.data?.applications || [],
    isLoading: query.isLoading,
    error: query.error?.message || null,
    refetch: async () => { await query.refetch(); },
    createApplication,
    updateApplication,
    deleteApplication,
  };
}
