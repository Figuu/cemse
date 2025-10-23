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
    profile?: {
      firstName?: string;
      lastName?: string;
      institution?: {
        id: string;
        name: string;
      };
    };
  };
}

interface HybridResourceFilters {
  search: string;
  category: string;
  type: string;
  status: string;
  municipality: string;
  authorId?: string;
}

export function useHybridResources(filters: HybridResourceFilters) {
  const { data: session } = useSession();
  const [allResources, setAllResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all resources from server only once (no search parameter)
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
      if (filters.authorId) params.append("authorId", filters.authorId);

      const response = await fetch(`/api/resources?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch resources");
      }
      const data = await response.json();
      setAllResources(data.resources || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, filters.authorId]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  // Client-side filtering for ALL filters including search
  const filteredResources = allResources.filter(resource => {
    // Search filter (client-side)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesTitle = resource.title.toLowerCase().includes(searchLower);
      const matchesDescription = resource.description.toLowerCase().includes(searchLower);
      const matchesAuthor = resource.createdBy?.firstName?.toLowerCase().includes(searchLower) ||
                           resource.createdBy?.lastName?.toLowerCase().includes(searchLower) ||
                           resource.createdBy?.profile?.firstName?.toLowerCase().includes(searchLower) ||
                           resource.createdBy?.profile?.lastName?.toLowerCase().includes(searchLower);
      const matchesTags = resource.tags?.some(tag => tag.toLowerCase().includes(searchLower));
      
      if (!matchesTitle && !matchesDescription && !matchesAuthor && !matchesTags) {
        return false;
      }
    }

    // Category filter
    if (filters.category !== "all" && resource.category !== filters.category) {
      return false;
    }

    // Type filter
    if (filters.type !== "all" && resource.type !== filters.type) {
      return false;
    }

    // Status filter
    if (filters.status !== "all" && resource.status !== filters.status) {
      return false;
    }

    // Municipality filter
    if (filters.municipality !== "all") {
      const institutionName = resource.createdBy?.profile?.institution?.name;
      if (filters.municipality === "Otro") {
        // Show resources from institutions that are not in the municipality list
        if (institutionName) return false;
      } else {
        // Show resources from specific municipality
        if (institutionName !== filters.municipality) return false;
      }
    }

    return true;
  });

  return {
    resources: filteredResources,
    allResources,
    isLoading,
    error,
    refetch: fetchResources,
  };
}
