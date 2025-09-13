"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface InstitutionAnalytics {
  institution: {
    id: string;
    name: string;
    department: string;
    region?: string;
    institutionType: string;
    createdAt: string;
  };
  period: {
    startDate: string;
    endDate: string;
    days: number;
  };
  overview: {
    totalStudents: number;
    totalPrograms: number;
    totalCourses: number;
    totalEnrollments: number;
    totalAnnouncements: number;
    totalEvents: number;
  };
  studentStatusDistribution: Record<string, number>;
  programLevelDistribution: Record<string, number>;
  courseLevelDistribution: Record<string, number>;
  enrollmentStatusDistribution: Record<string, number>;
  dailyMetrics: Array<{
    date: string;
    students: number;
    programs: number;
    courses: number;
    enrollments: number;
    announcements: number;
    events: number;
  }>;
  topPerformingPrograms: Array<{
    id: string;
    name: string;
    level: string;
    enrollments: number;
    courses: number;
    enrollmentRate: number;
  }>;
  topPerformingCourses: Array<{
    id: string;
    name: string;
    code: string;
    level: string;
    enrollments: number;
    enrollmentRate: number;
  }>;
  academicPerformance: {
    averageGrade: number;
    completionRate: number;
    retentionRate: number;
    graduationRate: number;
  };
  engagementMetrics: {
    averageStudentsPerProgram: number;
    averageCoursesPerProgram: number;
    averageEnrollmentsPerCourse: number;
    announcementFrequency: number;
    eventFrequency: number;
  };
}

export interface InstitutionReport {
  id: string;
  title: string;
  type: ReportType;
  status: ReportStatus;
  institutionId: string;
  authorId: string;
  content: string;
  parameters: string;
  generatedAt?: string;
  fileUrl?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

export type ReportType = "STUDENT_ENROLLMENT" | "ACADEMIC_PERFORMANCE" | "ATTENDANCE" | "GRADUATION" | "FINANCIAL" | "INSTRUCTOR_PERFORMANCE" | "COURSE_ANALYSIS" | "CUSTOM";
export type ReportStatus = "DRAFT" | "GENERATING" | "COMPLETED" | "FAILED";

export interface AnalyticsFilters {
  period?: "7d" | "30d" | "90d" | "1y" | "all";
  startDate?: string;
  endDate?: string;
}

export interface ReportFilters {
  page?: number;
  limit?: number;
  type?: ReportType;
  status?: ReportStatus;
  search?: string;
}

export function useInstitutionAnalytics(institutionId: string, filters: AnalyticsFilters = {}) {
  return useQuery({
    queryKey: ["institution-analytics", institutionId, filters],
    queryFn: async (): Promise<InstitutionAnalytics> => {
      const params = new URLSearchParams();
      
      if (filters.period) params.append("period", filters.period);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);

      const response = await fetch(`/api/institutions/${institutionId}/analytics?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch institution analytics");
      }
      return response.json();
    },
    enabled: !!institutionId,
  });
}

export function useInstitutionReports(institutionId: string, filters: ReportFilters = {}) {
  return useQuery({
    queryKey: ["institution-reports", institutionId, filters],
    queryFn: async (): Promise<{ reports: InstitutionReport[]; pagination: any }> => {
      const params = new URLSearchParams();
      
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.type) params.append("type", filters.type);
      if (filters.status) params.append("status", filters.status);
      if (filters.search) params.append("search", filters.search);

      const response = await fetch(`/api/institutions/${institutionId}/reports?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch institution reports");
      }
      return response.json();
    },
    enabled: !!institutionId,
  });
}

export function useCreateInstitutionReport(institutionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<InstitutionReport>): Promise<InstitutionReport> => {
      const response = await fetch(`/api/institutions/${institutionId}/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create report");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["institution-reports", institutionId] });
    },
  });
}

// Predefined period options
export const ANALYTICS_PERIODS = [
  { value: "7d", label: "Últimos 7 días" },
  { value: "30d", label: "Últimos 30 días" },
  { value: "90d", label: "Últimos 90 días" },
  { value: "1y", label: "Último año" },
  { value: "all", label: "Todo el tiempo" },
];

// Report type labels
export const REPORT_TYPE_LABELS = {
  STUDENT_ENROLLMENT: "Inscripción de Estudiantes",
  ACADEMIC_PERFORMANCE: "Rendimiento Académico",
  ATTENDANCE: "Asistencia",
  GRADUATION: "Graduación",
  FINANCIAL: "Financiero",
  INSTRUCTOR_PERFORMANCE: "Rendimiento de Instructores",
  COURSE_ANALYSIS: "Análisis de Cursos",
  CUSTOM: "Personalizado",
};

// Report status labels
export const REPORT_STATUS_LABELS = {
  DRAFT: "Borrador",
  GENERATING: "Generando",
  COMPLETED: "Completado",
  FAILED: "Fallido",
};

// Helper functions for formatting metrics
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

export const formatNumber = (value: number): string => {
  return value.toLocaleString();
};

export const formatDays = (value: number): string => {
  if (value < 1) {
    return `${Math.round(value * 24)} horas`;
  }
  return `${Math.round(value)} días`;
};

// Helper function to calculate growth rate
export const calculateGrowthRate = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

// Helper function to get status color
export const getReportStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-800",
    GENERATING: "bg-yellow-100 text-yellow-800",
    COMPLETED: "bg-green-100 text-green-800",
    FAILED: "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

// Helper function to get report type color
export const getReportTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    STUDENT_ENROLLMENT: "bg-blue-100 text-blue-800",
    ACADEMIC_PERFORMANCE: "bg-green-100 text-green-800",
    ATTENDANCE: "bg-purple-100 text-purple-800",
    GRADUATION: "bg-orange-100 text-orange-800",
    FINANCIAL: "bg-yellow-100 text-yellow-800",
    INSTRUCTOR_PERFORMANCE: "bg-red-100 text-red-800",
    COURSE_ANALYSIS: "bg-indigo-100 text-indigo-800",
    CUSTOM: "bg-gray-100 text-gray-800",
  };
  return colors[type] || "bg-gray-100 text-gray-800";
};

// Helper function to get performance level
export const getPerformanceLevel = (value: number, thresholds: { good: number; excellent: number }): "poor" | "average" | "good" | "excellent" => {
  if (value >= thresholds.excellent) return "excellent";
  if (value >= thresholds.good) return "good";
  if (value > 0) return "average";
  return "poor";
};

// Helper function to get performance color
export const getPerformanceColor = (level: "poor" | "average" | "good" | "excellent"): string => {
  const colors = {
    poor: "text-red-600",
    average: "text-yellow-600",
    good: "text-blue-600",
    excellent: "text-green-600",
  };
  return colors[level];
};
