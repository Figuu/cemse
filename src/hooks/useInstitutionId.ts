"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface UseInstitutionIdReturn {
  institutionId: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useInstitutionId(): UseInstitutionIdReturn {
  const { data: session } = useSession();
  const [institutionId, setInstitutionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInstitutionId = async () => {
      if (!session?.user?.id || session.user.role !== "INSTITUTION") {
        setInstitutionId(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/institutions/by-user/${session.user.id}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch institution data");
        }

        const data = await response.json();
        
        if (data.institution?.id) {
          setInstitutionId(data.institution.id);
        } else {
          setInstitutionId(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setInstitutionId(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInstitutionId();
  }, [session?.user?.id, session?.user?.role]);

  return {
    institutionId,
    isLoading,
    error,
  };
}
