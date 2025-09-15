"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "YOUTH" | "COMPANIES" | "INSTITUTION" | "SUPERADMIN";
  status: "active" | "inactive" | "pending";
  joinDate: string;
  lastActivity: string;
}

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalCompanies: number;
  totalInstitutions: number;
  totalCourses: number;
  totalJobs: number;
  systemHealth: "excellent" | "good" | "warning" | "critical";
  userActivityRate: number;
}

interface RecentActivity {
  id: string;
  type: "user_registration" | "company_created" | "course_published" | "job_posted" | "system_alert";
  description: string;
  timestamp: string;
  severity: "info" | "warning" | "error";
}

interface UseAdminStatsReturn {
  stats: SystemStats | null;
  recentUsers: User[];
  recentActivities: RecentActivity[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAdminStats(): UseAdminStatsReturn {
  const { data: session } = useSession();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/stats");
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch admin statistics");
      }

      const data = await response.json();
      setStats(data.stats);
      setRecentUsers(data.recentUsers || []);
      setRecentActivities(data.recentActivities || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchStats();
  }, [session?.user?.id, fetchStats]);

  return {
    stats,
    recentUsers,
    recentActivities,
    isLoading,
    error,
    refetch: fetchStats,
  };
}
