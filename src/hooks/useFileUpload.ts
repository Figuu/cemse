"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";

interface FileUploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

export function useFileUpload() {
  const { data: session } = useSession();
  const [state, setState] = useState<FileUploadState>({
    isUploading: false,
    progress: 0,
    error: null,
  });

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    setState({
      isUploading: true,
      progress: 0,
      error: null,
    });

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("contentType", file.type);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const result = await response.json();
      
      setState({
        isUploading: false,
        progress: 100,
        error: null,
      });

      return result.url;

    } catch (error) {
      setState({
        isUploading: false,
        progress: 0,
        error: error instanceof Error ? error.message : "Upload failed",
      });
      throw error;
    }
  }, [session?.user?.id]);

  const reset = useCallback(() => {
    setState({
      isUploading: false,
      progress: 0,
      error: null,
    });
  }, []);

  return {
    ...state,
    uploadFile,
    reset,
  };
}
