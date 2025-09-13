"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

interface ProfileFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
  category: "profile-picture" | "cv" | "certificate" | "other";
  status: "active" | "pending" | "rejected";
}

interface UseProfileFilesReturn {
  files: ProfileFile[];
  isLoading: boolean;
  error: string | null;
  uploadFile: (file: File, category: string) => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;
  viewFile: (fileId: string) => void;
  refetch: () => Promise<void>;
}

export function useProfileFiles(): UseProfileFilesReturn {
  const { data: session } = useSession();
  const [files, setFiles] = useState<ProfileFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = useCallback(async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/files?userId=${session.user.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch files");
      }

      const data = await response.json();
      const filesWithDates = data.files.map((file: {
        id: string;
        name: string;
        type: string;
        size: number;
        url: string;
        uploadedAt: string;
        category: string;
        status: string;
      }) => ({
        ...file,
        uploadedAt: new Date(file.uploadedAt)
      }));
      setFiles(filesWithDates);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  const uploadFile = async (file: File, category: string) => {
    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);
      formData.append("userId", session.user.id);

      const response = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload file");
      }

      const data = await response.json();
      const newFile: ProfileFile = {
        ...data.file,
        uploadedAt: new Date(data.file.uploadedAt)
      };

      setFiles(prev => [...prev, newFile]);

      // If this is a profile picture, update the user's avatar
      if (category === "profile-picture") {
        try {
          await fetch("/api/profiles", {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              avatarUrl: data.file.url,
            }),
          });
        } catch (avatarError) {
          console.warn("Failed to update avatar:", avatarError);
          // Don't throw here as the file upload was successful
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFile = async (fileId: string) => {
    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/files/upload?fileId=${fileId}&userId=${session.user.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete file");
      }

      setFiles(prev => prev.filter(file => file.id !== fileId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const viewFile = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (file) {
      window.open(file.url, '_blank');
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  return {
    files,
    isLoading,
    error,
    uploadFile,
    deleteFile,
    viewFile,
    refetch: fetchFiles
  };
}
