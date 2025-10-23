import { useState, useEffect, useMemo, useCallback } from "react";
import { useJobs } from "@/hooks/useJobs";
import { JobPosting } from "@/types/company";

interface HybridFilters {
  search?: string;
  employmentType?: string;
  experienceLevel?: string;
  salaryMin?: string;
  salaryMax?: string;
  skills?: string[];
  municipality?: string;
  remote?: string;
  sortBy?: string;
}

interface UseHybridJobsOptions {
  initialFilters?: HybridFilters;
  debounceMs?: number;
}

export function useHybridJobs({ initialFilters = {}, debounceMs = 500 }: UseHybridJobsOptions = {}) {
  const [filters, setFilters] = useState<HybridFilters>({
    search: "",
    employmentType: "all",
    experienceLevel: "all",
    salaryMin: "",
    salaryMax: "",
    skills: [],
    municipality: "all",
    remote: "all",
    sortBy: "newest",
    ...initialFilters,
  });
  const [debouncedFilters, setDebouncedFilters] = useState<HybridFilters>(filters);

  // Debounce effect for server-side filters
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [filters, debounceMs]);

  // Server-side query with debounced filters
  const serverQuery = useJobs({
    search: debouncedFilters.search,
    employmentType: debouncedFilters.employmentType !== "all" ? debouncedFilters.employmentType : undefined,
    experienceLevel: debouncedFilters.experienceLevel !== "all" ? debouncedFilters.experienceLevel : undefined,
    skills: debouncedFilters.skills && debouncedFilters.skills.length > 0 ? debouncedFilters.skills : undefined,
    municipality: debouncedFilters.municipality !== "all" ? debouncedFilters.municipality : undefined,
    remote: debouncedFilters.remote !== "all" ? debouncedFilters.remote : undefined,
    sortBy: debouncedFilters.sortBy,
    limit: 100, // Load more jobs initially
  });

  const allJobs = serverQuery.data?.jobs || [];

  // Client-side filtering function
  const filterJobsClientSide = useCallback((jobs: JobPosting[], clientFilters: HybridFilters): JobPosting[] => {
    return jobs.filter(job => {
      // Search filter
      if (clientFilters.search && clientFilters.search.trim()) {
        const searchTerm = clientFilters.search.toLowerCase();
        const matchesSearch = 
          job.title.toLowerCase().includes(searchTerm) ||
          job.description.toLowerCase().includes(searchTerm) ||
          job.company.name.toLowerCase().includes(searchTerm) ||
          (job.skills && job.skills.some(skill => skill.toLowerCase().includes(searchTerm)));
        
        if (!matchesSearch) return false;
      }

      // Employment type filter
      if (clientFilters.employmentType && clientFilters.employmentType !== "all") {
        if (job.type !== clientFilters.employmentType) return false;
      }

      // Experience level filter
      if (clientFilters.experienceLevel && clientFilters.experienceLevel !== "all") {
        if (job.experience !== clientFilters.experienceLevel) return false;
      }

      // Salary range filter
      if (clientFilters.salaryMin || clientFilters.salaryMax) {
        const jobSalaryMin = job.salaryMin || job.salary?.min || 0;
        const jobSalaryMax = job.salaryMax || job.salary?.max || 0;
        
        if (clientFilters.salaryMin && clientFilters.salaryMin.trim()) {
          const minSalary = parseInt(clientFilters.salaryMin);
          if (!isNaN(minSalary) && jobSalaryMax > 0 && jobSalaryMax < minSalary) return false;
        }
        
        if (clientFilters.salaryMax && clientFilters.salaryMax.trim()) {
          const maxSalary = parseInt(clientFilters.salaryMax);
          if (!isNaN(maxSalary) && jobSalaryMin > 0 && jobSalaryMin > maxSalary) return false;
        }
      }

      // Skills filter
      if (clientFilters.skills && clientFilters.skills.length > 0) {
        const jobSkills = job.skills || [];
        const hasRequiredSkills = clientFilters.skills.some(requiredSkill => 
          jobSkills.some(jobSkill => 
            jobSkill.toLowerCase().includes(requiredSkill.toLowerCase()) ||
            requiredSkill.toLowerCase().includes(jobSkill.toLowerCase())
          )
        );
        if (!hasRequiredSkills) return false;
      }

      // Municipality filter
      if (clientFilters.municipality && clientFilters.municipality !== "all") {
        const companyInstitutionName = job.company?.institution?.name;
        if (!companyInstitutionName || companyInstitutionName !== clientFilters.municipality) {
          return false;
        }
      }

      // Remote work filter
      if (clientFilters.remote && clientFilters.remote !== "all") {
        const isRemote = job.remote || false;
        if (clientFilters.remote === "yes" && !isRemote) return false;
        if (clientFilters.remote === "no" && isRemote) return false;
        if (clientFilters.remote === "hybrid" && !isRemote) return false;
      }

      return true;
    });
  }, []);

  // Determine which jobs to show
  const displayedJobs = useMemo(() => {
    // If filters are still debouncing, show client-filtered results
    if (JSON.stringify(filters) !== JSON.stringify(debouncedFilters)) {
      return filterJobsClientSide(allJobs, filters);
    }
    // Otherwise show server-filtered results
    return filterJobsClientSide(allJobs, debouncedFilters);
  }, [filters, debouncedFilters, allJobs, filterJobsClientSide]);

  // Sorting
  const sortedJobs = useMemo(() => {
    const jobsToSort = [...displayedJobs];
    
    switch (filters.sortBy) {
      case "newest":
        return jobsToSort.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case "oldest":
        return jobsToSort.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case "salary-high":
        return jobsToSort.sort((a, b) => {
          const aSalary = a.salaryMin || a.salary?.min || 0;
          const bSalary = b.salaryMin || b.salary?.min || 0;
          return bSalary - aSalary;
        });
      case "salary-low":
        return jobsToSort.sort((a, b) => {
          const aSalary = a.salaryMin || a.salary?.min || 0;
          const bSalary = b.salaryMin || b.salary?.min || 0;
          return aSalary - bSalary;
        });
      case "title":
        return jobsToSort.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return jobsToSort;
    }
  }, [displayedJobs, filters.sortBy]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<HybridFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      search: "",
      employmentType: "all",
      experienceLevel: "all",
      salaryMin: "",
      salaryMax: "",
      skills: [],
      municipality: "all",
      remote: "all",
      sortBy: "newest",
    });
  }, []);

  return {
    jobs: sortedJobs,
    allJobs,
    isLoading: serverQuery.isLoading,
    error: serverQuery.error,
    refetch: serverQuery.refetch,
    filters,
    updateFilters,
    clearFilters,
    isDebouncing: JSON.stringify(filters) !== JSON.stringify(debouncedFilters),
  };
}