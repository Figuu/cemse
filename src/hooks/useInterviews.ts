"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

export interface Interview {
  id: string;
  applicationId: string;
  status: "SCHEDULED" | "CONFIRMED" | "DECLINED" | "COMPLETED" | "CANCELLED";
  type: "PHONE" | "VIDEO" | "IN_PERSON" | "TECHNICAL";
  scheduledAt: string;
  duration: number;
  location?: string;
  meetingLink?: string;
  notes?: string;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
  application: {
    id: string;
    jobTitle: string;
    company: string;
    candidate: {
      id: string;
      name: string;
      email: string;
    };
  };
  messages: Array<{
    id: string;
    senderId: string;
    message: string;
    createdAt: string;
    sender: {
      id: string;
      name: string;
      role: string;
      avatar?: string;
    };
  }>;
}

interface UseInterviewsReturn {
  interviews: Interview[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createInterview: (data: CreateInterviewData) => Promise<Interview | null>;
  updateInterview: (id: string, data: UpdateInterviewData) => Promise<boolean>;
  sendMessage: (interviewId: string, message: string) => Promise<boolean>;
}

interface CreateInterviewData {
  applicationId: string;
  type: "PHONE" | "VIDEO" | "IN_PERSON" | "TECHNICAL";
  scheduledAt: string;
  duration?: number;
  location?: string;
  meetingLink?: string;
  notes?: string;
}

interface UpdateInterviewData {
  status?: "SCHEDULED" | "CONFIRMED" | "DECLINED" | "COMPLETED" | "CANCELLED";
  type?: "PHONE" | "VIDEO" | "IN_PERSON" | "TECHNICAL";
  scheduledAt?: string;
  duration?: number;
  location?: string;
  meetingLink?: string;
  notes?: string;
  feedback?: string;
}

interface InterviewFilters {
  applicationId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export function useInterviews(filters?: InterviewFilters): UseInterviewsReturn {
  const { data: session } = useSession();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInterviews = useCallback(async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters?.applicationId) params.append("applicationId", filters.applicationId);
      if (filters?.status) params.append("status", filters.status);
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());

      const response = await fetch(`/api/interviews?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch interviews");
      }

      const data = await response.json();
      setInterviews(data.interviews || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, filters?.applicationId, filters?.status, filters?.page, filters?.limit]);

  const createInterview = async (data: CreateInterviewData): Promise<Interview | null> => {
    if (!session?.user?.id) return null;

    try {
      const response = await fetch("/api/interviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create interview");
      }

      const result = await response.json();
      
      // Refetch interviews to get the new one
      await fetchInterviews();
      
      return result.interview;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create interview");
      return null;
    }
  };

  const updateInterview = async (id: string, data: UpdateInterviewData): Promise<boolean> => {
    if (!session?.user?.id) return false;

    try {
      const response = await fetch(`/api/interviews/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update interview");
      }

      // Update local state
      setInterviews(prev => 
        prev.map(interview => 
          interview.id === id 
            ? { ...interview, ...data, updatedAt: new Date().toISOString() }
            : interview
        )
      );

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update interview");
      return false;
    }
  };

  const sendMessage = async (interviewId: string, message: string): Promise<boolean> => {
    if (!session?.user?.id) return false;

    try {
      const response = await fetch(`/api/interviews/${interviewId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send message");
      }

      const result = await response.json();
      
      // Update local state with new message
      setInterviews(prev => 
        prev.map(interview => 
          interview.id === interviewId 
            ? { 
                ...interview, 
                messages: [...interview.messages, result.message]
              }
            : interview
        )
      );

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
      return false;
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  return {
    interviews,
    isLoading,
    error,
    refetch: fetchInterviews,
    createInterview,
    updateInterview,
    sendMessage,
  };
}
