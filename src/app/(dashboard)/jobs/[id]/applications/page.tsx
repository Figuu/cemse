"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft, 
  Briefcase, 
  Users, 
  Eye, 
  Download,
  MessageCircle,
  Calendar,
  MapPin,
  GraduationCap,
  Star,
  Filter,
  Search
} from "lucide-react";
import { useJob, useJobApplications } from "@/hooks/useJobs";
import { useSession } from "next-auth/react";
import { useCompanyByUser } from "@/hooks/useCompanies";
import { ApplicationStatusLabels } from "@/types/company";
import Link from "next/link";

export default function JobApplicationsPage() {
  const params = useParams();
  const { data: session } = useSession();
  const jobId = params.id as string;
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Get the company for the current user
  const { data: company, isLoading: companyLoading } = useCompanyByUser(session?.user?.id || "");
  const { data: job, isLoading: jobLoading } = useJob(company?.id || "", jobId);
  const { data: applicationsData, isLoading: applicationsLoading } = useJobApplications({
    companyId: company?.id,
    jobId: jobId,
  });

  const applications = applicationsData?.applications || [];

  // Filter applications
  const filteredApplications = applications.filter(app => {
    const matchesSearch = !searchTerm || 
      app.applicant.profile?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicant.profile?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicant.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (companyLoading || jobLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 bg-muted rounded"></div>
            <div className="h-8 w-32 bg-muted rounded"></div>
          </div>
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="h-3 bg-muted rounded w-full"></div>
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
            Primero necesitas crear o configurar tu empresa
          </p>
          <Link href="/company">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Ir a Mi Empresa
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Trabajo no encontrado</h3>
          <p className="text-muted-foreground mb-4">
            El trabajo que buscas no existe o no tienes permisos para verlo
          </p>
          <Link href="/jobs">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Trabajos
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/jobs/${jobId}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Aplicaciones - {job.title}
          </h1>
          <p className="text-muted-foreground">
            Gestiona las aplicaciones recibidas para este trabajo
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Total</span>
            </div>
            <p className="text-2xl font-bold">{applications.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium">Pendientes</span>
            </div>
            <p className="text-2xl font-bold">
              {applications.filter(app => app.status === "PENDING").length}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Entrevistados</span>
            </div>
            <p className="text-2xl font-bold">
              {applications.filter(app => app.status === "INTERVIEWED").length}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Contratados</span>
            </div>
            <p className="text-2xl font-bold">
              {applications.filter(app => app.status === "HIRED").length}
            </p>
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
                <input
                  type="text"
                  placeholder="Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-md"
                />
              </div>
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-input rounded-md"
              >
                <option value="all">Todos los estados</option>
                {Object.entries(ApplicationStatusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-input rounded-md"
              >
                <option value="newest">Más recientes</option>
                <option value="oldest">Más antiguos</option>
                <option value="name">Nombre A-Z</option>
                <option value="status">Por estado</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Aplicaciones ({filteredApplications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {applicationsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                      <div className="h-3 bg-muted rounded w-full"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredApplications.length > 0 ? (
            <div className="space-y-4">
              {filteredApplications.map((application) => (
                <Card key={application.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={application.applicant.profile?.avatarUrl} />
                          <AvatarFallback>
                            {application.applicant.profile?.firstName?.[0]}{application.applicant.profile?.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">
                              {application.applicant.profile?.firstName} {application.applicant.profile?.lastName}
                            </h3>
                            <Badge variant={
                              application.status === "HIRED" ? "default" :
                              application.status === "INTERVIEWED" ? "secondary" :
                              application.status === "REJECTED" ? "destructive" :
                              "outline"
                            }>
                              {ApplicationStatusLabels[application.status]}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {application.applicant.email}
                          </p>
                          {application.coverLetter && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {application.coverLetter}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Aplicó el {new Date(application.appliedAt).toLocaleDateString()}
                            </div>
 @                            {(application.applicant.profile as any)?.address && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {(application.applicant.profile as any).address}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {application.resume && (
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            CV
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Contactar
                        </Button>
                        <Button size="sm">
                          Ver Perfil
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm || statusFilter !== "all" ? "No se encontraron aplicaciones" : "No hay aplicaciones"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all" 
                  ? "Intenta ajustar tus filtros de búsqueda"
                  : "Las aplicaciones aparecerán aquí cuando los candidatos se postulen"
                }
              </p>
              {(searchTerm || statusFilter !== "all") && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                >
                  Limpiar Filtros
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
