"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

interface NewsArticle {
  id: string;
  title: string;
  content: string;
  summary: string;
  imageUrl?: string;
  videoUrl?: string;
  authorId: string;
  authorName: string;
  authorType: "COMPANY" | "INSTITUTION" | "ADMIN";
  authorLogo?: string;
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  featured: boolean;
  tags: string[];
  category: string;
  publishedAt?: string;
  expiresAt?: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  targetAudience: string[];
  region?: string;
  relatedLinks?: any;
  createdAt: string;
  updatedAt: string;
  isEntrepreneurshipRelated: boolean;
  author?: {
    id: string;
    email: string;
    profile?: {
      firstName?: string;
      lastName?: string;
    };
  };
}

interface UseNewsOptions {
  search?: string;
  category?: string;
  status?: string;
  authorId?: string;
  limit?: number;
  offset?: number;
}

interface UseNewsReturn {
  news: NewsArticle[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  createNews: (data: CreateNewsData) => Promise<NewsArticle | null>;
  updateNews: (id: string, data: UpdateNewsData) => Promise<NewsArticle | null>;
  deleteNews: (id: string) => Promise<boolean>;
  publishNews: (id: string) => Promise<boolean>;
  unpublishNews: (id: string) => Promise<boolean>;
}

interface CreateNewsData {
  title: string;
  content: string;
  summary?: string;
  category: string;
  tags?: string[];
  imageUrl?: string;
  videoUrl?: string;
  status?: "PUBLISHED" | "DRAFT" | "ARCHIVED";
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  featured?: boolean;
  targetAudience?: string[];
  region?: string;
  relatedLinks?: any;
  isEntrepreneurshipRelated?: boolean;
}

interface UpdateNewsData extends Partial<CreateNewsData> {}

export function useNews(options: UseNewsOptions = {}): UseNewsReturn {
  const { data: session } = useSession();
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    if (!session?.user?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      if (options.search) params.append("search", options.search);
      if (options.category && options.category !== "all") params.append("category", options.category);
      if (options.status && options.status !== "all") params.append("status", options.status);
      if (options.authorId) params.append("authorId", options.authorId);
      if (options.limit) params.append("limit", options.limit.toString());
      if (options.offset) params.append("offset", options.offset.toString());

      const response = await fetch(`/api/news?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch news");
      }

      const data = await response.json();
      setNews(data.news || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, options.search, options.category, options.status, options.authorId, options.limit, options.offset]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const createNews = async (data: CreateNewsData): Promise<NewsArticle | null> => {
    try {
      const response = await fetch("/api/news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create news");
      }

      const result = await response.json();
      await fetchNews(); // Refresh the list
      return result.news;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create news");
      return null;
    }
  };

  const updateNews = async (id: string, data: UpdateNewsData): Promise<NewsArticle | null> => {
    try {
      const response = await fetch(`/api/news/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update news");
      }

      const result = await response.json();
      await fetchNews(); // Refresh the list
      return result.news;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update news");
      return null;
    }
  };

  const deleteNews = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/news/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete news");
      }

      await fetchNews(); // Refresh the list
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete news");
      return false;
    }
  };

  const publishNews = async (id: string): Promise<boolean> => {
    return updateNews(id, { status: "PUBLISHED" }) !== null;
  };

  const unpublishNews = async (id: string): Promise<boolean> => {
    return updateNews(id, { status: "DRAFT" }) !== null;
  };

  return {
    news,
    isLoading,
    error,
    refetch: fetchNews,
    createNews,
    updateNews,
    deleteNews,
    publishNews,
    unpublishNews,
  };
}
