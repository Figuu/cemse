"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface JobApplicationStatus {
  hasApplied: boolean;
  applicationId?: string;
  status?: string;
}

export function useJobApplicationStatus(jobIds: string[]) {
  const { data: session } = useSession();
  const [applicationStatuses, setApplicationStatuses] = useState<Record<string, JobApplicationStatus>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user?.id || jobIds.length === 0) {
      setApplicationStatuses({});
      return;
    }

    const fetchApplicationStatuses = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Check each job individually
        const statusPromises = jobIds.map(async (jobId) => {
          try {
            const response = await fetch(`/api/applications/check-status?jobId=${jobId}`);
            if (response.ok) {
              const data = await response.json();
              return { jobId, ...data };
            } else {
              return { jobId, hasApplied: false };
            }
          } catch {
            return { jobId, hasApplied: false };
          }
        });

        const results = await Promise.all(statusPromises);
        const statusMap: Record<string, JobApplicationStatus> = {};
        
        results.forEach(({ jobId, hasApplied, applicationId, status }) => {
          statusMap[jobId] = { hasApplied, applicationId, status };
        });

        setApplicationStatuses(statusMap);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch application statuses");
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplicationStatuses();
  }, [session?.user?.id, jobIds.join(",")]);

  const getApplicationStatus = (jobId: string): JobApplicationStatus => {
    return applicationStatuses[jobId] || { hasApplied: false };
  };

  return {
    getApplicationStatus,
    isLoading,
    error,
  };
}
