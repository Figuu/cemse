"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

export interface Notification {
  id: string;
  type: "APPLICATION_STATUS_CHANGE" | "JOB_ALERT" | "MESSAGE" | "SYSTEM" | "COURSE_UPDATE";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, any>;
  jobApplication?: {
    id: string;
    jobTitle: string;
    company: string;
    status: string;
  };
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  createNotification: (data: {
    type: string;
    title: string;
    message: string;
    data?: Record<string, any>;
  }) => Promise<void>;
}

interface NotificationFilters {
  page?: number;
  limit?: number;
  type?: string;
  unreadOnly?: boolean;
}

export function useNotifications(filters?: NotificationFilters): UseNotificationsReturn {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());
      if (filters?.type) params.append("type", filters.type);
      if (filters?.unreadOnly) params.append("unreadOnly", filters.unreadOnly.toString());

      const response = await fetch(`/api/notifications?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch notifications");
      }

      const data = await response.json();
      setNotifications(data.notifications || []);
      
      // Calculate unread count
      const unread = data.notifications.filter((n: Notification) => !n.read).length;
      setUnreadCount(unread);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, filters?.page, filters?.limit, filters?.type, filters?.unreadOnly]);

  const markAsRead = async (notificationId: string) => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notificationIds: [notificationId],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to mark notification as read");
      }

      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark notification as read");
    }
  };

  const markAllAsRead = async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          markAllAsRead: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to mark all notifications as read");
      }

      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      
      setUnreadCount(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark all notifications as read");
    }
  };

  const createNotification = async (data: {
    type: string;
    title: string;
    message: string;
    data?: Record<string, any>;
  }) => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          userIds: [session.user.id],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create notification");
      }

      // Refetch notifications to get the new one
      await fetchNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create notification");
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
    createNotification,
  };
}
