"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Filter, 
  Briefcase, 
  Users, 
  Eye, 
  Heart,
  Share2,
  Edit,
  Trash2,
  MoreHorizontal,
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  Star
} from "lucide-react";
import { useJobs, useDeleteJob } from "@/hooks/useJobs";
import { useCompany } from "@/hooks/useCompanies";
import { JobCard } from "@/components/jobs/JobCard";
import { EmploymentTypeLabels, ExperienceLevelLabels } from "@/types/company";
import Link from "next/link";

export default function CompanyJobsPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmploymentType, setSelectedEmploymentType] = useState("");
  const [selectedExperienceLevel, setSelectedExperienceLevel] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: company, isLoading: companyLoading } = useCompany(companyId);
  const { data: jobsData, isLoading: jobsLoading } = useJobs({
    companyId,
    page: currentPage,
    limit: 12,
    search: searchTerm,
    employmentType: selectedEmploymentType,
    experienceLevel: selectedExperienceLevel,
    isActive: selectedStatus === "all" ? undefined : selectedStatus === "active",
  });

  const deleteJobMutation = useDeleteJob(companyId, "");

  const jobs = jobsData?.jobs || [];
  const pagination = jobsData?.pagination;

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (filter: string, value: string) => {
    switch (filter) {
      case "employmentType":
        setSelectedEmploymentType(value);
        break;
      case "experienceLevel":
        setSelectedExperienceLevel(value);
        break;
      case "status":
        setSelectedStatus(value);
        break;
    }
    setCurrentPage(1);
  };

  const handleDeleteJob = async (jobId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este trabajo?")) {
      try {
        await deleteJobMutation.mutateAsync();
        // Refresh the jobs list
        window.location.reload();
      } catch (error) {
        console.error("Error deleting job:", error);
      }
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedEmploymentType("");
    setSelectedExperienceLevel("");
    setSelectedStatus("all");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || selectedEmploymentType || selectedExperienceLevel || selectedStatus !== "all";

  if (companyLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 bg-muted rounded"></div>
            <div className="h-8 w-32 bg-muted rounded"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="h-3 bg-muted rounded w-full"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Empresa no encontrada</h3>
          <p className="text-muted-foreground mb-4">
            La empresa que buscas no existe o ha sido eliminada
          </p>
          <Link href="/companies">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Empresas
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href={`/companies/${companyId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Briefcase className="h-8 w-8 text-primary" />
              Trabajos de {company.name}
            </h1>
            <p className="text-muted-foreground">
              Gestiona los trabajos publicados por tu empresa
            </p>
          </div>
        </div>
        <Link href={`/companies/${companyId}/jobs/create`}>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Crear Trabajo
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Total Trabajos</span>
            </div>
            <p className="text-2xl font-bold">{company.totalJobs}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Aplicaciones</span>
            </div>
            <p className="text-2xl font-bold">{company.totalApplications}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Vistas</span>
            </div>
            <p className="text-2xl font-bold">{jobs.reduce((sum, job) => sum + job.totalViews, 0)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">Likes</span>
            </div>
            <p className="text-2xl font-bold">{jobs.reduce((sum, job) => sum + job.totalLikes, 0)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Buscar y Filtrar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar trabajos..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                Limpiar Filtros
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo de Empleo</label>
              <select
                value={selectedEmploymentType}
                onChange={(e) => handleFilterChange("employmentType", e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Todos los tipos</option>
                {Object.entries(EmploymentTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Nivel de Experiencia</label>
              <select
                value={selectedExperienceLevel}
                onChange={(e) => handleFilterChange("experienceLevel", e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Todos los niveles</option>
                {Object.entries(ExperienceLevelLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Estado</label>
              <select
                value={selectedStatus}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Ordenar por</label>
              <select
                className="w-full p-2 border rounded-md"
              >
                <option value="createdAt-desc">Más recientes</option>
                <option value="createdAt-asc">Más antiguos</option>
                <option value="title-asc">Título A-Z</option>
                <option value="title-desc">Título Z-A</option>
                <option value="totalApplications-desc">Más aplicaciones</option>
                <option value="totalViews-desc">Más vistas</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jobs List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Trabajos ({pagination?.total || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {jobsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                      <div className="h-3 bg-muted rounded w-full"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : jobs.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job) => (
                  <div key={job.id} className="relative group">
                    <JobCard
                      job={job}
                      variant="default"
                      showActions={false}
                    />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-1">
                        <Link href={`/companies/${companyId}/jobs/${job.id}/edit`}>
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteJob(job.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-8">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{" "}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} de{" "}
                    {pagination.total} trabajos
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={!pagination.hasPrev}
                    >
                      Anterior
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <Button
                            key={page}
                            variant={page === currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={!pagination.hasNext}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay trabajos publicados</h3>
              <p className="text-muted-foreground mb-4">
                Comienza creando tu primer trabajo para atraer candidatos
              </p>
              <Link href={`/companies/${companyId}/jobs/create`}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primer Trabajo
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
