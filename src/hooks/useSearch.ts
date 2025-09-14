"use client";

import { useState, useEffect, useCallback } from "react";

export interface SearchResult {
  type: 'job' | 'company' | 'youth' | 'course' | 'institution';
  id: string;
  title: string;
  description: string;
  url: string;
  metadata: Record<string, string | number | string[] | Date | null>;
  score: number;
}

export interface SearchFilters {
  type?: string[];
  location?: string;
  category?: string;
  skills?: string[];
  experience?: string;
  salary?: {
    min: number;
    max: number;
  };
}

interface UseSearchReturn {
  results: SearchResult[];
  suggestions: string[];
  popularSearches: string[];
  isLoading: boolean;
  error: string | null;
  search: (query: string, filters?: SearchFilters) => Promise<void>;
  getSuggestions: (query: string) => Promise<void>;
  clearResults: () => void;
}

export function useSearch(): UseSearchReturn {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string, filters: SearchFilters = {}) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams({
        q: query,
        limit: "20",
        offset: "0"
      });

      // Add filters to search params
      if (filters.type && filters.type.length > 0) {
        searchParams.append('type', filters.type.join(','));
      }
      if (filters.location) {
        searchParams.append('location', filters.location);
      }
      if (filters.category) {
        searchParams.append('category', filters.category);
      }
      if (filters.skills && filters.skills.length > 0) {
        searchParams.append('skills', filters.skills.join(','));
      }
      if (filters.experience) {
        searchParams.append('experience', filters.experience);
      }
      if (filters.salary) {
        searchParams.append('salaryMin', filters.salary.min.toString());
        searchParams.append('salaryMax', filters.salary.max.toString());
      }

      const response = await fetch(`/api/search?${searchParams.toString()}`);
      
      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      setResults(data.results || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}&limit=5`);
      
      if (!response.ok) {
        throw new Error("Failed to get suggestions");
      }

      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (err) {
      console.error("Error getting suggestions:", err);
      setSuggestions([]);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setSuggestions([]);
    setError(null);
  }, []);

  // Load popular searches on mount
  useEffect(() => {
    const loadPopularSearches = async () => {
      try {
        const response = await fetch('/api/search/popular?limit=10');
        
        if (!response.ok) {
          throw new Error("Failed to load popular searches");
        }

        const data = await response.json();
        setPopularSearches(data.searches || []);
      } catch (err) {
        console.error("Error loading popular searches:", err);
      }
    };

    loadPopularSearches();
  }, []);

  return {
    results,
    suggestions,
    popularSearches,
    isLoading,
    error,
    search,
    getSuggestions,
    clearResults
  };
}
