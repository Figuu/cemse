"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JobCard } from "@/components/jobs/JobCard";
import { JobFilters } from "@/components/jobs/JobFilters";
import { JobApplicationForm } from "@/components/jobs/JobApplicationForm";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useJobs } from "@/hooks/useJobs";
import { JobPosting } from "@/types/company";
import { 
  Search, 
  Filter, 
  Briefcase,
  Grid,
  List,
  AlertCircle
} from "lucide-react";

function JobsPageContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    location: "",
    type: "",
    experience: "",
    salary: "",
    remote: "",
    skills: [] as string[],
  });
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  const { 
    data: jobsData, 
    isLoading, 
    error, 
    refetch
  } = useJobs({
    search: searchTerm || undefined,
    location: selectedFilters.location || undefined,
    employmentType: selectedFilters.type || undefined,
    experienceLevel: selectedFilters.experience || undefined,
    sortBy: sortBy,
  });

  const jobs = jobsData?.jobs || [];

  // Placeholder functions for bookmarking and applying
  const bookmarkJob = async (jobId: string) => {
    // TODO: Implement bookmark functionality
    console.log('Bookmarking job:', jobId);
  };

  const unbookmarkJob = async (jobId: string) => {
    // TODO: Implement unbookmark functionality
    console.log('Unbookmarking job:', jobId);
  };

  const applyToJob = async (jobId: string, applicationData: any) => {
    // TODO: Implement job application functionality
    console.log('Applying to job:', jobId, applicationData);
  };


  // Filtering is now handled by the API, so we just use the jobs directly
  const filteredJobs = jobs;


  const handleBookmark = async (jobId: string) => {
    try {
      // For now, just bookmark the job (could be enhanced with actual bookmark state)
      await bookmarkJob(jobId);
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    }
  };

  const handleApply = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      setSelectedJob(job);
      setShowApplicationForm(true);
    }
  };

  const handleApplicationSubmit = async (applicationData: Record<string, unknown>) => {
    if (!selectedJob) return;
    
    try {
      await applyToJob(selectedJob.id, applicationData);
      setShowApplicationForm(false);
      setSelectedJob(null);
    } catch (error) {
      console.error("Error applying to job:", error);
    }
  };

  const handleCloseApplicationForm = () => {
    setShowApplicationForm(false);
    setSelectedJob(null);
  };

  const clearFilters = () => {
    setSelectedFilters({
      location: "",
      type: "",
      experience: "",
      salary: "",
      remote: "",
      skills: [],
    });
    setSearchTerm("");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Ofertas de Trabajo</h1>
            <p className="text-muted-foreground">Encuentra tu próximo trabajo ideal</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Ofertas de Trabajo</h1>
            <p className="text-muted-foreground">Encuentra tu próximo trabajo ideal</p>
          </div>
        </div>
        <Card className="p-6">
          <div className="flex items-center space-x-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>Error al cargar las ofertas: {error?.message || 'Error desconocido'}</p>
          </div>
          <Button onClick={() => refetch()} className="mt-4">
            Reintentar
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ofertas de Trabajo</h1>
          <p className="text-muted-foreground">
            {filteredJobs.length} ofertas encontradas
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <div className="flex items-center border rounded-lg">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, empresa, habilidades..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <JobFilters
            filters={selectedFilters}
            onFiltersChange={setSelectedFilters}
            onClearFilters={clearFilters}
          />
        )}

        {/* Sort */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Label htmlFor="sort">Ordenar por:</Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Más recientes</SelectItem>
                <SelectItem value="oldest">Más antiguos</SelectItem>
                <SelectItem value="salary-high">Mayor salario</SelectItem>
                <SelectItem value="salary-low">Menor salario</SelectItem>
                <SelectItem value="title">Título A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>


      {/* Job Listings */}
      {filteredJobs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No se encontraron ofertas
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Intenta ajustar tus filtros de búsqueda
            </p>
            <Button onClick={clearFilters} className="mt-4">
              Limpiar Filtros
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className={
          viewMode === "grid"
            ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            : "space-y-4"
        }>
          {filteredJobs.map(job => (
            <JobCard
              key={job.id}
              job={job}
              onBookmark={handleBookmark}
              onApply={handleApply}
            />
          ))}
        </div>
      )}

      {/* Application Form Modal */}
      {showApplicationForm && selectedJob && (
        <JobApplicationForm
          job={selectedJob}
          onClose={handleCloseApplicationForm}
          onSubmit={handleApplicationSubmit}
        />
      )}
    </div>
  );
}

export default function JobsPage() {
  return (
    <RoleGuard allowedRoles={["YOUTH", "COMPANY", "INSTITUTION", "ADMIN"]}>
      <JobsPageContent />
    </RoleGuard>
  );
}
