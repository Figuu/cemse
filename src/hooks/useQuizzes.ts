"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

export interface QuizQuestion {
  id: string;
  type: "multiple_choice" | "true_false" | "fill_blank" | "essay";
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
  points?: number;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  timeLimit?: number;
  passingScore: number;
  maxAttempts: number;
  isActive: boolean;
  questions: QuizQuestion[];
  lesson?: {
    id: string;
    title: string;
    module: {
      id: string;
      title: string;
      course: {
        id: string;
        title: string;
      };
    };
  };
  course?: {
    id: string;
    title: string;
  };
  attempts: {
    count: number;
    latest?: {
      id: string;
      score: number;
      passed: boolean;
      completedAt: string;
    };
    bestScore: number;
    canRetake: boolean;
    isPassed: boolean;
  };
}

export interface QuizAttempt {
  id: string;
  score: number;
  passed: boolean;
  answers: Record<string, any>;
  completedAt: string;
}

export interface QuizResults {
  correctAnswers: number;
  totalQuestions: number;
  score: number;
  passed: boolean;
  passingScore: number;
}

interface UseQuizzesReturn {
  quizzes: Quiz[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  submitQuiz: (quizId: string, answers: Record<string, any>) => Promise<{ attempt: QuizAttempt; results: QuizResults } | null>;
}

interface QuizFilters {
  courseId?: string;
  lessonId?: string;
  page?: number;
  limit?: number;
}

export function useQuizzes(filters?: QuizFilters): UseQuizzesReturn {
  const { data: session } = useSession();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuizzes = useCallback(async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters?.courseId) params.append("courseId", filters.courseId);
      if (filters?.lessonId) params.append("lessonId", filters.lessonId);
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());

      const response = await fetch(`/api/quizzes?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch quizzes");
      }

      const data = await response.json();
      setQuizzes(data.quizzes || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, filters?.courseId, filters?.lessonId, filters?.page, filters?.limit]);

  const submitQuiz = async (
    quizId: string, 
    answers: Record<string, any>
  ): Promise<{ attempt: QuizAttempt; results: QuizResults } | null> => {
    if (!session?.user?.id) return null;

    try {
      const response = await fetch(`/api/quizzes/${quizId}/attempts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit quiz");
      }

      const data = await response.json();
      
      // Refetch quizzes to get updated attempt data
      await fetchQuizzes();
      
      return {
        attempt: data.attempt,
        results: data.results,
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit quiz");
      return null;
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  return {
    quizzes,
    isLoading,
    error,
    refetch: fetchQuizzes,
    submitQuiz,
  };
}

// Hook for individual quiz management
export function useQuiz(quizId: string) {
  const { data: session } = useSession();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [canAttempt, setCanAttempt] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuiz = useCallback(async () => {
    if (!session?.user?.id || !quizId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/quizzes/${quizId}/attempts`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch quiz");
      }

      const data = await response.json();
      setQuiz(data.quiz);
      setAttempts(data.attempts);
      setCanAttempt(data.canAttempt);
      setAttemptsRemaining(data.attemptsRemaining);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, quizId]);

  const submitQuiz = async (answers: Record<string, any>) => {
    if (!session?.user?.id || !quizId) return null;

    try {
      const response = await fetch(`/api/quizzes/${quizId}/attempts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit quiz");
      }

      const data = await response.json();
      
      // Refetch quiz to get updated attempt data
      await fetchQuiz();
      
      return {
        attempt: data.attempt,
        results: data.results,
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit quiz");
      return null;
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  return {
    quiz,
    attempts,
    canAttempt,
    attemptsRemaining,
    isLoading,
    error,
    refetch: fetchQuiz,
    submitQuiz,
  };
}
