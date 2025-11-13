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

  const downloadCertificate = async () => {
    const certificateUrl = certificateQuery.data?.certificateUrl;
    if (!certificateUrl) return;

    try {
      // Check if this is a MinIO direct URL (e.g., http://localhost:9000/...)
      // If so, we need to fetch it server-side through our proxy
      const isMinIODirectUrl = certificateUrl.includes('localhost:9000') || certificateUrl.includes(':9000/');

      let downloadUrl: string;

      if (isMinIODirectUrl) {
        // For MinIO direct URLs, we need to use the server-side download endpoint
        // First, get the certificate ID from the API
        const response = await fetch(`/api/courses/${courseId}/certificate`);
        const data = await response.json();

        // Check if we have a certificate record - we'll need to regenerate if the URL is bad
        console.warn('Certificate URL is a direct MinIO URL, should use proxy URL instead');

        // For now, just use the URL as-is but convert to proxy format
        // Extract bucket and key from MinIO URL if possible
        const urlParts = certificateUrl.match(/https?:\/\/[^\/]+\/([^\/]+)\/(.+)/);
        if (urlParts) {
          const bucket = urlParts[1];
          const key = urlParts[2];
          downloadUrl = `/api/images/proxy?bucket=${encodeURIComponent(bucket)}&key=${encodeURIComponent(key)}&download=true`;
        } else {
          // Fallback: try to download directly
          downloadUrl = certificateUrl;
        }
      } else {
        // For proxy URLs, just add the download parameter
        downloadUrl = certificateUrl.includes('?')
          ? `${certificateUrl}&download=true`
          : `${certificateUrl}?download=true`;
      }

      // Create a temporary anchor element and trigger download
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `certificado-${courseId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading certificate:', error);
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


