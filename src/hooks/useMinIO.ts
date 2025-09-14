"use client";

import { useState, useCallback } from "react";
import { minioClient } from "@/lib/minioClientService";

// Helper function to determine file type from filename
function getFileType(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase();
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  const videoTypes = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
  const audioTypes = ['mp3', 'wav', 'flac', 'aac', 'ogg'];
  const documentTypes = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
  
  if (imageTypes.includes(extension || '')) return 'image';
  if (videoTypes.includes(extension || '')) return 'video';
  if (audioTypes.includes(extension || '')) return 'audio';
  if (documentTypes.includes(extension || '')) return 'document';
  return 'file';
}

interface MinIOFile {
  url: string;
  bucket: string;
  key: string;
  originalName: string;
  size: number;
  type: string;
}

interface MinIOStats {
  buckets?: Record<string, { size: number; fileCount: number }>;
  totalSize?: number;
  totalFiles?: number;
  bucket?: string;
  size?: number;
  fileCount?: number;
  files?: Array<{
    name: string;
    size: number;
    lastModified: string;
    etag: string;
  }>;
}

export function useMinIO() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (
    file: File,
    bucket?: string,
    fileName?: string
  ): Promise<MinIOFile | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (bucket) formData.append("bucket", bucket);
      if (fileName) formData.append("fileName", fileName);

      const response = await fetch("/api/files/minio", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload file");
      }

      const data = await response.json();
      return data.file;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const uploadFileFromUrl = useCallback(async (
    url: string,
    fileName: string,
    contentType: string,
    bucket?: string
  ): Promise<MinIOFile | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/files/minio/upload-from-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, fileName, contentType, bucket }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload file from URL");
      }

      const data = await response.json();
      return data.file;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const listFiles = useCallback(async (
    bucket: string
  ): Promise<MinIOFile[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const objects = await minioClient.listObjects(bucket);
      
      // Convert MinIOObject to MinIOFile format
      const files: MinIOFile[] = objects
        .filter(obj => !obj.isDir) // Filter out directories
        .map(obj => ({
          url: minioClient.getObjectUrl(bucket, obj.name),
          bucket,
          key: obj.name,
          originalName: obj.name.split('/').pop() || obj.name,
          size: obj.size,
          type: getFileType(obj.name)
        }));

      return files;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to list files";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteFile = useCallback(async (
    bucket: string,
    key: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await minioClient.deleteObject(bucket, key);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Delete failed";
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPresignedUrl = useCallback(async (
    bucket: string,
    key: string,
    expiry?: number,
    operation: "get" | "upload" = "get"
  ): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/files/minio/presigned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bucket, key, expiry, operation }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate presigned URL");
      }

      const data = await response.json();
      return data.presignedUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate URL";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getStats = useCallback(async (
    bucket?: string
  ): Promise<MinIOStats | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (bucket) params.append("bucket", bucket);

      const response = await fetch(`/api/files/minio/stats?${params}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get statistics");
      }

      const data = await response.json();
      return data.stats;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to get statistics";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    uploadFile,
    uploadFileFromUrl,
    listFiles,
    deleteFile,
    getPresignedUrl,
    getStats,
    isLoading,
    error,
    clearError,
  };
}
