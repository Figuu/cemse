"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
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
  DollarSign,
  Filter,
  Download,
  RefreshCw
} from "lucide-react";
import { useCompanyAnalytics, useHiringMetrics, ANALYTICS_PERIODS, formatPercentage, formatNumber, formatDays, calculateGrowthRate, getStatusColor, getPerformanceLevel, getPerformanceColor } from "@/hooks/useCompanyAnalytics";
import { CompanyAnalytics, HiringMetrics } from "@/hooks/useCompanyAnalytics";

interface CompanyAnalyticsDashboardProps {
  companyId: string;
}

export function CompanyAnalyticsDashboard({ companyId }: CompanyAnalyticsDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<"7d" | "30d" | "90d" | "1y" | "all">("30d");
  const [activeTab, setActiveTab] = useState("overview");

  const { data: analytics, isLoading: analyticsLoading } = useCompanyAnalytics(companyId, {
    period: selectedPeriod,
  });

  const { data: hiringMetrics, isLoading: hiringLoading } = useHiringMetrics(companyId, {
    period: selectedPeriod,
  });

  if (analyticsLoading || hiringLoading) {
    return (
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
    );
  }

  if (!analytics || !hiringMetrics) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No hay datos disponibles</h3>
        <p className="text-muted-foreground">
          No se encontraron datos de analytics para esta empresa
        </p>
      </div>
    );
  }

  const getPerformanceLevel = (value: number, thresholds: { good: number; excellent: number }) => {
    if (value >= thresholds.excellent) return "excellent";
    if (value >= thresholds.good) return "good";
    if (value > 0) return "average";
    return "poor";
  };

  const getPerformanceColor = (level: "poor" | "average" | "good" | "excellent") => {
    const colors = {
      poor: "text-red-600",
      average: "text-yellow-600",
      good: "text-blue-600",
      excellent: "text-green-600",
    };
    return colors[level];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics de {analytics.company.name}</h2>
          <p className="text-muted-foreground">
            Período: {ANALYTICS_PERIODS.find(p => p.value === selectedPeriod)?.label}
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

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Trabajos Publicados</p>
                <p className="text-2xl font-bold">{formatNumber(analytics.overview.totalJobs)}</p>
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
                <p className="text-2xl font-bold">{formatNumber(analytics.overview.totalApplications)}</p>
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
                <p className="text-2xl font-bold">{formatNumber(analytics.overview.totalViews)}</p>
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
                <p className="text-2xl font-bold">{formatNumber(analytics.overview.totalFollows)}</p>
              </div>
              <UserPlus className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tasa de Aplicación</p>
                <p className="text-2xl font-bold">{formatPercentage(analytics.conversionRates.viewToApplication)}</p>
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
                <p className="text-2xl font-bold">{formatPercentage(analytics.engagementMetrics.engagementRate)}</p>
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
                <p className="text-2xl font-bold">{formatDays(analytics.timeToHire.average)}</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="hiring">Contratación</TabsTrigger>
          <TabsTrigger value="jobs">Trabajos</TabsTrigger>
          <TabsTrigger value="candidates">Candidatos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Application Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Aplicaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {Object.entries(analytics.applicationStatusDistribution).map(([status, count]) => (
                  <div key={status} className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold mb-1">{count}</div>
                    <div className="text-sm text-muted-foreground">{status}</div>
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(analytics.applicationSources).map(([source, count]) => (
                  <div key={source} className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold mb-1">{count}</div>
                    <div className="text-sm text-muted-foreground capitalize">{source}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Hiring Funnel */}
          <Card>
            <CardHeader>
              <CardTitle>Embudo de Contratación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analytics.hiringFunnel).map(([stage, count], index) => (
                  <div key={stage} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </div>
                      <span className="font-medium capitalize">{stage}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{formatNumber(count)}</span>
                      {index > 0 && (
                        <span className="text-sm text-muted-foreground">
                          {formatPercentage((count / analytics.hiringFunnel.views) * 100)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hiring" className="space-y-6">
          {/* Hiring Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Aplicaciones</p>
                    <p className="text-2xl font-bold">{formatNumber(hiringMetrics.overview.totalApplications)}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Contratados</p>
                    <p className="text-2xl font-bold text-green-600">{formatNumber(hiringMetrics.overview.hiredApplications)}</p>
                  </div>
                  <Award className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tasa de Contratación</p>
                    <p className="text-2xl font-bold">{formatPercentage(hiringMetrics.conversionRates.overallHireRate)}</p>
                  </div>
                  <Target className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tiempo Promedio</p>
                    <p className="text-2xl font-bold">{formatDays(hiringMetrics.timeMetrics.averageTimeToHire)}</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Conversion Rates */}
          <Card>
            <CardHeader>
              <CardTitle>Tasas de Conversión</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(hiringMetrics.conversionRates).map(([stage, rate]) => (
                  <div key={stage} className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold mb-1">{formatPercentage(rate)}</div>
                    <div className="text-sm text-muted-foreground capitalize">{stage.replace(/([A-Z])/g, ' $1').trim()}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Time Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Métricas de Tiempo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(hiringMetrics.timeMetrics).map(([metric, time]) => (
                  <div key={metric} className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold mb-1">{formatDays(time)}</div>
                    <div className="text-sm text-muted-foreground capitalize">{metric.replace(/([A-Z])/g, ' $1').trim()}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-6">
          {/* Top Performing Jobs */}
          <Card>
            <CardHeader>
              <CardTitle>Trabajos con Mejor Rendimiento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topPerformingJobs.map((job, index) => (
                  <div key={job.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold">{job.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatNumber(job.applications)} aplicaciones • {formatNumber(job.views)} vistas
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{formatPercentage(job.applicationRate)}</div>
                      <div className="text-sm text-muted-foreground">Tasa de aplicación</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="candidates" className="space-y-6">
          {/* Candidate Quality Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Calidad de Candidatos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold mb-1">{analytics.candidateQuality.averageExperience}</div>
                  <div className="text-sm text-muted-foreground">Años de Experiencia</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold mb-1">{analytics.candidateQuality.averageEducation}</div>
                  <div className="text-sm text-muted-foreground">Nivel de Educación</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold mb-1">{analytics.candidateQuality.averageSkills}</div>
                  <div className="text-sm text-muted-foreground">Habilidades Promedio</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold mb-1">{analytics.candidateQuality.averageLanguages}</div>
                  <div className="text-sm text-muted-foreground">Idiomas Promedio</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
