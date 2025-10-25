"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

interface CompanyApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  companyLogo?: string;
  applicant: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    phone?: string;
    location: string;
    educationLevel?: string;
    experienceLevel?: string;
    skills: any[];
  };
  appliedDate: string;
  status: "pending" | "reviewing" | "shortlisted" | "hired" | "rejected";
  coverLetter?: string;
  notes?: string;
  reviewedAt?: string;
  decisionReason?: string;
  daysSinceApplied: number;
}

interface UseCompanyApplicationsReturn {
  applications: CompanyApplication[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCompanyApplications(limit: number = 10): UseCompanyApplicationsReturn {
  const { data: session } = useSession();
  const [applications, setApplications] = useState<CompanyApplication[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/company/applications?limit=${limit}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch applications");
      }

      const data = await response.json();
      setApplications(data.applications || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, limit]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return {
    applications,
    isLoading,
    error,
    refetch: fetchApplications,
  };
}
