"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
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
import { useJobApplicationStatus } from "@/hooks/useJobApplicationStatus";
import { JobPosting } from "@/types/company";
import { 
  Search, 
  Filter, 
  Briefcase,
  Grid,
  List,
  AlertCircle,
  Plus,
  Settings,
  BarChart3,
  Users,
  Eye,
  FileText
} from "lucide-react";
import Link from "next/link";
import { safeSum } from "@/lib/utils";

function JobsPageContent() {
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const isCompany = userRole === "COMPANIES";
  const isYouth = userRole === "YOUTH";
  
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
    // For companies, we need to get their company ID and filter by it
    // This would need to be implemented in the hook or we'd need to get the company ID from the session
  });

  const jobs = jobsData?.jobs || [];

  // Get application statuses for all jobs
  const jobIds = jobs.map(job => job.id);
  const { getApplicationStatus } = useJobApplicationStatus(jobIds);

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
          <h1 className="text-2xl font-bold text-foreground">
            {isCompany ? "Gestionar Trabajos" : "Ofertas de Trabajo"}
          </h1>
          <p className="text-muted-foreground">
            {isCompany 
              ? "Administra y publica ofertas de trabajo para tu empresa"
              : `${filteredJobs.length} ofertas encontradas`
            }
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {isCompany && (
            <>
              <Link href="/company">
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Mi Empresa
                </Button>
              </Link>
              <Link href="/jobs/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Trabajo
                </Button>
              </Link>
            </>
          )}
          {isYouth && (
            <>
              <Link href="/applications">
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Mis Aplicaciones
                </Button>
              </Link>
            </>
          )}
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

      {/* Company Stats Section */}
      {isCompany && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Mis Trabajos</span>
              </div>
              <p className="text-2xl font-bold">{filteredJobs.length}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Aplicaciones</span>
              </div>
              <p className="text-2xl font-bold">
                {safeSum(filteredJobs.map(job => job._count?.applications || 0))}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Vistas</span>
              </div>
              <p className="text-2xl font-bold">
                {safeSum(filteredJobs.map(job => job.totalViews || 0))}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Activos</span>
              </div>
              <p className="text-2xl font-bold">
                {filteredJobs.filter(job => job.isActive).length}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

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
              {isCompany ? "No tienes trabajos publicados" : "No se encontraron ofertas"}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {isCompany 
                ? "Comienza creando tu primer trabajo para atraer candidatos"
                : "Intenta ajustar tus filtros de búsqueda"
              }
            </p>
            {isCompany ? (
              <Link href="/jobs/create">
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primer Trabajo
                </Button>
              </Link>
            ) : (
              <Button onClick={clearFilters} className="mt-4">
                Limpiar Filtros
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className={
          viewMode === "grid"
            ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            : "space-y-4"
        }>
          {filteredJobs.map(job => {
            const applicationStatus = getApplicationStatus(job.id);
            return (
              <div key={job.id} className="relative group">
                <JobCard
                  job={job}
                  onBookmark={handleBookmark}
                  onApply={handleApply}
                  showActions={!isCompany}
                  hasApplied={applicationStatus.hasApplied}
                  applicationId={applicationStatus.applicationId}
                />
                {isCompany && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-1">
                      <Link href={`/jobs/${job.id}/edit`}>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/jobs/${job.id}/applications`}>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                          <Users className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/jobs/${job.id}/analytics`}>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
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
    <RoleGuard allowedRoles={["YOUTH", "COMPANIES", "INSTITUTION", "SUPERADMIN"]}>
      <JobsPageContent />
    </RoleGuard>
  );
}
