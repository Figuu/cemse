"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Candidate {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    phone?: string;
    address?: string;
    birthDate?: string;
    gender?: string;
  };
  jobApplications?: JobApplication[];
  _count?: {
    jobApplications: number;
  };
  experienceLevel?: string;
  availability?: string;
  skills?: string[];
  languages?: string[];
  salaryExpectations?: {
    min: number | null;
    max: number | null;
    currency: string;
  };
  workArrangementPreferences?: {
    office: boolean;
    remote: boolean;
    hybrid: boolean;
  };
  statistics?: {
    totalApplications: number;
    recentApplications: number;
    applicationRate: number;
  };
}

export interface JobApplication {
  id: string;
  jobId: string;
  job: {
    id: string;
    title: string;
    company: {
      id: string;
      name: string;
      logo?: string;
    };
  };
  status: string;
  appliedAt: string;
}

export interface CandidateSearchFilters {
  search?: string;
  skills?: string[];
  experienceLevel?: string;
  location?: string;
  availability?: string;
  education?: string;
  languages?: string[];
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  workArrangement?: string;
  page?: number;
  limit?: number;
  sortBy?: "relevance" | "experience" | "location" | "availability" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface CandidateSearchResponse {
  candidates: Candidate[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: CandidateSearchFilters;
}

export function useCandidates(filters: CandidateSearchFilters = {}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["candidates", filters],
    queryFn: async (): Promise<CandidateSearchResponse> => {
      const params = new URLSearchParams();
      
      if (filters.search) params.append("search", filters.search);
      if (filters.skills?.length) params.append("skills", filters.skills.join(","));
      if (filters.experienceLevel) params.append("experienceLevel", filters.experienceLevel);
      if (filters.location) params.append("location", filters.location);
      if (filters.availability) params.append("availability", filters.availability);
      if (filters.education) params.append("education", filters.education);
      if (filters.languages?.length) params.append("languages", filters.languages.join(","));
      if (filters.salaryMin) params.append("salaryMin", filters.salaryMin.toString());
      if (filters.salaryMax) params.append("salaryMax", filters.salaryMax.toString());
      if (filters.currency) params.append("currency", filters.currency);
      if (filters.workArrangement) params.append("workArrangement", filters.workArrangement);
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

      const response = await fetch(`/api/candidates?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch candidates");
      }
      return response.json();
    },
  });

  return query;
}

export function useCandidate(id: string) {
  return useQuery({
    queryKey: ["candidate", id],
    queryFn: async (): Promise<Candidate> => {
      const response = await fetch(`/api/candidates/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch candidate");
      }
      return response.json();
    },
    enabled: !!id,
  });
}

export function useCandidateStats() {
  return useQuery({
    queryKey: ["candidates", "stats"],
    queryFn: async () => {
      const response = await fetch("/api/candidates/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch candidate stats");
      }
      return response.json();
    },
  });
}

export function useSaveCandidate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (candidateId: string): Promise<void> => {
      const response = await fetch(`/api/candidates/${candidateId}/save`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save candidate");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
    },
  });
}

export function useUnsaveCandidate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (candidateId: string): Promise<void> => {
      const response = await fetch(`/api/candidates/${candidateId}/save`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to unsave candidate");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
    },
  });
}

