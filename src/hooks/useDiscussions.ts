"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

export interface Discussion {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  student: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  };
  course?: {
    id: string;
    title: string;
    instructor?: {
      id: string;
      name: string;
    };
  } | null;
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
  } | null;
  replyCount: number;
}

export interface DiscussionReply {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  student: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  };
  voteCount: number;
  isUpvoted: boolean;
}

export interface Question {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isResolved: boolean;
  student: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  };
  course?: {
    id: string;
    title: string;
    instructor?: {
      id: string;
      name: string;
    };
  } | null;
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
  } | null;
  answers: Answer[];
  answerCount: number;
  voteCount: number;
  isUpvoted: boolean;
}

export interface Answer {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isAccepted: boolean;
  student: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  };
  voteCount: number;
  isUpvoted: boolean;
}

interface UseDiscussionsReturn {
  discussions: Discussion[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createDiscussion: (data: CreateDiscussionData) => Promise<Discussion | null>;
  createReply: (discussionId: string, content: string) => Promise<DiscussionReply | null>;
  vote: (targetType: string, targetId: string, isUpvote: boolean) => Promise<boolean>;
}

interface UseQuestionsReturn {
  questions: Question[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createQuestion: (data: CreateQuestionData) => Promise<Question | null>;
  createAnswer: (questionId: string, content: string) => Promise<Answer | null>;
  vote: (targetType: string, targetId: string, isUpvote: boolean) => Promise<boolean>;
}

interface CreateDiscussionData {
  title: string;
  content: string;
  courseId?: string;
  lessonId?: string;
}

interface CreateQuestionData {
  title: string;
  content: string;
  courseId?: string;
  lessonId?: string;
}

interface DiscussionFilters {
  courseId?: string;
  lessonId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}

interface QuestionFilters {
  courseId?: string;
  lessonId?: string;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}

export function useDiscussions(filters?: DiscussionFilters): UseDiscussionsReturn {
  const { data: session } = useSession();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDiscussions = useCallback(async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters?.courseId) params.append("courseId", filters.courseId);
      if (filters?.lessonId) params.append("lessonId", filters.lessonId);
      if (filters?.search) params.append("search", filters.search);
      if (filters?.sortBy) params.append("sortBy", filters.sortBy);
      if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());

      const response = await fetch(`/api/discussions?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch discussions");
      }

      const data = await response.json();
      setDiscussions(data.discussions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, filters]);

  const createDiscussion = async (data: CreateDiscussionData): Promise<Discussion | null> => {
    if (!session?.user?.id) return null;

    try {
      const response = await fetch("/api/discussions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create discussion");
      }

      const result = await response.json();
      
      // Add new discussion to the list
      setDiscussions(prev => [result.discussion, ...prev]);
      
      return result.discussion;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create discussion");
      return null;
    }
  };

  const createReply = async (discussionId: string, content: string): Promise<DiscussionReply | null> => {
    if (!session?.user?.id) return null;

    try {
      const response = await fetch(`/api/discussions/${discussionId}/replies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create reply");
      }

      const result = await response.json();
      
      // Update discussion reply count
      setDiscussions(prev => 
        prev.map(discussion => 
          discussion.id === discussionId 
            ? { ...discussion, replyCount: discussion.replyCount + 1 }
            : discussion
        )
      );
      
      return result.reply;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create reply");
      return null;
    }
  };

  const vote = async (targetType: string, targetId: string, isUpvote: boolean): Promise<boolean> => {
    if (!session?.user?.id) return false;

    try {
      const response = await fetch("/api/votes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetType,
          targetId,
          isUpvote,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to vote");
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to vote");
      return false;
    }
  };

  useEffect(() => {
    fetchDiscussions();
  }, [fetchDiscussions]);

  return {
    discussions,
    isLoading,
    error,
    refetch: fetchDiscussions,
    createDiscussion,
    createReply,
    vote,
  };
}

export function useQuestions(filters?: QuestionFilters): UseQuestionsReturn {
  const { data: session } = useSession();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = useCallback(async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters?.courseId) params.append("courseId", filters.courseId);
      if (filters?.lessonId) params.append("lessonId", filters.lessonId);
      if (filters?.search) params.append("search", filters.search);
      if (filters?.status) params.append("status", filters.status);
      if (filters?.sortBy) params.append("sortBy", filters.sortBy);
      if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());

      const response = await fetch(`/api/questions?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch questions");
      }

      const data = await response.json();
      setQuestions(data.questions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, filters]);

  const createQuestion = async (data: CreateQuestionData): Promise<Question | null> => {
    if (!session?.user?.id) return null;

    try {
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create question");
      }

      const result = await response.json();
      
      // Add new question to the list
      setQuestions(prev => [result.question, ...prev]);
      
      return result.question;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create question");
      return null;
    }
  };

  const createAnswer = async (questionId: string, content: string): Promise<Answer | null> => {
    if (!session?.user?.id) return null;

    try {
      const response = await fetch(`/api/questions/${questionId}/answers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create answer");
      }

      const result = await response.json();
      
      // Update question answer count
      setQuestions(prev => 
        prev.map(question => 
          question.id === questionId 
            ? { 
                ...question, 
                answerCount: question.answerCount + 1,
                answers: [...question.answers, result.answer]
              }
            : question
        )
      );
      
      return result.answer;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create answer");
      return null;
    }
  };

  const vote = async (targetType: string, targetId: string, isUpvote: boolean): Promise<boolean> => {
    if (!session?.user?.id) return false;

    try {
      const response = await fetch("/api/votes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetType,
          targetId,
          isUpvote,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to vote");
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to vote");
      return false;
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  return {
    questions,
    isLoading,
    error,
    refetch: fetchQuestions,
    createQuestion,
    createAnswer,
    vote,
  };
}
