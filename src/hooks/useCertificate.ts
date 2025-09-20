import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface CertificateStatus {
  hasCertificate: boolean;
  certificateUrl?: string;
  isCompleted: boolean;
  hasCertification: boolean;
}

interface GenerateCertificateResponse {
  success: boolean;
  certificateUrl?: string;
  message?: string;
  error?: string;
}

export function useCertificate(courseId: string) {
  const queryClient = useQueryClient();

  // Query to check certificate status
  const certificateQuery = useQuery<CertificateStatus>({
    queryKey: ["certificate", courseId],
    queryFn: async () => {
      const response = await fetch(`/api/courses/${courseId}/certificate`);
      if (!response.ok) {
        throw new Error("Failed to fetch certificate status");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation to generate certificate
  const generateCertificateMutation = useMutation<GenerateCertificateResponse, Error>({
    mutationFn: async () => {
      const response = await fetch(`/api/courses/${courseId}/certificate`, {
        method: "POST",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate certificate");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate and refetch certificate status
      queryClient.invalidateQueries({ queryKey: ["certificate", courseId] });
      
      // If certificate was generated successfully, update the cache
      if (data.success && data.certificateUrl) {
        queryClient.setQueryData(["certificate", courseId], (old: CertificateStatus) => ({
          ...old,
          hasCertificate: true,
          certificateUrl: data.certificateUrl,
        }));
      }
    },
  });

  const generateCertificate = () => {
    generateCertificateMutation.mutate();
  };

  const downloadCertificate = () => {
    const certificateUrl = certificateQuery.data?.certificateUrl;
    if (certificateUrl) {
      window.open(certificateUrl, "_blank");
    }
  };

  return {
    // Certificate status
    hasCertificate: certificateQuery.data?.hasCertificate || false,
    certificateUrl: certificateQuery.data?.certificateUrl,
    isCompleted: certificateQuery.data?.isCompleted || false,
    hasCertification: certificateQuery.data?.hasCertification || false,
    
    // Loading states
    isLoading: certificateQuery.isLoading,
    isGenerating: generateCertificateMutation.isPending,
    
    // Error states
    error: certificateQuery.error || generateCertificateMutation.error,
    
    // Actions
    generateCertificate,
    downloadCertificate,
    
    // Refetch function
    refetch: certificateQuery.refetch,
  };
}


