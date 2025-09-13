"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

export interface Certificate {
  id: string;
  type: "course" | "module";
  certificateUrl: string;
  issuedAt: string;
  student: {
    id: string;
    name: string;
    email: string;
  };
  course: {
    id: string;
    title: string;
    instructor?: {
      id: string;
      name: string;
    };
  };
  module?: {
    id: string;
    title: string;
  };
}

interface UseCertificatesReturn {
  certificates: Certificate[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  generateCertificate: (courseId?: string, moduleId?: string, studentId?: string) => Promise<Certificate | null>;
  downloadCertificate: (certificateId: string) => Promise<boolean>;
}

interface CertificateFilters {
  type?: "course" | "module";
  page?: number;
  limit?: number;
}

export function useCertificates(filters?: CertificateFilters): UseCertificatesReturn {
  const { data: session } = useSession();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCertificates = useCallback(async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters?.type) params.append("type", filters.type);
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());

      const response = await fetch(`/api/certificates?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch certificates");
      }

      const data = await response.json();
      setCertificates(data.certificates || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, filters?.type, filters?.page, filters?.limit]);

  const generateCertificate = async (
    courseId?: string, 
    moduleId?: string, 
    studentId?: string
  ): Promise<Certificate | null> => {
    if (!session?.user?.id) return null;

    try {
      const response = await fetch("/api/certificates/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId,
          moduleId,
          studentId: studentId || session.user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate certificate");
      }

      const data = await response.json();
      
      // Add new certificate to the list
      setCertificates(prev => [data.certificate, ...prev]);
      
      return data.certificate;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate certificate");
      return null;
    }
  };

  const downloadCertificate = async (certificateId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/certificates/${certificateId}/download`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to download certificate");
      }

      // If the response is a redirect, follow it
      if (response.redirected) {
        window.open(response.url, '_blank');
        return true;
      }

      // If it's a file download, trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-${certificateId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to download certificate");
      return false;
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  return {
    certificates,
    isLoading,
    error,
    refetch: fetchCertificates,
    generateCertificate,
    downloadCertificate,
  };
}

// Hook for individual certificate management
export function useCertificate(certificateId: string) {
  const { data: session } = useSession();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCertificate = useCallback(async () => {
    if (!session?.user?.id || !certificateId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/certificates/${certificateId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch certificate");
      }

      const data = await response.json();
      setCertificate(data.certificate);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, certificateId]);

  const downloadCertificate = async (): Promise<boolean> => {
    if (!certificateId) return false;

    try {
      const response = await fetch(`/api/certificates/${certificateId}/download`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to download certificate");
      }

      // Handle download
      if (response.redirected) {
        window.open(response.url, '_blank');
        return true;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-${certificateId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to download certificate");
      return false;
    }
  };

  useEffect(() => {
    fetchCertificate();
  }, [fetchCertificate]);

  return {
    certificate,
    isLoading,
    error,
    refetch: fetchCertificate,
    downloadCertificate,
  };
}
