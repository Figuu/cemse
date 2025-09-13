"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

export interface LessonProgress {
  id: string;
  isCompleted: boolean;
  completedAt: string | null;
  timeSpent: number;
}

export interface Lesson {
  id: string;
  title: string;
  description: string | null;
  content: string;
  contentType: string;
  videoUrl: string | null;
  audioUrl: string | null;
  duration: number | null;
  orderIndex: number;
  isRequired: boolean;
  isPreview: boolean;
  attachments: any;
  module: {
    id: string;
    title: string;
    courseId: string;
  };
  course: {
    id: string;
    title: string;
  };
}

export interface ModuleProgress {
  id: string;
  title: string;
  description: string | null;
  orderIndex: number;
  estimatedDuration: number;
  isLocked: boolean;
  totalLessons: number;
  completedLessons: number;
  progress: number;
  lessons: Array<{
    id: string;
    title: string;
    description: string | null;
    orderIndex: number;
    duration: number | null;
    isRequired: boolean;
    isPreview: boolean;
    contentType: string;
    progress: LessonProgress;
  }>;
}

export interface CourseProgress {
  courseId: string;
  courseTitle: string;
  enrollment: {
    id: string;
    enrolledAt: string;
    lastAccessedAt: string | null;
    progress: number;
    isCompleted: boolean;
    completedAt: string | null;
  };
  overall: {
    progress: number;
    totalLessons: number;
    completedLessons: number;
    totalTimeSpent: number;
    estimatedDuration: number;
  };
  modules: ModuleProgress[];
}

interface UseCourseProgressReturn {
  progress: CourseProgress | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateLessonProgress: (lessonId: string, isCompleted: boolean, timeSpent?: number) => Promise<boolean>;
  markLessonComplete: (lessonId: string) => Promise<boolean>;
  markLessonIncomplete: (lessonId: string) => Promise<boolean>;
  updateTimeSpent: (lessonId: string, timeSpent: number) => Promise<boolean>;
}

export function useCourseProgress(courseId: string): UseCourseProgressReturn {
  const { data: session } = useSession();
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!session?.user?.id || !courseId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/courses/${courseId}/progress`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch course progress");
      }

      const data = await response.json();
      setProgress(data.progress);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, courseId]);

  const updateLessonProgress = async (
    lessonId: string, 
    isCompleted: boolean, 
    timeSpent?: number
  ): Promise<boolean> => {
    if (!session?.user?.id) return false;

    try {
      const response = await fetch(`/api/lessons/${lessonId}/progress`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isCompleted,
          timeSpent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update lesson progress");
      }

      // Refetch progress to get updated data
      await fetchProgress();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update lesson progress");
      return false;
    }
  };

  const markLessonComplete = async (lessonId: string): Promise<boolean> => {
    return await updateLessonProgress(lessonId, true);
  };

  const markLessonIncomplete = async (lessonId: string): Promise<boolean> => {
    return await updateLessonProgress(lessonId, false);
  };

  const updateTimeSpent = async (lessonId: string, timeSpent: number): Promise<boolean> => {
    return await updateLessonProgress(lessonId, false, timeSpent);
  };

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return {
    progress,
    isLoading,
    error,
    refetch: fetchProgress,
    updateLessonProgress,
    markLessonComplete,
    markLessonIncomplete,
    updateTimeSpent,
  };
}

// Hook for individual lesson progress
export function useLessonProgress(lessonId: string) {
  const { data: session } = useSession();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<LessonProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLessonProgress = useCallback(async () => {
    if (!session?.user?.id || !lessonId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/lessons/${lessonId}/progress`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch lesson progress");
      }

      const data = await response.json();
      setLesson(data.lesson);
      setProgress(data.progress);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, lessonId]);

  const updateProgress = async (isCompleted: boolean, timeSpent?: number): Promise<boolean> => {
    if (!session?.user?.id) return false;

    try {
      const response = await fetch(`/api/lessons/${lessonId}/progress`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isCompleted,
          timeSpent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update lesson progress");
      }

      const data = await response.json();
      setProgress(data.lessonProgress);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update lesson progress");
      return false;
    }
  };

  useEffect(() => {
    fetchLessonProgress();
  }, [fetchLessonProgress]);

  return {
    lesson,
    progress,
    isLoading,
    error,
    refetch: fetchLessonProgress,
    updateProgress,
  };
}
