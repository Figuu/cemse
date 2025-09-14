"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";

interface ChunkedUploadOptions {
  chunkSize?: number; // in bytes, default 1MB
  maxRetries?: number; // default 3
  onProgress?: (progress: number) => void;
  onChunkComplete?: (chunkIndex: number, totalChunks: number) => void;
}

interface ChunkedUploadState {
  isUploading: boolean;
  progress: number;
  currentChunk: number;
  totalChunks: number;
  error: string | null;
  uploadedChunks: Set<number>;
}

export function useChunkedUpload(options: ChunkedUploadOptions = {}) {
  const { data: session } = useSession();
  const {
    chunkSize = 1024 * 1024, // 1MB chunks
    maxRetries = 3,
    onProgress,
    onChunkComplete
  } = options;

  const [state, setState] = useState<ChunkedUploadState>({
    isUploading: false,
    progress: 0,
    currentChunk: 0,
    totalChunks: 0,
    error: null,
    uploadedChunks: new Set()
  });

  const uploadFile = useCallback(async (
    file: File,
    category: string,
    onComplete?: (fileUrl: string) => void
  ) => {
    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    const totalChunks = Math.ceil(file.size / chunkSize);
    const uploadId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    setState({
      isUploading: true,
      progress: 0,
      currentChunk: 0,
      totalChunks,
      error: null,
      uploadedChunks: new Set()
    });

    try {
      // Upload chunks
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);

        let retries = 0;
        let chunkUploaded = false;

        while (retries < maxRetries && !chunkUploaded) {
          try {
            const formData = new FormData();
            formData.append("file", chunk);
            formData.append("category", category);
            formData.append("userId", session.user.id);
            formData.append("uploadId", uploadId);
            formData.append("chunkIndex", chunkIndex.toString());
            formData.append("totalChunks", totalChunks.toString());
            formData.append("originalName", file.name);
            formData.append("originalSize", file.size.toString());

            const response = await fetch("/api/files/chunked-upload", {
              method: "POST",
              body: formData,
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || "Chunk upload failed");
            }

            chunkUploaded = true;
            setState(prev => ({
              ...prev,
              currentChunk: chunkIndex + 1,
              uploadedChunks: new Set([...prev.uploadedChunks, chunkIndex])
            }));

            const progress = ((chunkIndex + 1) / totalChunks) * 100;
            setState(prev => ({ ...prev, progress }));
            onProgress?.(progress);
            onChunkComplete?.(chunkIndex + 1, totalChunks);

          } catch (error) {
            retries++;
            if (retries >= maxRetries) {
              throw new Error(`Failed to upload chunk ${chunkIndex} after ${maxRetries} retries: ${error}`);
            }
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
          }
        }
      }

      // Finalize upload
      const finalizeResponse = await fetch("/api/files/finalize-upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uploadId,
          userId: session.user.id,
          category,
          originalName: file.name,
          originalSize: file.size,
          totalChunks
        }),
      });

      if (!finalizeResponse.ok) {
        const errorData = await finalizeResponse.json();
        throw new Error(errorData.error || "Failed to finalize upload");
      }

      const result = await finalizeResponse.json();
      onComplete?.(result.fileUrl);

      setState(prev => ({
        ...prev,
        isUploading: false,
        progress: 100
      }));

      return result;

    } catch (error) {
      setState(prev => ({
        ...prev,
        isUploading: false,
        error: error instanceof Error ? error.message : "Upload failed"
      }));
      throw error;
    }
  }, [session?.user?.id, chunkSize, maxRetries, onProgress, onChunkComplete]);

  const reset = useCallback(() => {
    setState({
      isUploading: false,
      progress: 0,
      currentChunk: 0,
      totalChunks: 0,
      error: null,
      uploadedChunks: new Set()
    });
  }, []);

  return {
    ...state,
    uploadFile,
    reset
  };
}
