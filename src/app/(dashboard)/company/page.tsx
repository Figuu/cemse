"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useCompanyStats } from "@/hooks/useCompanyStats";
import { useCompanyAnalytics } from "@/hooks/useCompanyAnalytics";
import { ApplicationMetrics } from "@/components/company/ApplicationMetrics";
import { JobPerformanceChart } from "@/components/company/JobPerformanceChart";
import { CandidateInsights } from "@/components/company/CandidateInsights";
import { HiringFunnel } from "@/components/company/HiringFunnel";
import { 
  Building2, 
  Users, 
  Briefcase, 
  TrendingUp, 
  Eye, 
  MessageSquare,
  Settings,
  Plus,
  BarChart3,
  UserCheck,
  Calendar,
  MapPin,
  Globe,
  AlertTriangle
} from "lucide-react";
import { useState } from "react";


function CompanyPageContent() {
  const [activeTab, setActiveTab] = useState<"overview" | "jobs" | "candidates" | "analytics">("overview");
  const { stats, jobPostings, isLoading, error, refetch } = useCompanyStats();
  const { 
    analytics, 
    isLoading: analyticsLoading, 
    error: analyticsError, 
    refetch: refetchAnalytics,
    timeRange,
    setTimeRange 
  } = useCompanyAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Panel de Empresa</h1>
            <p className="text-muted-foreground">Gestiona tus ofertas de trabajo y candidatos</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-1/3"></div>
                </div>
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
            <h1 className="text-2xl font-bold text-foreground">Panel de Empresa</h1>
            <p className="text-muted-foreground">Gestiona tus ofertas de trabajo y candidatos</p>
          </div>
        </div>
        <Card className="p-6">
          <div className="flex items-center space-x-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <p>Error al cargar los datos: {error}</p>
          </div>
          <Button onClick={refetch} className="mt-4">
            Reintentar
          </Button>
        </Card>
      </div>
    );
  }

  const getJobTypeColor = (type: string) => {
    switch (type) {
      case "full-time":
        return "bg-green-100 text-green-800";
      case "part-time":
        return "bg-blue-100 text-blue-800";
      case "contract":
        return "bg-yellow-100 text-yellow-800";
      case "internship":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getJobTypeText = (type: string) => {
    switch (type) {
      case "full-time":
        return "Tiempo Completo";
      case "part-time":
        return "Medio Tiempo";
      case "contract":
        return "Contrato";
      case "internship":
        return "Pasantía";
      default:
        return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "closed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Activa";
      case "paused":
        return "Pausada";
      case "closed":
        return "Cerrada";
      default:
        return status;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mi Empresa</h1>
          <p className="text-muted-foreground">
            Gestiona tu perfil empresarial y ofertas de trabajo
          </p>
        </div>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configuración
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Oferta
          </Button>
        </div>
      </div>

      {/* Company Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">TechCorp Bolivia</h2>
              <p className="text-muted-foreground mb-2">
                Empresa de tecnología especializada en desarrollo de software y soluciones digitales.
              </p>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  La Paz, Bolivia
                </div>
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-1" />
                  www.techcorp.bo
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  50-100 empleados
                </div>
              </div>
            </div>
            <Button variant="outline">
              Editar Perfil
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ofertas Activas</p>
                <p className="text-2xl font-bold">{stats ? stats.activeJobs : '...'}</p>
              </div>
              <Briefcase className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Aplicaciones</p>
                <p className="text-2xl font-bold">{stats ? stats.totalApplications : '...'}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Contratados</p>
                <p className="text-2xl font-bold">{stats ? stats.hiredCandidates : '...'}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vistas del Perfil</p>
                <p className="text-2xl font-bold">{stats ? stats.profileViews : '...'}</p>
              </div>
              <Eye className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "overview", name: "Resumen", icon: BarChart3 },
            { id: "jobs", name: "Ofertas de Trabajo", icon: Briefcase },
            { id: "candidates", name: "Candidatos", icon: UserCheck },
            { id: "analytics", name: "Analíticas", icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "overview" | "jobs" | "candidates" | "analytics")}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Ofertas Recientes</CardTitle>
                <CardDescription>
                  Tus ofertas de trabajo más recientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {jobPostings.slice(0, 3).map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{job.title}</h4>
                        <p className="text-sm text-muted-foreground">{job.department}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(job.status)}>
                          {getStatusText(job.status)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {job.applications} aplicaciones
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
                <CardDescription>
                  Últimas actividades en tu cuenta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm">Nueva aplicación recibida para &quot;Desarrollador Frontend React&quot;</p>
                      <p className="text-xs text-muted-foreground">Hace 2 horas</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm">Candidato contratado para &quot;Especialista en Marketing&quot;</p>
                      <p className="text-xs text-muted-foreground">Hace 1 día</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm">Oferta &quot;Pasante en RRHH&quot; pausada</p>
                      <p className="text-xs text-muted-foreground">Hace 3 días</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "jobs" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Ofertas de Trabajo</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Oferta
            </Button>
          </div>
          
          <div className="space-y-4">
            {jobPostings.map((job) => (
              <Card key={job.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-semibold">{job.title}</h4>
                        <Badge className={getJobTypeColor(job.type)}>
                          {getJobTypeText(job.type)}
                        </Badge>
                        <Badge className={getStatusColor(job.status)}>
                          {getStatusText(job.status)}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-3">{job.department} • {job.location}</p>
                      {job.salary && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {formatCurrency(job.salary.min, job.salary.currency)} - {formatCurrency(job.salary.max, job.salary.currency)}
                        </p>
                      )}
                      <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {job.applications} aplicaciones
                        </div>
                        <div className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          {job.views} vistas
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Publicada {formatDate(job.postedDate)}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Aplicaciones
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === "candidates" && (
        <Card>
          <CardContent className="text-center py-12">
            <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Gestión de Candidatos</h3>
            <p className="text-muted-foreground">
              Aquí podrás ver y gestionar todos los candidatos que han aplicado a tus ofertas.
            </p>
          </CardContent>
        </Card>
      )}

      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* Analytics Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold">Analíticas de Aplicaciones</h3>
              <p className="text-muted-foreground">
                Visualiza el rendimiento de tus ofertas y el engagement de tu perfil empresarial.
              </p>
            </div>
            <div className="flex items-center space-x-2 mt-4 sm:mt-0">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Últimos 7 días</option>
                <option value="30d">Últimos 30 días</option>
                <option value="90d">Últimos 90 días</option>
                <option value="1y">Último año</option>
              </select>
              <Button variant="outline" onClick={refetchAnalytics}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
            </div>
          </div>

          {analyticsLoading ? (
            <div className="space-y-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : analyticsError ? (
            <Card>
              <CardContent className="text-center py-12">
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Error al cargar analíticas</h3>
                <p className="text-muted-foreground mb-4">{analyticsError}</p>
                <Button onClick={refetchAnalytics}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reintentar
                </Button>
              </CardContent>
            </Card>
          ) : analytics ? (
            <div className="space-y-6">
              {/* Application Metrics */}
              <ApplicationMetrics metrics={analytics.applicationMetrics} />

              {/* Job Performance */}
              <JobPerformanceChart jobs={analytics.jobPerformance} />

              {/* Candidate Insights */}
              <CandidateInsights 
                insights={analytics.candidateInsights} 
                demographics={analytics.candidateDemographics} 
              />

              {/* Hiring Funnel */}
              <HiringFunnel funnel={analytics.hiringFunnel} />
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay datos disponibles</h3>
                <p className="text-muted-foreground">
                  Las analíticas aparecerán aquí una vez que tengas ofertas activas y aplicaciones.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export default function CompanyPage() {
  return (
    <RoleGuard allowedRoles={["COMPANY"]}>
      <CompanyPageContent />
    </RoleGuard>
  );
}
