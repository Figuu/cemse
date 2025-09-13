"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  BarChart3, 
  TrendingUp, 
  Users, 
  Briefcase, 
  Eye, 
  Heart,
  Share2,
  UserPlus,
  Calendar,
  Target,
  Award,
  Clock,
  Download,
  RefreshCw,
  Filter,
  Settings
} from "lucide-react";
import { CompanyAnalyticsDashboard } from "@/components/analytics/CompanyAnalyticsDashboard";
import { AnalyticsCharts } from "@/components/analytics/AnalyticsCharts";
import { useCompanyAnalytics, useHiringMetrics, ANALYTICS_PERIODS } from "@/hooks/useCompanyAnalytics";
import { useCompany } from "@/hooks/useCompanies";
import Link from "next/link";

export default function CompanyAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;
  const [selectedPeriod, setSelectedPeriod] = useState<"7d" | "30d" | "90d" | "1y" | "all">("30d");
  const [activeTab, setActiveTab] = useState("overview");

  const { data: company, isLoading: companyLoading } = useCompany(companyId);
  const { data: analytics, isLoading: analyticsLoading } = useCompanyAnalytics(companyId, {
    period: selectedPeriod,
  });
  const { data: hiringMetrics, isLoading: hiringLoading } = useHiringMetrics(companyId, {
    period: selectedPeriod,
  });

  if (companyLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 bg-muted rounded"></div>
            <div className="h-8 w-32 bg-muted rounded"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="h-4 bg-muted rounded w-24"></div>
                    <div className="h-8 bg-muted rounded w-16"></div>
                    <div className="h-3 bg-muted rounded w-20"></div>
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
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
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

  if (analyticsLoading || hiringLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="h-8 w-48 bg-muted rounded animate-pulse"></div>
            <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="h-4 bg-muted rounded w-24"></div>
                    <div className="h-8 bg-muted rounded w-16"></div>
                    <div className="h-3 bg-muted rounded w-20"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analytics || !hiringMetrics) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay datos disponibles</h3>
          <p className="text-muted-foreground mb-4">
            No se encontraron datos de analytics para esta empresa
          </p>
          <Link href={`/companies/${companyId}`}>
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a la Empresa
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/companies/${companyId}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            Analytics de {company.name}
          </h1>
          <p className="text-muted-foreground">
            Métricas y estadísticas de rendimiento de la empresa
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="p-2 border rounded-md"
          >
            {ANALYTICS_PERIODS.map((period) => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Trabajos Publicados</p>
                <p className="text-2xl font-bold">{analytics.overview.totalJobs.toLocaleString()}</p>
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
                <p className="text-2xl font-bold">{analytics.overview.totalApplications.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vistas</p>
                <p className="text-2xl font-bold">{analytics.overview.totalViews.toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Seguidores</p>
                <p className="text-2xl font-bold">{analytics.overview.totalFollows.toLocaleString()}</p>
              </div>
              <UserPlus className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tasa de Aplicación</p>
                <p className="text-2xl font-bold">{analytics.conversionRates.viewToApplication.toFixed(1)}%</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tasa de Engagement</p>
                <p className="text-2xl font-bold">{analytics.engagementMetrics.engagementRate.toFixed(1)}%</p>
              </div>
              <Heart className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tiempo Promedio de Contratación</p>
                <p className="text-2xl font-bold">{Math.round(analytics.timeToHire.average)} días</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="charts">Gráficos</TabsTrigger>
          <TabsTrigger value="detailed">Detallado</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <CompanyAnalyticsDashboard companyId={companyId} />
        </TabsContent>

        <TabsContent value="charts" className="space-y-6">
          <AnalyticsCharts analytics={analytics} hiringMetrics={hiringMetrics} />
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          {/* Detailed Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Application Status Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Desglose de Aplicaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics.applicationStatusDistribution).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <span className="capitalize">{status}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{count.toLocaleString()}</span>
                        <span className="text-sm text-muted-foreground">
                          ({((count / analytics.overview.totalApplications) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Application Sources */}
            <Card>
              <CardHeader>
                <CardTitle>Fuentes de Aplicaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics.applicationSources).map(([source, count]) => (
                    <div key={source} className="flex items-center justify-between">
                      <span className="capitalize">{source}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{count.toLocaleString()}</span>
                        <span className="text-sm text-muted-foreground">
                          ({((count / analytics.overview.totalApplications) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Performing Jobs */}
            <Card>
              <CardHeader>
                <CardTitle>Trabajos con Mejor Rendimiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topPerformingJobs.map((job, index) => (
                    <div key={job.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </span>
                        <span className="font-medium">{job.title}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{job.applications} aplicaciones</div>
                        <div className="text-sm text-muted-foreground">
                          {job.applicationRate.toFixed(1)}% tasa
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Hiring Efficiency */}
            <Card>
              <CardHeader>
                <CardTitle>Eficiencia de Contratación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Aplicaciones por Contratación</span>
                    <span className="font-semibold">{hiringMetrics.hiringEfficiency.applicationsPerHire.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Entrevistas por Contratación</span>
                    <span className="font-semibold">{hiringMetrics.hiringEfficiency.interviewsPerHire.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Tiempo de Llenado</span>
                    <span className="font-semibold">{Math.round(hiringMetrics.hiringEfficiency.timeToFill)} días</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
