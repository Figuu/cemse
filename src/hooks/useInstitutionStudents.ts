"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Type definitions for student data
export interface StudentSkills {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface StudentSocialLinks {
  linkedin?: string;
  github?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
}

export interface StudentWorkExperience {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description?: string;
  current: boolean;
}

export interface StudentAchievement {
  title: string;
  description?: string;
  date: string;
  issuer?: string;
}

export interface StudentLanguage {
  name: string;
  proficiency: 'basic' | 'conversational' | 'professional' | 'native';
}

export interface StudentProject {
  name: string;
  description?: string;
  technologies: string[];
  startDate: string;
  endDate?: string;
  url?: string;
}

export interface StudentWebsite {
  name: string;
  url: string;
  description?: string;
}

export interface StudentExtracurricularActivity {
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  role?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface InstitutionStudent {
  id: string;
  studentId: string;
  institutionId: string;
  studentNumber: string;
  enrollmentDate: string;
  status: StudentStatus;
  programId?: string;
  graduationDate?: string;
  gpa?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  student: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    avatarUrl?: string;
    birthDate?: string;
    gender?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    educationLevel?: string;
    currentInstitution?: string;
    graduationYear?: number;
    skills?: string[];
    interests?: string[];
    socialLinks?: StudentSocialLinks;
    workExperience?: StudentWorkExperience[];
    achievements?: StudentAchievement[];
    academicAchievements?: StudentAchievement[];
    currentDegree?: string;
    universityName?: string;
    universityStatus?: string;
    gpa?: number;
    languages?: StudentLanguage[];
    projects?: StudentProject[];
    skillsWithLevel?: StudentSkills[];
    websites?: StudentWebsite[];
    extracurricularActivities?: StudentExtracurricularActivity[];
    professionalSummary?: string;
    targetPosition?: string;
    targetCompany?: string;
    relevantSkills?: string[];
  };
  program?: {
    id: string;
    name: string;
    description?: string;
    level: ProgramLevel;
    duration: number;
    credits?: number;
    status: ProgramStatus;
  };
  institution?: {
    id: string;
    name: string;
    department: string;
    region?: string;
    institutionType: string;
  };
  enrollments?: Array<{
    id: string;
    courseId?: string;
    programId?: string;
    enrollmentDate: string;
    status: EnrollmentStatus;
    grade?: number;
    credits?: number;
    semester?: string;
    year?: number;
    course?: {
      id: string;
      name: string;
      code: string;
      credits: number;
      level: CourseLevel;
      status: CourseStatus;
    };
    program?: {
      id: string;
      name: string;
      level: ProgramLevel;
    };
  }>;
  _count?: {
    enrollments: number;
  };
}

export interface InstitutionProgram {
  id: string;
  name: string;
  description?: string;
  duration: number;
  credits?: number;
  level: ProgramLevel;
  status: ProgramStatus;
  startDate?: string;
  endDate?: string;
  maxStudents?: number;
  currentStudents?: number;
  studentsCount?: number;
  institutionId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    enrollments: number;
    courses: number;
  };
}

export interface InstitutionCourse {
  id: string;
  title: string;
  name?: string;
  description?: string;
  slug?: string;
  code?: string;
  duration?: number;
  credits?: number;
  level: CourseLevel;
  status?: CourseStatus;
  isActive?: boolean;
  institutionId: string;
  programId?: string;
  instructorId?: string;
  publishedAt?: string;
  studentsCount?: number;
  createdAt: string;
  updatedAt: string;
  program?: {
    id: string;
    name: string;
    level: ProgramLevel;
  };
  instructor?: {
    id: string;
    instructor: {
      firstName?: string;
      lastName?: string;
      email?: string;
    };
  };
  _count?: {
    enrollments: number;
  };
}

export type StudentStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "GRADUATED" | "DROPPED_OUT" | "TRANSFERRED";
export type ProgramLevel = "CERTIFICATE" | "DIPLOMA" | "ASSOCIATE" | "BACHELOR" | "MASTER" | "DOCTORATE" | "CONTINUING_EDUCATION";
export type ProgramStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "COMPLETED";
export type EnrollmentStatus = "ACTIVE" | "INACTIVE" | "COMPLETED" | "DROPPED" | "SUSPENDED";
export type CourseLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
export type CourseStatus = "ACTIVE" | "INACTIVE" | "COMPLETED" | "CANCELLED";