export function useContactCandidate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      candidateId, 
      message 
    }: { 
      candidateId: string; 
      message: string; 
    }): Promise<void> => {
      const response = await fetch(`/api/candidates/${candidateId}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to contact candidate");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
    },
  });
}

// Predefined filter presets
export const CANDIDATE_FILTER_PRESETS = {
  recent: {
    sortBy: "createdAt" as const,
    sortOrder: "desc" as const,
  },
  experienced: {
    experienceLevel: "SENIOR_LEVEL",
    sortBy: "experience" as const,
    sortOrder: "desc" as const,
  },
  entryLevel: {
    experienceLevel: "ENTRY_LEVEL",
    sortBy: "createdAt" as const,
    sortOrder: "desc" as const,
  },
  available: {
    availability: "IMMEDIATE",
    sortBy: "availability" as const,
    sortOrder: "asc" as const,
  },
  local: {
    sortBy: "location" as const,
    sortOrder: "asc" as const,
  },
};

// Common skills for filtering
export const COMMON_SKILLS = [
  "JavaScript",
  "TypeScript",
  "React",
  "Node.js",
  "Python",
  "Java",
  "C#",
  "PHP",
  "SQL",
  "MongoDB",
  "PostgreSQL",
  "AWS",
  "Docker",
  "Kubernetes",
  "Git",
  "HTML",
  "CSS",
  "Vue.js",
  "Angular",
  "Express.js",
  "Django",
  "Flask",
  "Spring Boot",
  "Laravel",
  "Ruby on Rails",
  "Go",
  "Rust",
  "Swift",
  "Kotlin",
  "Flutter",
  "React Native",
  "iOS",
  "Android",
  "Web Development",
  "Mobile Development",
  "Backend Development",
  "Frontend Development",
  "Full Stack Development",
  "DevOps",
  "Machine Learning",
  "Data Science",
  "UI/UX Design",
  "Graphic Design",
  "Project Management",
  "Agile",
  "Scrum",
  "Product Management",
  "Marketing",
  "Sales",
  "Customer Service",
  "Content Writing",
  "Translation",
  "Teaching",
  "Research",
  "Analysis",
  "Consulting",
];

// Common languages for filtering
export const COMMON_LANGUAGES = [
  "Spanish",
  "English",
  "Portuguese",
  "French",
  "German",
  "Italian",
  "Chinese",
  "Japanese",
  "Korean",
  "Arabic",
  "Russian",
  "Dutch",
  "Swedish",
  "Norwegian",
  "Danish",
  "Finnish",
  "Polish",
  "Czech",
  "Hungarian",
  "Romanian",
  "Bulgarian",
  "Croatian",
  "Serbian",
  "Slovak",
  "Slovenian",
  "Estonian",
  "Latvian",
  "Lithuanian",
  "Greek",
  "Turkish",
  "Hebrew",
  "Hindi",
  "Bengali",
  "Tamil",
  "Telugu",
  "Marathi",
  "Gujarati",
  "Punjabi",
  "Urdu",
  "Thai",
  "Vietnamese",
  "Indonesian",
  "Malay",
  "Tagalog",
  "Swahili",
  "Amharic",
  "Yoruba",
  "Igbo",
  "Hausa",
  "Zulu",
  "Afrikaans",
  "Quechua",
  "Aymara",
  "Guarani",
];

// Experience levels
export const EXPERIENCE_LEVELS = [
  { value: "ENTRY_LEVEL", label: "Nivel Inicial (0-2 años)" },
  { value: "MID_LEVEL", label: "Nivel Medio (2-5 años)" },
  { value: "SENIOR_LEVEL", label: "Nivel Senior (5+ años)" },
  { value: "EXECUTIVE", label: "Ejecutivo (10+ años)" },
  { value: "INTERN", label: "Interno/Practicante" },
];

// Availability options
export const AVAILABILITY_OPTIONS = [
  { value: "IMMEDIATE", label: "Inmediata" },
  { value: "WITHIN_MONTH", label: "Dentro de un mes" },
  { value: "WITHIN_QUARTER", label: "Dentro de 3 meses" },
  { value: "FLEXIBLE", label: "Flexible" },
];

// Work arrangement options
export const WORK_ARRANGEMENT_OPTIONS = [
  { value: "OFFICE", label: "Oficina" },
  { value: "REMOTE", label: "Remoto" },
  { value: "HYBRID", label: "Híbrido" },
];

// Sort options
export const SORT_OPTIONS = [
  { value: "relevance", label: "Relevancia" },
  { value: "experience", label: "Experiencia" },
  { value: "location", label: "Ubicación" },
  { value: "availability", label: "Disponibilidad" },
  { value: "createdAt", label: "Más recientes" },
];
