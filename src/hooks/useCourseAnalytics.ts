"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

export interface CourseAnalytics {
  timeRange: string;
  period: {
    start: string;
    end: string;
  };
  courseMetrics: {
    totalCourses: number;
    activeCourses: number;
    completedCourses: number;
    draftCourses: number;
    totalEnrollments: number;
    totalCompletions: number;
    completionRate: number;
    averageProgress: number;
    averageRating: number;
  };
  enrollmentTrends: {
    date: string;
    total: number;
    byLevel: Record<string, number>;
  }[];
  completionRates: {
    courseId: string;
    courseTitle: string;
    level: string;
    status: string;
    totalEnrollments: number;
    completedEnrollments: number;
    completionRate: number;
    averageProgress: number;
  }[];
  studentEngagement: {
    discussionCount: number;
    questionCount: number;
    quizAttempts: number;
    averageSessionTime: number;
    activeStudents: number;
    engagementScore: number;
  };
  coursePerformance: {
    id: string;
    title: string;
    level: string;
    status: string;
    totalEnrollments: number;
    completedEnrollments: number;
    completionRate: number;
    averageProgress: number;
    totalModules: number;
    totalDiscussions: number;
    totalQuestions: number;
    engagementScore: number;
  }[];
  instructorPerformance: {
    id: string;
    name: string;
    email: string;
    totalCourses: number;
    totalEnrollments: number;
    totalCompletions: number;
    completionRate: number;
    totalDiscussions: number;
    totalQuestions: number;
    engagementScore: number;
  }[];
  contentAnalytics: {
    totalModules: number;
    totalLessons: number;
    totalQuizzes: number;
    averageModuleLength: number;
    averageLessonLength: number;
    mostAccessedContent: {
      id: string;
      title: string;
      accessCount: number;
      duration: number;
    }[];
  };
  timeSeriesData: {
    date: string;
    enrollments: number;
    completions: number;
  }[];
  topPerformingCourses: {
    id: string;
    title: string;
    level: string;
    status: string;
    totalEnrollments: number;
    completedEnrollments: number;
    completionRate: number;
    averageProgress: number;
    totalDiscussions: number;
    totalQuestions: number;
    engagementScore: number;
  }[];
  studentDemographics: {
    totalStudents: number;
    experienceLevels: Record<string, number>;
    educationLevels: Record<string, number>;
    topSkills: {
      skill: string;
      count: number;
    }[];
    averageSkillsPerStudent: number;
  };
}

export interface ReportData {
  metadata: {
    id: string;
    type: string;
    timeRange: string;
    generatedAt: string;
    generatedBy: string;
    period: {
      start: string;
      end: string;
    };
    filters: {
      courseId: string | null;
      instructorId: string | null;
    };
  };
  data: any;
}

interface UseCourseAnalyticsReturn {
  analytics: CourseAnalytics | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  generateReport: (reportData: GenerateReportData) => Promise<ReportData | null>;
  downloadReport: (reportData: GenerateReportData, format: string) => Promise<boolean>;
}

interface GenerateReportData {
  reportType: "course_performance" | "student_engagement" | "instructor_analytics" | "completion_analysis" | "content_analytics" | "comprehensive";
  timeRange: string;
  courseId?: string;
  instructorId?: string;
  includeCharts?: boolean;
}

interface AnalyticsFilters {
  timeRange?: string;
  courseId?: string;
  instructorId?: string;
  level?: string;
  status?: string;
}

export function useCourseAnalytics(filters?: AnalyticsFilters): UseCourseAnalyticsReturn {
  const { data: session } = useSession();
  const [analytics, setAnalytics] = useState<CourseAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters?.timeRange) params.append("timeRange", filters.timeRange);
      if (filters?.courseId) params.append("courseId", filters.courseId);
      if (filters?.instructorId) params.append("instructorId", filters.instructorId);
      if (filters?.level) params.append("level", filters.level);
      if (filters?.status) params.append("status", filters.status);

      const response = await fetch(`/api/courses/analytics?${params.toString()}`);
      
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

  const generateReport = async (reportData: GenerateReportData): Promise<ReportData | null> => {
    if (!session?.user?.id) return null;

    try {
      const response = await fetch("/api/courses/analytics/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...reportData,
          format: "json",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate report");
      }

      const result = await response.json();
      return result.report;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate report");
      return null;
    }
  };

  const downloadReport = async (reportData: GenerateReportData, format: string = "csv"): Promise<boolean> => {
    if (!session?.user?.id) return false;

    try {
      const response = await fetch("/api/courses/analytics/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...reportData,
          format,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to download report");
      }

      // Handle file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `course_analytics_${reportData.reportType}_${reportData.timeRange}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to download report");
      return false;
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    isLoading,
    error,
    refetch: fetchAnalytics,
    generateReport,
    downloadReport,
  };
}

// Hook for specific analytics views
export function useCoursePerformanceAnalytics(filters?: AnalyticsFilters) {
  const { analytics, isLoading, error, refetch } = useCourseAnalytics(filters);
  
  return {
    coursePerformance: analytics?.coursePerformance || [],
    courseMetrics: analytics?.courseMetrics,
    topPerformingCourses: analytics?.topPerformingCourses || [],
    isLoading,
    error,
    refetch,
  };
}

export function useStudentEngagementAnalytics(filters?: AnalyticsFilters) {
  const { analytics, isLoading, error, refetch } = useCourseAnalytics(filters);
  
  return {
    studentEngagement: analytics?.studentEngagement,
    studentDemographics: analytics?.studentDemographics,
    timeSeriesData: analytics?.timeSeriesData || [],
    isLoading,
    error,
    refetch,
  };
}

export function useInstructorPerformanceAnalytics(filters?: AnalyticsFilters) {
  const { analytics, isLoading, error, refetch } = useCourseAnalytics(filters);
  
  return {
    instructorPerformance: analytics?.instructorPerformance || [],
    courseMetrics: analytics?.courseMetrics,
    isLoading,
    error,
    refetch,
  };
}

export function useContentAnalytics(filters?: AnalyticsFilters) {
  const { analytics, isLoading, error, refetch } = useCourseAnalytics(filters);
  
  return {
    contentAnalytics: analytics?.contentAnalytics,
    courseMetrics: analytics?.courseMetrics,
    isLoading,
    error,
    refetch,
  };
}
