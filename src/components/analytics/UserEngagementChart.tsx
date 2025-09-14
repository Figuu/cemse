"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Clock, 
  Eye, 
  MousePointer,
  TrendingUp,
  Activity
} from "lucide-react";

interface UserEngagementChartProps {
  data: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    averageSessionDuration: number;
    pageViews: number;
    bounceRate: number;
  };
}

export function UserEngagementChart({ data }: UserEngagementChartProps) {
  const engagementMetrics = [
    {
      title: "Usuarios Activos Diarios",
      value: data.dailyActiveUsers.toLocaleString(),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      description: "Usuarios únicos en las últimas 24 horas"
    },
    {
      title: "Usuarios Activos Semanales",
      value: data.weeklyActiveUsers.toLocaleString(),
      icon: Activity,
      color: "text-green-600",
      bgColor: "bg-green-100",
      description: "Usuarios únicos en los últimos 7 días"
    },
    {
      title: "Usuarios Activos Mensuales",
      value: data.monthlyActiveUsers.toLocaleString(),
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      description: "Usuarios únicos en los últimos 30 días"
    },
    {
      title: "Duración Promedio de Sesión",
      value: `${data.averageSessionDuration} min`,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      description: "Tiempo promedio por sesión"
    },
    {
      title: "Páginas Vistas",
      value: data.pageViews.toLocaleString(),
      icon: Eye,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      description: "Total de páginas visitadas"
    },
    {
      title: "Tasa de Rebote",
      value: `${(data.bounceRate * 100).toFixed(1)}%`,
      icon: MousePointer,
      color: "text-red-600",
      bgColor: "bg-red-100",
      description: "Porcentaje de sesiones de una sola página"
    }
  ];

  // Calculate engagement score
  const engagementScore = Math.round(
    ((data.dailyActiveUsers / data.monthlyActiveUsers) * 100 + 
     (data.averageSessionDuration / 30) * 100 + 
     (1 - data.bounceRate) * 100) / 3
  );

  const getEngagementLevel = (score: number) => {
    if (score >= 80) return { level: "Excelente", color: "text-green-600" };
    if (score >= 60) return { level: "Bueno", color: "text-blue-600" };
    if (score >= 40) return { level: "Regular", color: "text-yellow-600" };
    return { level: "Necesita Mejora", color: "text-red-600" };
  };

  const engagementLevel = getEngagementLevel(engagementScore);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          Engagement de Usuarios
        </CardTitle>
        <CardDescription>
          Métricas de actividad y participación de usuarios
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Engagement Score */}
        <div className="text-center p-6 bg-muted/50 rounded-lg">
          <div className="text-3xl font-bold mb-2">{engagementScore}%</div>
          <div className={`text-lg font-medium ${engagementLevel.color}`}>
            {engagementLevel.level}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            Puntuación de Engagement
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {engagementMetrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${metric.bgColor}`}>
                    <Icon className={`h-4 w-4 ${metric.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-muted-foreground">
                      {metric.title}
                    </div>
                    <div className="text-lg font-bold">{metric.value}</div>
                    <div className="text-xs text-muted-foreground">
                      {metric.description}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Engagement Insights */}
        <div className="space-y-3">
          <h4 className="font-medium">Insights de Engagement</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>
                <strong>{data.dailyActiveUsers}</strong> usuarios activos diariamente
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>
                Sesiones promedio de <strong>{data.averageSessionDuration} minutos</strong>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>
                Tasa de rebote del <strong>{(data.bounceRate * 100).toFixed(1)}%</strong>
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
