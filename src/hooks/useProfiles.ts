"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  title: string;
  location: string;
  experience: string;
  education: string;
  university: string;
  degree: string;
  skills: string[];
  bio: string;
  phone: string;
  isVerified: boolean;
  isAvailable: boolean;
  rating: number;
  views: number;
  connections: number;
  lastActive: string;
  role: "YOUTH" | "COMPANIES" | "INSTITUTION" | "SUPERADMIN";
  createdAt: string;
  experienceYears: number;
  languages: string[];
  certifications: string[];
  portfolio: string;
  linkedin: string;
  github: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface ProfileFilters {
  search?: string;
  location?: string;
  experience?: string;
  educationLevel?: string;
  skills?: string[];
  sortBy?: string;
  minRating?: number;
  isAvailable?: boolean | null;
  isVerified?: boolean | null;
  page?: number;
  limit?: number;
}

interface UseProfilesReturn {
  profiles: Profile[];
  pagination: PaginationInfo;
  filters: ProfileFilters;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProfiles(filters?: ProfileFilters): UseProfilesReturn {
  const { data: session } = useSession();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [appliedFilters, setAppliedFilters] = useState<ProfileFilters>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = useCallback(async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append("search", filters.search);
      if (filters?.location) params.append("location", filters.location);
      if (filters?.experience) params.append("experience", filters.experience);
      if (filters?.educationLevel) params.append("educationLevel", filters.educationLevel);
      if (filters?.skills && filters.skills.length > 0) {
        params.append("skills", filters.skills.join(","));
      }
      if (filters?.sortBy) params.append("sortBy", filters.sortBy);
      if (filters?.minRating !== undefined) params.append("minRating", filters.minRating.toString());
      if (filters?.isAvailable !== undefined && filters.isAvailable !== null) {
        params.append("isAvailable", filters.isAvailable.toString());
      }
      if (filters?.isVerified !== undefined && filters.isVerified !== null) {
        params.append("isVerified", filters.isVerified.toString());
      }
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());

      const response = await fetch(`/api/profiles?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch profiles");
      }

      const data = await response.json();
      setProfiles(data.profiles || []);
      setPagination(data.pagination || pagination);
      setAppliedFilters(data.filters || {});
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [
    session?.user?.id, 
    filters?.search, 
    filters?.location, 
    filters?.experience, 
    filters?.educationLevel,
    filters?.skills, 
    filters?.sortBy,
    filters?.minRating,
    filters?.isAvailable,
    filters?.isVerified,
    filters?.page,
    filters?.limit,
    pagination
  ]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  return {
    profiles,
    pagination,
    filters: appliedFilters,
    isLoading,
    error,
    refetch: fetchProfiles,
  };
}
