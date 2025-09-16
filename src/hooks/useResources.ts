"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

interface Resource {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  format: string;
  downloadUrl?: string;
  externalUrl?: string;
  thumbnail: string;
  author: string;
  publishedDate: string;
  downloads: number;
  rating: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  isEntrepreneurshipRelated: boolean;
  createdByUserId: string;
  status: string;
  createdBy: {
    firstName?: string;
    lastName?: string;
  };
}

interface UseResourcesOptions {
  search?: string;
  category?: string;
  type?: string;
  status?: string;
  authorId?: string;
  limit?: number;
  offset?: number;
}

export function useResources(options: UseResourcesOptions = {}) {
  const { data: session } = useSession();
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResources = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    if (!session?.user?.id) {
      setError("Unauthorized: No user session found.");
      setIsLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams();
      if (options.search) params.append("search", options.search);
      if (options.category) params.append("category", options.category);
      if (options.type) params.append("type", options.type);
      if (options.status) params.append("status", options.status);
      if (options.authorId) params.append("authorId", options.authorId);
      if (options.limit) params.append("limit", options.limit.toString());
      if (options.offset) params.append("offset", options.offset.toString());

      const response = await fetch(`/api/resources?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch resources");
      }
      const data = await response.json();
      setResources(data.resources);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, options]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const createResource = useCallback(async (resourceData: Partial<Resource>) => {
    try {
      const response = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resourceData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create resource");
      }
      fetchResources(); // Refetch to update the list
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      return false;
    }
  }, [fetchResources]);

  const updateResource = useCallback(async (id: string, resourceData: Partial<Resource>) => {
    try {
      const response = await fetch(`/api/resources/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resourceData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update resource");
      }
      fetchResources(); // Refetch to update the list
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      return false;
    }
  }, [fetchResources]);

  const deleteResource = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/resources/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete resource");
      }
      fetchResources(); // Refetch to update the list
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      return false;
    }
  }, [fetchResources]);

  const publishResource = useCallback(async (id: string) => {
    return updateResource(id, { status: "PUBLISHED", publishedDate: new Date().toISOString() });
  }, [updateResource]);

  const unpublishResource = useCallback(async (id: string) => {
    return updateResource(id, { status: "DRAFT" });
  }, [updateResource]);

  return {
    resources,
    isLoading,
    error,
    refetch: fetchResources,
    createResource,
    updateResource,
    deleteResource,
    publishResource,
    unpublishResource,
  };
}
