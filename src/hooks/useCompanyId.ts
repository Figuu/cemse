"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface UseCompanyIdReturn {
  companyId: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useCompanyId(): UseCompanyIdReturn {
  const { data: session } = useSession();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanyId = async () => {
      if (!session?.user?.id || session.user.role !== "COMPANIES") {
        setCompanyId(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/company/stats");
        
        if (!response.ok) {
          throw new Error("Failed to fetch company data");
        }

        const data = await response.json();
        
        // Extract company ID from the stats response
        // We need to get the company ID from the company stats API
        // For now, we'll use a separate API call to get the company ID
        const companyResponse = await fetch("/api/company/info");
        
        if (!companyResponse.ok) {
          throw new Error("Failed to fetch company info");
        }

        const companyData = await companyResponse.json();
        setCompanyId(companyData.company?.id || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setCompanyId(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyId();
  }, [session?.user?.id, session?.user?.role]);

  return {
    companyId,
    isLoading,
    error,
  };
}
