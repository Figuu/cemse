"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  thumbnail?: string;
  videoPreview?: string;
  objectives: string[];
  prerequisites: string[];
  duration: number;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  category: "TECHNOLOGY" | "BUSINESS" | "DESIGN" | "MARKETING" | "LANGUAGES" | "HEALTH" | "EDUCATION" | "ARTS" | "SCIENCE" | "ENGINEERING" | "OTHER";
  isMandatory: boolean;
  rating: number;
  studentsCount: number;
  completionRate: number;
  totalLessons: number;
  totalQuizzes: number;
  totalResources: number;
  tags: string[];
  certification: boolean;
  includedMaterials: string[];
  instructor?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  institution?: {
    id: string;
    name: string;
    department?: string;
    region?: string;
  };
  institutionName?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  modules: Array<{
    id: string;
    title: string;
    orderIndex: number;
  }>;
  enrollment?: {
    id: string;
    progress: number;
    isCompleted: boolean;
    enrolledAt: string;
    lastAccessedAt?: string;
  };
  isEnrolled: boolean;
  isOwner: boolean;
  progress: number;
  isCompleted: boolean;
  totalModules: number;
  totalEnrollments: number;
}

export interface CourseCategory {
  value: string;
  label: string;
  count: number;
}

export interface CourseLevel {
  value: string;
  label: string;
  count: number;
}

interface UseCoursesReturn {
  courses: Course[];
  categories: CourseCategory[];
  levels: CourseLevel[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  enrollInCourse: (courseId: string) => Promise<boolean>;
  unenrollFromCourse: (courseId: string) => Promise<boolean>;
}

interface CourseFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  level?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  isEnrolled?: boolean;
  isActive?: boolean;
}

export function useCourses(filters?: CourseFilters): UseCoursesReturn {
  const { data: session } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [levels, setLevels] = useState<CourseLevel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());
      if (filters?.search) params.append("search", filters.search);
      if (filters?.category) params.append("category", filters.category);
      if (filters?.level) params.append("level", filters.level);
      if (filters?.sortBy) params.append("sortBy", filters.sortBy);
      if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);
      if (filters?.isEnrolled !== undefined) params.append("isEnrolled", filters.isEnrolled.toString());
      if (filters?.isActive !== undefined) params.append("isActive", filters.isActive.toString());

      const response = await fetch(`/api/courses?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch courses");
      }

      const data = await response.json();
      setCourses(data.courses || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, filters?.page, filters?.limit, filters?.search, filters?.category, filters?.level, filters?.sortBy, filters?.sortOrder, filters?.isEnrolled, filters?.isActive]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/courses/categories");
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch categories");
      }

      const data = await response.json();
      setCategories(data.categories || []);
      setLevels(data.levels || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
      // Don't set error for categories as it's not critical
    }
  }, []);

  const enrollInCourse = async (courseId: string): Promise<boolean> => {
    if (!session?.user?.id) return false;

    try {
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to enroll in course");
      }

      // Update local state
      setCourses(prev => 
        prev.map(course => 
          course.id === courseId 
            ? { 
                ...course, 
                isEnrolled: true,
                enrollment: {
                  id: `temp-${Date.now()}`,
                  progress: 0,
                  isCompleted: false,
                  enrolledAt: new Date().toISOString(),
                }
              }
            : course
        )
      );

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to enroll in course");
      return false;
    }
  };

  const unenrollFromCourse = async (courseId: string): Promise<boolean> => {
    if (!session?.user?.id) return false;

    try {
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to unenroll from course");
      }

      // Update local state
      setCourses(prev => 
        prev.map(course => 
          course.id === courseId 
            ? { 
                ...course, 
                isEnrolled: false,
                enrollment: undefined,
                progress: 0,
                isCompleted: false,
              }
            : course
        )
      );

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unenroll from course");
      return false;
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchCategories();
  }, [fetchCourses, fetchCategories]);

  return {
    courses,
    categories,
    levels,
    isLoading,
    error,
    refetch: fetchCourses,
    enrollInCourse,
    unenrollFromCourse,
  };
}
