"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Eye, 
  Users, 
  Briefcase, 
  Download,
  Share2,
  BarChart3,
  Target,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfileAnalytics } from "@/hooks/useProfileAnalytics";
import { EngagementChart } from "@/components/profile/EngagementChart";
import { ProfileInsights } from "@/components/profile/ProfileInsights";


export default function ProfileAnalyticsPage() {
  const { 
    analytics, 
    isLoading, 
    error, 
    refetch, 
    timeRange, 
    setTimeRange 
  } = useProfileAnalytics();

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return "↗";
    if (change < 0) return "↘";
    return "→";
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error al cargar analíticas</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={refetch}>Reintentar</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay datos disponibles</h3>
            <p className="text-muted-foreground">
              Los datos de analíticas aparecerán aquí una vez que tengas actividad en tu perfil.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analíticas del Perfil</h1>
          <p className="text-muted-foreground">
            Insights y métricas sobre tu perfil profesional
          </p>
        </div>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 días</SelectItem>
              <SelectItem value="30d">30 días</SelectItem>
              <SelectItem value="90d">90 días</SelectItem>
              <SelectItem value="1y">1 año</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Compartir
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vistas del Perfil</p>
                <p className="text-2xl font-bold">{analytics.profileViews.total.toLocaleString()}</p>
                <div className="flex items-center text-sm">
                  <span className={cn("font-medium", getChangeColor(analytics.profileViews.change))}>
                    {getChangeIcon(analytics.profileViews.change)} {Math.abs(analytics.profileViews.change)}%
                  </span>
                  <span className="text-muted-foreground ml-1">vs mes anterior</span>
                </div>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Aplicaciones de Trabajo</p>
                <p className="text-2xl font-bold">{analytics.jobApplications.total}</p>
                <div className="flex items-center text-sm">
                  <span className={cn("font-medium", getChangeColor(analytics.jobApplications.change))}>
                    {getChangeIcon(analytics.jobApplications.change)} {Math.abs(analytics.jobApplications.change)}%
                  </span>
                  <span className="text-muted-foreground ml-1">vs mes anterior</span>
                </div>
              </div>
              <Briefcase className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conexiones</p>
                <p className="text-2xl font-bold">{analytics.connections.total}</p>
                <div className="flex items-center text-sm">
                  <span className={cn("font-medium", getChangeColor(analytics.connections.change))}>
                    {getChangeIcon(analytics.connections.change)} {Math.abs(analytics.connections.change)}%
                  </span>
                  <span className="text-muted-foreground ml-1">vs mes anterior</span>
                </div>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completitud del Perfil</p>
                <p className="text-2xl font-bold">{analytics.profileCompleteness.percentage}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${analytics.profileCompleteness.percentage}%` }}
                  />
                </div>
              </div>
              <Target className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Chart */}
      <EngagementChart 
        data={analytics.engagement} 
        timeRange={timeRange}
      />

      {/* Profile Insights */}
      <ProfileInsights analytics={analytics} />
    </div>
  );
}
