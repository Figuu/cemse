"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JobCard } from "@/components/jobs/JobCard";
import { JobFilters } from "@/components/jobs/JobFilters";
import { JobApplicationModal } from "@/components/jobs/JobApplicationModal";
import { JobChatInterface } from "@/components/jobs/JobChatInterface";
import { JobApplicationChat } from "@/components/jobs/JobApplicationChat";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useHybridJobs } from "@/hooks/useHybridJobs";
import { useJobApplicationStatus } from "@/hooks/useJobApplicationStatus";
import { useMunicipalities } from "@/hooks/useMunicipalities";
import { JobPosting } from "@/types/company";
import { useQuery } from "@tanstack/react-query";
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
  FileText,
  MessageCircle
} from "lucide-react";
import Link from "next/link";
import { safeSum } from "@/lib/utils";

function JobsPageContent() {
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const isCompany = userRole === "COMPANIES";
  const isYouth = userRole === "YOUTH";
  const isAdmin = userRole === "SUPERADMIN" || userRole === "INSTITUTION";
  
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);

  // Use hybrid jobs hook
  const {
    jobs,
    isLoading,
    error,
    refetch,
    filters,
    updateFilters,
    clearFilters,
    isDebouncing
  } = useHybridJobs({
    debounceMs: 500, // 500ms debounce
  });

  // Fetch municipalities for the filter
  const { data: municipalitiesData, isLoading: municipalitiesLoading } = useMunicipalities();
  const municipalityInstitutions = municipalitiesData?.municipalities || [];

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


  const handleCloseApplicationForm = () => {
    setShowApplicationForm(false);
    setSelectedJob(null);
  };

  const handleOpenChat = (applicationId: string) => {
    setSelectedApplicationId(applicationId);
    setShowChat(true);
  };

  const handleCloseChat = () => {
    setShowChat(false);
    setSelectedApplicationId(null);
  };

  const handleFiltersChange = (newFilters: {
    type: string;
    experience: string;
    salaryMin: string;
    salaryMax: string;
    currency: string;
    remote: string;
    skills: string[];
  }) => {
    updateFilters({
      employmentType: newFilters.type,
      experienceLevel: newFilters.experience,
      salaryMin: newFilters.salaryMin,
      salaryMax: newFilters.salaryMax,
      currency: newFilters.currency,
      remote: newFilters.remote,
      skills: newFilters.skills,
    });
  };

  const handleMunicipalityChange = (value: string) => {
    updateFilters({ municipality: value });
  };

  const handleSearchChange = (value: string) => {
    updateFilters({ search: value });
  };

  const handleSortChange = (value: string) => {
    updateFilters({ sortBy: value });
  };

  const handleClearFilters = () => {
    clearFilters();
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
    <JobChatInterface 
      jobId={selectedJob?.id || ""}
      selectedApplicationId={selectedApplicationId}
      onOpenChat={handleOpenChat}
      applications={[]} // This would be populated with actual applications data
    >
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 xl:flex-row xl:items-start xl:justify-between xl:space-y-0">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold text-foreground sm:text-2xl xl:text-3xl">
            {isCompany ? "Gestionar Trabajos" : isAdmin ? "Administrar Ofertas de Trabajo" : "Ofertas de Trabajo"}
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base mt-1">
            {isCompany 
              ? "Administra y publica ofertas de trabajo para tu empresa"
              : isAdmin 
                ? "Supervisa y administra todas las ofertas de trabajo del sistema"
                : `${jobs.length} ofertas encontradas`
            }
          </p>
        </div>
        <div className="flex flex-col space-y-3 xl:flex-row xl:items-center xl:space-y-0 xl:space-x-3 xl:flex-shrink-0">
          <div className="flex items-center space-x-2">
            {isCompany && (
              <>
                <Link href="/company">
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    <Settings className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Mi Empresa</span>
                    <span className="sm:hidden">Empresa</span>
                  </Button>
                </Link>
                <Link href="/jobs/create">
                  <Button size="sm" className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Crear Trabajo</span>
                    <span className="sm:hidden">Crear</span>
                  </Button>
                </Link>
              </>
            )}
            {isYouth && (
              <Link href="/applications">
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  <FileText className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Mis Aplicaciones</span>
                  <span className="sm:hidden">Aplicaciones</span>
                </Button>
              </Link>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex-1 sm:flex-none"
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
      </div>

      {/* Company Stats Section */}
      {isCompany && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 xl:p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-sm xl:text-base font-medium">Mis Trabajos</span>
              </div>
              <p className="text-2xl xl:text-3xl font-bold text-blue-600">{jobs.length}</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 xl:p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <span className="text-sm xl:text-base font-medium">Aplicaciones</span>
              </div>
              <p className="text-2xl xl:text-3xl font-bold text-green-600">
                {safeSum(jobs.map(job => job._count?.applications || 0))}
              </p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 xl:p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Eye className="h-5 w-5 text-purple-600" />
                </div>
                <span className="text-sm xl:text-base font-medium">Vistas</span>
              </div>
              <p className="text-2xl xl:text-3xl font-bold text-purple-600">
                {safeSum(jobs.map(job => job.totalViews || 0))}
              </p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 xl:p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-orange-600" />
                </div>
                <span className="text-sm xl:text-base font-medium">Activos</span>
              </div>
              <p className="text-2xl xl:text-3xl font-bold text-orange-600">
                {jobs.filter(job => job.isActive).length}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <div className="space-y-4 xl:space-y-6">
        {/* Search Bar */}
        <div className="relative max-w-2xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, empresa, habilidades..."
            value={filters.search || ""}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 h-11 xl:h-12 text-sm xl:text-base"
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-gray-50 rounded-lg p-4 xl:p-6">
            <JobFilters
              filters={{
                type: filters.employmentType || "all",
                experience: filters.experienceLevel || "all",
                salaryMin: filters.salaryMin || "",
                salaryMax: filters.salaryMax || "",
                currency: filters.currency || "all",
                remote: filters.remote || "all",
                skills: filters.skills || [],
              }}
              selectedMunicipality={filters.municipality || "all"}
              onMunicipalityChange={handleMunicipalityChange}
              municipalityInstitutions={municipalityInstitutions}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
            />
          </div>
        )}

        {/* Sort */}
        <div className="flex flex-col space-y-3 xl:flex-row xl:items-center xl:justify-between xl:space-y-0">
          <div className="flex flex-col space-y-2 xl:flex-row xl:items-center xl:space-y-0 xl:space-x-3">
            <Label htmlFor="sort" className="text-sm xl:text-base font-medium">Ordenar por:</Label>
            <Select value={filters.sortBy || "newest"} onValueChange={handleSortChange}>
              <SelectTrigger className="w-full xl:w-56 h-11 xl:h-12">
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
          <div className="text-sm xl:text-base text-muted-foreground">
            Mostrando {jobs.length} {jobs.length === 1 ? 'oferta' : 'ofertas'}
            {isDebouncing && (
              <span className="ml-2 text-blue-600">
                (actualizando filtros...)
              </span>
            )}
          </div>
        </div>
      </div>


      {/* Job Listings */}
      {jobs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {isCompany ? "No tienes trabajos publicados" : isAdmin ? "No hay ofertas de trabajo" : "No se encontraron ofertas"}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {isCompany 
                ? "Comienza creando tu primer trabajo para atraer candidatos"
                : isAdmin
                  ? "No hay ofertas de trabajo en el sistema en este momento"
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
            ? "grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3"
            : "space-y-4 sm:space-y-6 lg:space-y-8"
        }>
          {jobs.map(job => {
            const applicationStatus = getApplicationStatus(job.id);
            return (
              <div key={job.id} className="relative group">
                <JobCard
                  job={job}
                  currentUserId={session?.user?.id}
                  onBookmark={handleBookmark}
                  onApply={handleApply}
                  showActions={!isCompany && !isAdmin}
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
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          setSelectedJob(job);
                          setShowChat(true);
                        }}
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
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

      {/* Application Modal */}
      {showApplicationForm && selectedJob && (
        <JobApplicationModal
          isOpen={showApplicationForm}
          onClose={handleCloseApplicationForm}
          jobId={selectedJob.id}
          jobTitle={selectedJob.title}
          companyName={selectedJob.company?.name || "Empresa"}
          job={selectedJob}
        />
      )}
      </div>
    </JobChatInterface>
  );
}

export default function JobsPage() {
  return (
    <RoleGuard allowedRoles={["YOUTH", "COMPANIES", "INSTITUTION", "SUPERADMIN"]}>
      <JobsPageContent />
    </RoleGuard>
  );
}
