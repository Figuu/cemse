"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  UserPlus, 
  Clock, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ApplicationMetricsProps {
  metrics: {
    total: number;
    new: number;
    byStatus: Record<string, number>;
    averageResponseTime: number;
    conversionRate: number;
  };
  className?: string;
}

export function ApplicationMetrics({ metrics, className }: ApplicationMetricsProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "SENT":
        return { label: "Enviadas", color: "bg-blue-100 text-blue-800", icon: Clock };
      case "UNDER_REVIEW":
        return { label: "En Revisión", color: "bg-yellow-100 text-yellow-800", icon: AlertCircle };
      case "PRE_SELECTED":
        return { label: "Preseleccionadas", color: "bg-purple-100 text-purple-800", icon: UserPlus };
      case "HIRED":
        return { label: "Contratadas", color: "bg-green-100 text-green-800", icon: CheckCircle };
      case "REJECTED":
        return { label: "Rechazadas", color: "bg-red-100 text-red-800", icon: XCircle };
      default:
        return { label: status, color: "bg-gray-100 text-gray-800", icon: BarChart3 };
    }
  };

  const statusEntries = Object.entries(metrics.byStatus).sort(([,a], [,b]) => b - a);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Aplicaciones</p>
                <p className="text-2xl font-bold">{metrics.total}</p>
                <p className="text-xs text-muted-foreground">
                  {metrics.new} nuevas esta semana
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tasa de Conversión</p>
                <p className="text-2xl font-bold">{metrics.conversionRate}%</p>
                <p className="text-xs text-muted-foreground">
                  Aplicaciones a contrataciones
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tiempo de Respuesta</p>
                <p className="text-2xl font-bold">{metrics.averageResponseTime}</p>
                <p className="text-xs text-muted-foreground">
                  Días promedio
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nuevas Aplicaciones</p>
                <p className="text-2xl font-bold">{metrics.new}</p>
                <p className="text-xs text-muted-foreground">
                  Últimos 7 días
                </p>
              </div>
              <UserPlus className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución por Estado</CardTitle>
          <CardDescription>
            Desglose de aplicaciones por estado actual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {statusEntries.map(([status, count]) => {
              const config = getStatusConfig(status);
              const percentage = metrics.total > 0 ? Math.round((count / metrics.total) * 100) : 0;
              const StatusIcon = config.icon;

              return (
                <div key={status} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <StatusIcon className="h-4 w-4" />
                      <span className="text-sm font-medium">{config.label}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">{count}</span>
                      <Badge className={config.color}>
                        {percentage}%
                      </Badge>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Embudo de Conversión</CardTitle>
          <CardDescription>
            Progreso de aplicaciones a través del proceso de contratación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Aplicaciones Recibidas</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">{metrics.total}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <span className="font-medium">En Revisión</span>
              </div>
              <span className="text-2xl font-bold text-yellow-600">
                {metrics.byStatus.UNDER_REVIEW || 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <UserPlus className="h-5 w-5 text-purple-600" />
                <span className="font-medium">Preseleccionadas</span>
              </div>
              <span className="text-2xl font-bold text-purple-600">
                {metrics.byStatus.PRE_SELECTED || 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium">Contratadas</span>
              </div>
              <span className="text-2xl font-bold text-green-600">
                {metrics.byStatus.HIRED || 0}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
