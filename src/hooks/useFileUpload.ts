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

  const uploadFile = useCallback(async (file: File, context?: string): Promise<string> => {
    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    setState({
      isUploading: true,
      progress: 0,
      error: null,
    });

    try {
      // Determine category based on file type and context
      let category = "other";
      if (file.type.startsWith("video/")) {
        category = context === "news" ? "news-video" : "course-video";
      } else if (file.type.startsWith("audio/")) {
        category = "course-audio";
      } else if (file.type.startsWith("image/")) {
        category = context === "news" ? "news-image" : "course-thumbnail";
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);

      const response = await fetch("/api/files/minio/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const result = await response.json();
      
      if (result.success && result.file) {
        setState({
          isUploading: false,
          progress: 100,
          error: null,
        });

        return result.file.url; // Return the proxy URL
      } else {
        throw new Error("Invalid response format");
      }

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
