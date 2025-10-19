import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BusinessStage } from "@prisma/client";

export interface Entrepreneurship {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  businessStage: BusinessStage;
  logo?: string;
  images: string[];
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  municipality: string;
  department: string;
  socialMedia?: any;
  founded?: Date;
  employees?: number;
  annualRevenue?: number;
  businessModel?: string;
  targetMarket?: string;
  isPublic: boolean;
  isActive: boolean;
  viewsCount: number;
  rating?: number;
  reviewsCount: number;
  createdAt: Date;
  updatedAt: Date;
  owner: {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  businessPlan?: any;
}

export interface CreateEntrepreneurshipData {
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  businessStage: BusinessStage;
  logo?: string;
  images?: string[];
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  municipality: string;
  department?: string;
  socialMedia?: string;
  founded?: string;
  employees?: string;
  annualRevenue?: string;
  businessModel?: string;
  targetMarket?: string;
  isPublic?: boolean;
}

export interface UpdateEntrepreneurshipData extends Partial<CreateEntrepreneurshipData> {
  isActive?: boolean;
}

export interface EntrepreneurshipsFilters {
  page?: number;
  limit?: number;
  category?: string;
  businessStage?: BusinessStage;
  municipality?: string;
  search?: string;
  ownerId?: string;
}

export function useEntrepreneurships(filters: EntrepreneurshipsFilters = {}) {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["entrepreneurships", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.category) params.append("category", filters.category);
      if (filters.businessStage) params.append("businessStage", filters.businessStage);
      if (filters.municipality) params.append("municipality", filters.municipality);
      if (filters.search) params.append("search", filters.search);
      if (filters.ownerId) params.append("ownerId", filters.ownerId);

      const response = await fetch(`/api/entrepreneurship/entrepreneurships?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch entrepreneurships");
      }
      return response.json();
    },
  });

  const createEntrepreneurshipMutation = useMutation({
    mutationFn: async (data: CreateEntrepreneurshipData) => {
      const response = await fetch("/api/entrepreneurship/entrepreneurships", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create entrepreneurship");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entrepreneurships"] });
    },
  });

  const updateEntrepreneurshipMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateEntrepreneurshipData }) => {
      const response = await fetch(`/api/entrepreneurship/entrepreneurships/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update entrepreneurship");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entrepreneurships"] });
    },
  });

  const deleteEntrepreneurshipMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/entrepreneurship/entrepreneurships/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete entrepreneurship");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entrepreneurships"] });
    },
  });

  return {
    entrepreneurships: data?.entrepreneurships || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
    createEntrepreneurship: createEntrepreneurshipMutation.mutateAsync,
    isCreating: createEntrepreneurshipMutation.isPending,
    updateEntrepreneurship: updateEntrepreneurshipMutation.mutateAsync,
    isUpdating: updateEntrepreneurshipMutation.isPending,
    deleteEntrepreneurship: deleteEntrepreneurshipMutation.mutateAsync,
    isDeleting: deleteEntrepreneurshipMutation.isPending,
  };
}

export function useMyEntrepreneurships(filters: Omit<EntrepreneurshipsFilters, 'ownerId'> = {}) {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["my-entrepreneurships", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.category) params.append("category", filters.category);
      if (filters.businessStage) params.append("businessStage", filters.businessStage);
      if (filters.municipality) params.append("municipality", filters.municipality);
      if (filters.search) params.append("search", filters.search);

      const response = await fetch(`/api/entrepreneurship/my-entrepreneurships?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch my entrepreneurships");
      }
      return response.json();
    },
  });

  const createEntrepreneurshipMutation = useMutation({
    mutationFn: async (data: CreateEntrepreneurshipData) => {
      const response = await fetch("/api/entrepreneurship/entrepreneurships", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create entrepreneurship");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-entrepreneurships"] });
      queryClient.invalidateQueries({ queryKey: ["entrepreneurships"] });
    },
  });

  const updateEntrepreneurshipMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateEntrepreneurshipData }) => {
      const response = await fetch(`/api/entrepreneurship/entrepreneurships/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update entrepreneurship");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-entrepreneurships"] });
      queryClient.invalidateQueries({ queryKey: ["entrepreneurships"] });
    },
  });

  const deleteEntrepreneurshipMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/entrepreneurship/entrepreneurships/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete entrepreneurship");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-entrepreneurships"] });
      queryClient.invalidateQueries({ queryKey: ["entrepreneurships"] });
    },
  });

  return {
    entrepreneurships: data?.entrepreneurships || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
    createEntrepreneurship: createEntrepreneurshipMutation.mutateAsync,
    isCreating: createEntrepreneurshipMutation.isPending,
    updateEntrepreneurship: updateEntrepreneurshipMutation.mutateAsync,
    isUpdating: updateEntrepreneurshipMutation.isPending,
    deleteEntrepreneurship: deleteEntrepreneurshipMutation.mutateAsync,
    isDeleting: deleteEntrepreneurshipMutation.isPending,
  };
}

export function useEntrepreneurship(id: string) {
  return useQuery({
    queryKey: ["entrepreneurship", id],
    queryFn: async () => {
      const response = await fetch(`/api/entrepreneurship/entrepreneurships/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch entrepreneurship");
      }
      return response.json();
    },
    enabled: !!id,
  });
}
