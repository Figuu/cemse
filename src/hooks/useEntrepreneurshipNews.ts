import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface EntrepreneurshipNews {
  id: string;
  title: string;
  summary: string;
  content: string;
  imageUrl?: string;
  sourceUrl?: string;
  sourceName?: string;
  category: string;
  tags: string[];
  isPublished: boolean;
  publishedAt?: string;
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

export interface CreateNewsData {
  title: string;
  summary: string;
  content: string;
  imageUrl?: string;
  sourceUrl?: string;
  sourceName?: string;
  category: string;
  tags?: string[];
  isPublished?: boolean;
}

export interface NewsFilters {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  published?: boolean;
}

export function useEntrepreneurshipNews(filters: NewsFilters = {}) {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["entrepreneurship-news", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.category) params.append("category", filters.category);
      if (filters.search) params.append("search", filters.search);
      if (filters.published) params.append("published", "true");

      const response = await fetch(`/api/entrepreneurship/news?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch news");
      }
      return response.json();
    },
  });

  const createNewsMutation = useMutation({
    mutationFn: async (data: CreateNewsData) => {
      const response = await fetch("/api/entrepreneurship/news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create news");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entrepreneurship-news"] });
    },
  });

  return {
    news: data?.news || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
    createNews: createNewsMutation.mutateAsync,
    isCreating: createNewsMutation.isPending,
  };
}

export function usePublishedNews() {
  return useEntrepreneurshipNews({ published: true, limit: 12 });
}

export function useNewsByCategory(category: string, limit = 12) {
  return useEntrepreneurshipNews({ category, published: true, limit });
}

export function useLatestNews(limit = 6) {
  return useEntrepreneurshipNews({ published: true, limit });
}
