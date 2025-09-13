"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

export interface InstructorCourse {
  id: string;
  title: string;
  description: string;
  status: "DRAFT" | "ACTIVE" | "COMPLETED";
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  duration: number;
  createdAt: string;
  updatedAt: string;
  instructor: {
    id: string;
    name: string;
    email: string;
  };
  stats: {
    totalStudents: number;
    completedStudents: number;
    totalModules: number;
    totalLessons: number;
    totalDiscussions: number;
    totalQuestions: number;
    averageProgress: number;
  };
  modules: {
    id: string;
    title: string;
    description: string;
    order: number;
    lessonCount: number;
  }[];
  recentStudents: {
    id: string;
    name: string;
    email: string;
    progress: number;
    isCompleted: boolean;
    enrolledAt: string;
  }[];
}

export interface InstructorStudent {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  course: {
    id: string;
    title: string;
  };
  enrollment: {
    id: string;
    enrolledAt: string;
    completedAt: string | null;
    isCompleted: boolean;
    progress: number;
    progressPercentage: number;
  };
  stats: {
    totalLessons: number;
    completedLessons: number;
    lastActivity: string;
  };
}

export interface InstructorAnalytics {
  overview: {
    totalCourses: number;
    activeCourses: number;
    completedCourses: number;
    totalStudents: number;
    completedStudents: number;
    totalModules: number;
    totalLessons: number;
    totalDiscussions: number;
    totalQuestions: number;
    totalCertificates: number;
    completionRate: number;
    averageProgress: number;
  };
  coursePerformance: {
    id: string;
    title: string;
    status: string;
    totalStudents: number;
    completedStudents: number;
    averageProgress: number;
    totalModules: number;
    totalDiscussions: number;
    totalQuestions: number;
    completionRate: number;
  }[];
  studentEngagement: {
    id: string;
    name: string;
    email: string;
    course: {
      id: string;
      title: string;
    };
    progress: number;
    isCompleted: boolean;
    enrolledAt: string;
    lastActivity: string;
  }[];
  recentActivity: {
    id: string;
    type: string;
    title: string;
    message: string;
    createdAt: string;
  }[];
  timeRange: number;
}

interface UseInstructorCoursesReturn {
  courses: InstructorCourse[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createCourse: (data: CreateCourseData) => Promise<InstructorCourse | null>;
  updateCourse: (courseId: string, data: UpdateCourseData) => Promise<boolean>;
  deleteCourse: (courseId: string) => Promise<boolean>;
}

interface UseInstructorStudentsReturn {
  students: InstructorStudent[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseInstructorAnalyticsReturn {
  analytics: InstructorAnalytics | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface CreateCourseData {
  title: string;
  description: string;
  level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  duration?: number;
  status?: "DRAFT" | "ACTIVE" | "COMPLETED";
}

interface UpdateCourseData {
  title?: string;
  description?: string;
  level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  duration?: number;
  status?: "DRAFT" | "ACTIVE" | "COMPLETED";
}

interface CourseFilters {
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}

interface StudentFilters {
  courseId?: string;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}

interface AnalyticsFilters {
  timeRange?: number;
  courseId?: string;
}

export function useInstructorCourses(filters?: CourseFilters): UseInstructorCoursesReturn {
  const { data: session } = useSession();
  const [courses, setCourses] = useState<InstructorCourse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append("status", filters.status);
      if (filters?.search) params.append("search", filters.search);
      if (filters?.sortBy) params.append("sortBy", filters.sortBy);
      if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());

      const response = await fetch(`/api/instructor/courses?${params.toString()}`);
      
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
  }, [session?.user?.id, filters]);

  const createCourse = async (data: CreateCourseData): Promise<InstructorCourse | null> => {
    if (!session?.user?.id) return null;

    try {
      const response = await fetch("/api/instructor/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create course");
      }

      const result = await response.json();
      
      // Add new course to the list
      setCourses(prev => [result.course, ...prev]);
      
      return result.course;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create course");
      return null;
    }
  };

  const updateCourse = async (courseId: string, data: UpdateCourseData): Promise<boolean> => {
    if (!session?.user?.id) return false;

    try {
      const response = await fetch(`/api/instructor/courses/${courseId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update course");
      }

      // Update course in the list
      setCourses(prev => 
        prev.map(course => 
          course.id === courseId 
            ? { ...course, ...data, updatedAt: new Date().toISOString() }
            : course
        )
      );

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update course");
      return false;
    }
  };

  const deleteCourse = async (courseId: string): Promise<boolean> => {
    if (!session?.user?.id) return false;

    try {
      const response = await fetch(`/api/instructor/courses/${courseId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete course");
      }

      // Remove course from the list
      setCourses(prev => prev.filter(course => course.id !== courseId));

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete course");
      return false;
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return {
    courses,
    isLoading,
    error,
    refetch: fetchCourses,
    createCourse,
    updateCourse,
    deleteCourse,
  };
}

export function useInstructorStudents(filters?: StudentFilters): UseInstructorStudentsReturn {
  const { data: session } = useSession();
  const [students, setStudents] = useState<InstructorStudent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters?.courseId) params.append("courseId", filters.courseId);
      if (filters?.status) params.append("status", filters.status);
      if (filters?.search) params.append("search", filters.search);
      if (filters?.sortBy) params.append("sortBy", filters.sortBy);
      if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());

      const response = await fetch(`/api/instructor/students?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch students");
      }

      const data = await response.json();
      setStudents(data.students || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, filters]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return {
    students,
    isLoading,
    error,
    refetch: fetchStudents,
  };
}

export function useInstructorAnalytics(filters?: AnalyticsFilters): UseInstructorAnalyticsReturn {
  const { data: session } = useSession();
  const [analytics, setAnalytics] = useState<InstructorAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters?.timeRange) params.append("timeRange", filters.timeRange.toString());
      if (filters?.courseId) params.append("courseId", filters.courseId);

      const response = await fetch(`/api/instructor/analytics?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch analytics");
      }

      const data = await response.json();
      setAnalytics(data.analytics);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, filters]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    isLoading,
    error,
    refetch: fetchAnalytics,
  };
}
