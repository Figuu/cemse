"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

// Type for notification data based on common notification types
export type NotificationData = Record<string, string | number | boolean | null | string[]>;

interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data: NotificationData;
  read: boolean;
  createdAt: string;
}

interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  jobApplications: boolean;
  jobOffers: boolean;
  messages: boolean;
  courses: boolean;
  certificates: boolean;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  preferences: NotificationPreferences | null;
  isLoading: boolean;
  error: string | null;
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  updatePreferences: (preferences: NotificationPreferences) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/notifications");
      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();
      setNotifications(data.notifications);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  const fetchPreferences = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch("/api/notifications/preferences");
      if (!response.ok) {
        throw new Error("Failed to fetch preferences");
      }

      const data = await response.json();
      setPreferences(data.preferences);
    } catch (err) {
      console.error("Error fetching preferences:", err);
    }
  }, [session?.user?.id]);

  const markAsRead = async (id: string) => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "mark-read" }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }

      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark as read");
    }
  };

  const markAllAsRead = async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch("/api/notifications/mark-all-read", {
        method: "PUT",
      });

      if (!response.ok) {
        throw new Error("Failed to mark all notifications as read");
      }

      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark all as read");
    }
  };

  const deleteNotification = async (id: string) => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete notification");
      }

      setNotifications(prev =>
        prev.filter(notification => notification.id !== id)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete notification");
    }
  };

  const updatePreferences = async (newPreferences: NotificationPreferences) => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch("/api/notifications/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ preferences: newPreferences }),
      });

      if (!response.ok) {
        throw new Error("Failed to update preferences");
      }

      setPreferences(newPreferences);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update preferences");
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchPreferences();
  }, [fetchNotifications, fetchPreferences]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    preferences,
    isLoading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updatePreferences,
    refetch: fetchNotifications
  };
}