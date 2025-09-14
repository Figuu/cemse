import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ResourceType } from "@prisma/client";

export { ResourceType };

export interface EntrepreneurshipResource {
  id: string;
  title: string;
  description: string;
  content: string;
  type: ResourceType;
  category: string;
  tags: string[];
  url?: string;
  fileUrl?: string;
  imageUrl?: string;
  isPublic: boolean;
  isFeatured: boolean;
  views: number;
  likes: number;
  authorId: string;
  author: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateResourceData {
  title: string;
  description: string;
  content: string;
  type: ResourceType;
  category: string;
  tags?: string[];
  url?: string;
  fileUrl?: string;
  imageUrl?: string;
  isPublic?: boolean;
  isFeatured?: boolean;
}

export interface ResourcesFilters {
  page?: number;
  limit?: number;
  type?: ResourceType;
  category?: string;
  search?: string;
  featured?: boolean;
}

export function useEntrepreneurshipResources(filters: ResourcesFilters = {}) {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["entrepreneurship-resources", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.type) params.append("type", filters.type);
      if (filters.category) params.append("category", filters.category);
      if (filters.search) params.append("search", filters.search);
      if (filters.featured) params.append("featured", "true");

      const response = await fetch(`/api/entrepreneurship/resources?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch resources");
      }
      return response.json();
    },
  });

  const createResourceMutation = useMutation({
    mutationFn: async (data: CreateResourceData) => {
      const response = await fetch("/api/entrepreneurship/resources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create resource");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entrepreneurship-resources"] });
    },
  });

  return {
    resources: data?.resources || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
    createResource: createResourceMutation.mutateAsync,
    isCreating: createResourceMutation.isPending,
  };
}

export function useFeaturedResources() {
  return useEntrepreneurshipResources({ featured: true, limit: 6 });
}

export function useResourcesByType(type: ResourceType, limit = 12) {
  return useEntrepreneurshipResources({ type, limit });
}

export function useResourcesByCategory(category: string, limit = 12) {
  return useEntrepreneurshipResources({ category, limit });
}
