"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

export interface Job {
  id: string;
  title: string;
  company: {
    name: string;
    logo: string;
    location: string;
  };
  location: string;
  type: "full-time" | "part-time" | "contract" | "internship";
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  description: string;
  requirements: string[];
  benefits: string[];
  postedAt: Date;
  deadline: Date;
  isBookmarked: boolean;
  isApplied: boolean;
  experience: string;
  education: string;
  skills: string[];
  remote: boolean;
  urgent: boolean;
}

interface UseJobsReturn {
  jobs: Job[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  bookmarkJob: (jobId: string) => Promise<void>;
  unbookmarkJob: (jobId: string) => Promise<void>;
  applyToJob: (jobId: string, data: { coverLetter?: string; resumeUrl?: string; additionalDocuments?: string[] }) => Promise<void>;
}

interface JobFilters {
  search?: string;
  location?: string;
  type?: string;
  experience?: string;
  salary?: string;
  remote?: string;
  skills?: string[];
  sortBy?: string;
}

export function useJobs(filters?: JobFilters): UseJobsReturn {
  const { data: session } = useSession();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append("search", filters.search);
      if (filters?.location) params.append("location", filters.location);
      if (filters?.type) params.append("type", filters.type);
      if (filters?.experience) params.append("experience", filters.experience);
      if (filters?.salary) params.append("salary", filters.salary);
      if (filters?.remote) params.append("remote", filters.remote);
      if (filters?.skills && filters.skills.length > 0) {
        params.append("skills", filters.skills.join(","));
      }
      if (filters?.sortBy) params.append("sortBy", filters.sortBy);

      const response = await fetch(`/api/jobs?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch jobs");
      }

      const data = await response.json();
      setJobs(data.jobs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, filters?.search, filters?.location, filters?.type, filters?.experience, filters?.salary, filters?.remote, filters?.skills, filters?.sortBy]);

  const bookmarkJob = async (jobId: string) => {
    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    try {
      const response = await fetch(`/api/jobs/${jobId}/bookmark`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to bookmark job");
      }

      // Update local state
      setJobs(prev => prev.map(job => 
        job.id === jobId ? { ...job, isBookmarked: true } : job
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to bookmark job");
      throw err;
    }
  };

  const unbookmarkJob = async (jobId: string) => {
    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    try {
      const response = await fetch(`/api/jobs/${jobId}/bookmark`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to unbookmark job");
      }

      // Update local state
      setJobs(prev => prev.map(job => 
        job.id === jobId ? { ...job, isBookmarked: false } : job
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unbookmark job");
      throw err;
    }
  };

  const applyToJob = async (jobId: string, data: { coverLetter?: string; resumeUrl?: string; additionalDocuments?: string[] }) => {
    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId,
          ...data,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to apply to job");
      }

      // Update local state
      setJobs(prev => prev.map(job => 
        job.id === jobId ? { ...job, isApplied: true } : job
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to apply to job");
      throw err;
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return {
    jobs,
    isLoading,
    error,
    refetch: fetchJobs,
    bookmarkJob,
    unbookmarkJob,
    applyToJob,
  };
}
