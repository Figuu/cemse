"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Briefcase, 
  Users, 
  Eye, 
  TrendingUp,
  Calendar,
  MapPin,
  Clock,
  Target,
  Award
} from "lucide-react";
import { formatLocation } from "@/lib/formatLocation";
import { useJob, useJobApplications } from "@/hooks/useJobs";
import { useSession } from "next-auth/react";
import { useCompanyByUser } from "@/hooks/useCompanies";
import { EmploymentTypeLabels, ExperienceLevelLabels } from "@/types/company";
import Link from "next/link";

export default function JobAnalyticsPage() {
  const params = useParams();
  const { data: session } = useSession();
  const jobId = params.id as string;
  const [timeRange, setTimeRange] = useState("30d");

  // Get the company for the current user
  const { data: company, isLoading: companyLoading } = useCompanyByUser(session?.user?.id || "");
  const { data: job, isLoading: jobLoading } = useJob(company?.id || "", jobId);
  const { data: applicationsData, isLoading: applicationsLoading } = useJobApplications({
    companyId: company?.id,
    jobId: jobId,
  });

  const applications = applicationsData?.applications || [];
  const totalViews = job?.totalViews || 0;
  const totalApplications = applications.length;
  const conversionRate = totalViews > 0 ? (totalApplications / totalViews * 100) : 0;

  // Calculate application status distribution
  const statusDistribution = {
    sent: applications.filter(app => app.status === "SENT").length,
    underReview: applications.filter(app => app.status === "UNDER_REVIEW").length,
    preSelected: applications.filter(app => app.status === "PRE_SELECTED").length,
    hired: applications.filter(app => app.status === "HIRED").length,
    rejected: applications.filter(app => app.status === "REJECTED").length,
  };

  if (companyLoading || jobLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 bg-muted rounded"></div>
            <div className="h-8 w-32 bg-muted rounded"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="h-16 bg-muted rounded"></div>
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
            <TrendingUp className="h-8 w-8 text-primary" />
            Analytics - {job.title}
          </h1>
          <p className="text-muted-foreground">
            Métricas y estadísticas de rendimiento del trabajo
          </p>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2 mb-8">
        {[
          { value: "7d", label: "7 días" },
          { value: "30d", label: "30 días" },
          { value: "90d", label: "90 días" },
          { value: "all", label: "Todo el tiempo" }
        ].map((range) => (
          <Button
            key={range.value}
            variant={timeRange === range.value ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange(range.value)}
          >
            {range.label}
          </Button>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Vistas</span>
            </div>
            <p className="text-2xl font-bold">{(totalViews || 0).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">+12% vs período anterior</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Aplicaciones</span>
            </div>
            <p className="text-2xl font-bold">{totalApplications}</p>
            <p className="text-xs text-muted-foreground">+8% vs período anterior</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Tasa de Conversión</span>
            </div>
            <p className="text-2xl font-bold">{conversionRate.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">+2.1% vs período anterior</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Contratados</span>
            </div>
            <p className="text-2xl font-bold">{statusDistribution.hired}</p>
            <p className="text-xs text-muted-foreground">
              {totalApplications > 0 ? ((statusDistribution.hired / totalApplications) * 100).toFixed(1) : 0}% de aplicaciones
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Application Status Distribution */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Distribución de Aplicaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{statusDistribution.sent}</div>
              <div className="text-sm text-muted-foreground">Enviados</div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div 
                  className="bg-yellow-600 h-2 rounded-full transition-all duration-300" 
                  style={{ 
                    width: `${totalApplications > 0 ? (statusDistribution.sent / totalApplications) * 100 : 0}%`,
                    minWidth: '0%'
                  }}
                ></div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{statusDistribution.underReview}</div>
              <div className="text-sm text-muted-foreground">En Revisión</div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ 
                    width: `${totalApplications > 0 ? (statusDistribution.underReview / totalApplications) * 100 : 0}%`,
                    minWidth: '0%'
                  }}
                ></div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{statusDistribution.preSelected}</div>
              <div className="text-sm text-muted-foreground">Pre-seleccionados</div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                  style={{ 
                    width: `${totalApplications > 0 ? (statusDistribution.preSelected / totalApplications) * 100 : 0}%`,
                    minWidth: '0%'
                  }}
                ></div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{statusDistribution.hired}</div>
              <div className="text-sm text-muted-foreground">Contratados</div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                  style={{ 
                    width: `${totalApplications > 0 ? (statusDistribution.hired / totalApplications) * 100 : 0}%`,
                    minWidth: '0%'
                  }}
                ></div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{statusDistribution.rejected}</div>
              <div className="text-sm text-muted-foreground">Rechazados</div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div 
                  className="bg-red-600 h-2 rounded-full transition-all duration-300" 
                  style={{ 
                    width: `${totalApplications > 0 ? (statusDistribution.rejected / totalApplications) * 100 : 0}%`,
                    minWidth: '0%'
                  }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Details */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Información del Trabajo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Publicado:</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(job.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Estado:</span>
                <Badge variant={job.isActive ? "default" : "secondary"}>
                  {job.isActive ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Ubicación:</span>
                <span className="text-sm text-muted-foreground">{formatLocation(job.location)}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Tipo:</span>
                <span className="text-sm text-muted-foreground">
                  {EmploymentTypeLabels[(job as any).contractType || job.employmentType] || (job as any).contractType || job.employmentType}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Experiencia:</span>
                <span className="text-sm text-muted-foreground">
                  {ExperienceLevelLabels[job.experienceLevel] || job.experienceLevel}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Destacado:</span>
                <Badge variant={((job as any).featured || job.isFeatured) ? "default" : "outline"}>
                  {((job as any).featured || job.isFeatured) ? "Sí" : "No"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Insights de Rendimiento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {totalViews === 0 ? (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Sin datos suficientes</h3>
                <p className="text-muted-foreground">
                  Necesitas más vistas y aplicaciones para generar insights útiles
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">📈 Rendimiento General</h4>
                  <p className="text-sm text-blue-800">
                    Tu trabajo tiene una tasa de conversión del {conversionRate.toFixed(1)}%, 
                    {conversionRate > 5 ? " lo cual es excelente" : conversionRate > 2 ? " lo cual es bueno" : " considera optimizar la descripción"}.
                  </p>
                </div>
                
                {statusDistribution.hired > 0 && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">🎉 Éxito en Contratación</h4>
                    <p className="text-sm text-green-800">
                      Has contratado {statusDistribution.hired} candidato{statusDistribution.hired > 1 ? 's' : ''} 
                      de {totalApplications} aplicaciones ({(statusDistribution.hired / totalApplications * 100).toFixed(1)}%).
                    </p>
                  </div>
                )}
                
                {statusDistribution.sent > 0 && (
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium text-yellow-900 mb-2">⏳ Acción Requerida</h4>
                    <p className="text-sm text-yellow-800">
                      Tienes {statusDistribution.sent} aplicaciones enviadas pendientes de revisión. 
                      Considera revisarlas pronto para no perder candidatos calificados.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
