"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Clock,
  CheckCircle,
  XCircle,
  Star,
  Target,
  Calendar,
  Download,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ApplicationAnalyticsProps {
  applications: Array<{
    id: string;
    status: string;
    appliedDate: string;
    daysSinceApplied: number;
    responseTime: number | null;
    priority: string;
    company: string;
  }>;
  className?: string;
}

export function ApplicationAnalytics({ applications, className }: ApplicationAnalyticsProps) {
  // Calculate analytics
  const totalApplications = applications.length;
  const activeApplications = applications.filter(app => 
    !["rejected", "offered"].includes(app.status)
  ).length;
  const successRate = totalApplications > 0 ? 
    (applications.filter(app => app.status === "offered").length / totalApplications) * 100 : 0;
  
  const averageResponseTime = applications
    .filter(app => app.responseTime !== null)
    .reduce((sum, app) => sum + (app.responseTime || 0), 0) / 
    applications.filter(app => app.responseTime !== null).length || 0;

  const statusDistribution = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const priorityDistribution = applications.reduce((acc, app) => {
    acc[app.priority] = (acc[app.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const companyDistribution = applications.reduce((acc, app) => {
    acc[app.company] = (acc[app.company] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCompanies = Object.entries(companyDistribution)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "applied": return "text-blue-600";
      case "reviewing": return "text-yellow-600";
      case "shortlisted": return "text-purple-600";
      case "interview": return "text-orange-600";
      case "offered": return "text-green-600";
      case "rejected": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600";
      case "medium": return "text-yellow-600";
      case "low": return "text-green-600";
      default: return "text-gray-600";
    }
  };

  const getTrendIcon = (value: number, threshold: number) => {
    if (value > threshold) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (value < threshold) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Clock className="h-4 w-4 text-yellow-600" />;
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Aplicaciones</p>
                <p className="text-2xl font-bold">{totalApplications}</p>
                <div className="flex items-center text-sm">
                  {getTrendIcon(totalApplications, 10)}
                  <span className="ml-1 text-muted-foreground">este mes</span>
                </div>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Aplicaciones Activas</p>
                <p className="text-2xl font-bold">{activeApplications}</p>
                <div className="flex items-center text-sm">
                  {getTrendIcon(activeApplications, 5)}
                  <span className="ml-1 text-muted-foreground">en proceso</span>
                </div>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tasa de Éxito</p>
                <p className="text-2xl font-bold">{successRate.toFixed(1)}%</p>
                <div className="flex items-center text-sm">
                  <Target className="h-4 w-4 mr-1 text-green-600" />
                  {getTrendIcon(successRate, 20)}
                  <span className="ml-1 text-muted-foreground">ofertas recibidas</span>
                </div>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tiempo Promedio</p>
                <p className="text-2xl font-bold">{averageResponseTime.toFixed(1)}</p>
                <div className="flex items-center text-sm">
                  {getTrendIcon(averageResponseTime, 7)}
                  <span className="ml-1 text-muted-foreground">días</span>
                </div>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Estado</CardTitle>
            <CardDescription>
              Estado actual de tus aplicaciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(statusDistribution).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {status === "rejected" ? (
                      <XCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <div className={cn("w-3 h-3 rounded-full", {
                        "bg-blue-500": status === "applied",
                        "bg-yellow-500": status === "reviewing",
                        "bg-purple-500": status === "shortlisted",
                        "bg-orange-500": status === "interview",
                        "bg-green-500": status === "offered",
                      })} />
                    )}
                    <span className={cn("text-sm font-medium capitalize", getStatusColor(status))}>{status}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">{count}</span>
                    <Badge variant="outline">
                      {((count / totalApplications) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución por Prioridad</CardTitle>
            <CardDescription>
              Prioridad de tus aplicaciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(priorityDistribution).map(([priority, count]) => (
                <div key={priority} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Star className={cn("h-4 w-4", getPriorityColor(priority))} />
                    <span className={cn("text-sm font-medium capitalize", getPriorityColor(priority))}>{priority}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">{count}</span>
                    <Badge variant="outline">
                      {((count / totalApplications) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Companies */}
      <Card>
        <CardHeader>
          <CardTitle>Empresas Más Aplicadas</CardTitle>
          <CardDescription>
            Empresas a las que has aplicado más frecuentemente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topCompanies.map(([company, count]) => (
              <div key={company} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {company.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium">{company}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">{count} aplicaciones</span>
                  <Badge variant="outline">
                    {((count / totalApplications) * 100).toFixed(1)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2">
        <Button variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar Datos
        </Button>
      </div>
    </div>
  );
}