export interface StudentFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: StudentStatus;
  programId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ProgramFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: ProgramStatus;
  level?: ProgramLevel;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CourseFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: CourseStatus;
  level?: CourseLevel;
  programId?: string;
  instructorId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export function useInstitutionStudents(institutionId: string, filters: StudentFilters = {}) {
  const query = useQuery({
    queryKey: ["institution-students", institutionId, filters],
    queryFn: async (): Promise<{ students: InstitutionStudent[]; pagination: PaginationInfo }> => {
      const params = new URLSearchParams();
      
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.search) params.append("search", filters.search);
      if (filters.status) params.append("status", filters.status);
      if (filters.programId) params.append("programId", filters.programId);
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

      const response = await fetch(`/api/institutions/${institutionId}/students?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch students");
      }
      return response.json();
    },
    enabled: !!institutionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return query;
}

export function useInstitutionStudent(institutionId: string, studentId: string) {
  return useQuery({
    queryKey: ["institution-student", institutionId, studentId],
    queryFn: async (): Promise<InstitutionStudent> => {
      const response = await fetch(`/api/institutions/${institutionId}/students/${studentId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch student");
      }
      return response.json();
    },
    enabled: !!institutionId && !!studentId,
  });
}

export function useCreateInstitutionStudent(institutionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<InstitutionStudent>): Promise<InstitutionStudent> => {
      const response = await fetch(`/api/institutions/${institutionId}/students`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create student");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["institution-students", institutionId] });
      queryClient.invalidateQueries({ queryKey: ["institution-programs", institutionId] });
    },
  });
}

export function useUpdateInstitutionStudent(institutionId: string, studentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<InstitutionStudent>): Promise<InstitutionStudent> => {
      const response = await fetch(`/api/institutions/${institutionId}/students/${studentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update student");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["institution-students", institutionId] });
      queryClient.invalidateQueries({ queryKey: ["institution-student", institutionId, studentId] });
      queryClient.invalidateQueries({ queryKey: ["institution-programs", institutionId] });
    },
  });
}

export function useDeleteInstitutionStudent(institutionId: string, studentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      const response = await fetch(`/api/institutions/${institutionId}/students/${studentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete student");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["institution-students", institutionId] });
      queryClient.invalidateQueries({ queryKey: ["institution-programs", institutionId] });
    },
  });
}

export function useInstitutionPrograms(institutionId: string, filters: ProgramFilters = {}) {
  const query = useQuery({
    queryKey: ["institution-programs", institutionId, filters],
    queryFn: async (): Promise<{ programs: InstitutionProgram[]; pagination: PaginationInfo }> => {
      const params = new URLSearchParams();
      
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.search) params.append("search", filters.search);
      if (filters.status) params.append("status", filters.status);
      if (filters.level) params.append("level", filters.level);
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

      const response = await fetch(`/api/institutions/${institutionId}/programs?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch programs");
      }
      return response.json();
    },
    enabled: !!institutionId,
  });

  return query;
}

export function useInstitutionCourses(institutionId: string, filters: CourseFilters = {}) {
  const query = useQuery({
    queryKey: ["institution-courses", institutionId, filters],
    queryFn: async (): Promise<{ courses: InstitutionCourse[]; pagination: PaginationInfo }> => {
      const params = new URLSearchParams();
      
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.search) params.append("search", filters.search);
      if (filters.status) params.append("status", filters.status);
      if (filters.level) params.append("level", filters.level);
      if (filters.programId) params.append("programId", filters.programId);
      if (filters.instructorId) params.append("instructorId", filters.instructorId);
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

      const response = await fetch(`/api/institutions/${institutionId}/courses?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch courses");
      }
      return response.json();
    },
    enabled: !!institutionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return query;
}

// Labels for enums
export const STUDENT_STATUS_LABELS = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
  SUSPENDED: "Suspendido",
  GRADUATED: "Graduado",
  DROPPED_OUT: "Abandonó",
  TRANSFERRED: "Transferido",
};

export const PROGRAM_LEVEL_LABELS = {
  CERTIFICATE: "Certificado",
  DIPLOMA: "Diploma",
  ASSOCIATE: "Técnico",
  BACHELOR: "Licenciatura",
  MASTER: "Maestría",
  DOCTORATE: "Doctorado",
  CONTINUING_EDUCATION: "Educación Continua",
};

export const PROGRAM_STATUS_LABELS = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
  SUSPENDED: "Suspendido",
  COMPLETED: "Completado",
};

export const ENROLLMENT_STATUS_LABELS = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
  COMPLETED: "Completado",
  DROPPED: "Abandonado",
  SUSPENDED: "Suspendido",
};

export const COURSE_LEVEL_LABELS = {
  BEGINNER: "Principiante",
  INTERMEDIATE: "Intermedio",
  ADVANCED: "Avanzado",
  EXPERT: "Experto",
};

export const COURSE_STATUS_LABELS = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
  COMPLETED: "Completado",
  CANCELLED: "Cancelado",
};
