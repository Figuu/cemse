"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  Users, 
  Clock,
  ExternalLink,
  MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";

interface JobPerformanceChartProps {
  jobs: Array<{
    id: string;
    title: string;
    applications: number;
    views: number;
    conversionRate: number;
    averageResponseTime: number;
    status: string;
    postedAt: string;
  }>;
  className?: string;
}

export function JobPerformanceChart({ jobs, className }: JobPerformanceChartProps) {
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

  const getConversionColor = (rate: number) => {
    if (rate >= 20) return "text-green-600";
    if (rate >= 10) return "text-yellow-600";
    return "text-red-600";
  };

  const sortedJobs = [...jobs].sort((a, b) => b.applications - a.applications);

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          Rendimiento de Ofertas
        </CardTitle>
        <CardDescription>
          Comparación de aplicaciones y conversiones por oferta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {sortedJobs.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay datos disponibles</h3>
              <p className="text-muted-foreground">
                Las métricas de rendimiento aparecerán aquí una vez que tengas ofertas activas.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedJobs.map((job, index) => (
                <div key={job.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-lg">{job.title}</h4>
                        <Badge className={getStatusColor(job.status)}>
                          {getStatusText(job.status)}
                        </Badge>
                        {index < 3 && (
                          <Badge variant="outline" className="text-xs">
                            #{index + 1}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Publicada {formatDate(job.postedAt)}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Users className="h-4 w-4 text-blue-600 mr-1" />
                        <span className="text-sm font-medium text-muted-foreground">Aplicaciones</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">{job.applications}</p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Eye className="h-4 w-4 text-purple-600 mr-1" />
                        <span className="text-sm font-medium text-muted-foreground">Vistas</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-600">{job.views}</p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                        <span className="text-sm font-medium text-muted-foreground">Conversión</span>
                      </div>
                      <p className={cn("text-2xl font-bold", getConversionColor(job.conversionRate))}>
                        {job.conversionRate}%
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Clock className="h-4 w-4 text-orange-600 mr-1" />
                        <span className="text-sm font-medium text-muted-foreground">Respuesta</span>
                      </div>
                      <p className="text-2xl font-bold text-orange-600">{job.averageResponseTime}d</p>
                    </div>
                  </div>

                  {/* Progress Bar for Applications */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progreso de aplicaciones</span>
                      <span className="font-medium">{job.applications} aplicaciones</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min((job.applications / Math.max(...sortedJobs.map(j => j.applications))) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalles
                    </Button>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ver Aplicaciones
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
