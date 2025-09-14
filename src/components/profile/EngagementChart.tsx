"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Eye,
  Briefcase,
  BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EngagementData {
  profileViews: { date: string; views: number }[];
  jobApplications: { date: string; applications: number }[];
  courseActivity: { date: string; activity: number }[];
}

interface EngagementChartProps {
  data: EngagementData;
  timeRange: string;
  className?: string;
}

export function EngagementChart({ data, timeRange, className }: EngagementChartProps) {
  const getTimeRangeLabel = (range: string) => {
    switch (range) {
      case "7d": return "últimos 7 días";
      case "30d": return "últimos 30 días";
      case "90d": return "últimos 90 días";
      case "1y": return "último año";
      default: return "últimos 30 días";
    }
  };

  const calculateTrend = (data: { date: string; [key: string]: string | number }[]) => {
    if (data.length < 2) return { direction: "stable", percentage: 0 };
    
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));
    
    // Get the numeric property (views, applications, activity, etc.)
    const numericKey = Object.keys(data[0]).find(key => key !== 'date' && typeof data[0][key] === 'number') || 'views';
    
    const firstAvg = firstHalf.reduce((sum, item) => sum + (item[numericKey] as number), 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, item) => sum + (item[numericKey] as number), 0) / secondHalf.length;
    
    const percentage = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;
    const direction = percentage > 5 ? "up" : percentage < -5 ? "down" : "stable";
    
    return { direction, percentage: Math.abs(percentage) };
  };

  const profileViewsTrend = calculateTrend(data.profileViews);
  const jobApplicationsTrend = calculateTrend(data.jobApplications);
  const courseActivityTrend = calculateTrend(data.courseActivity);

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case "up": return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "down": return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case "up": return "text-green-600";
      case "down": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  // Calculate totals
  const totalViews = data.profileViews.reduce((sum, item) => sum + item.views, 0);
  const totalApplications = data.jobApplications.reduce((sum, item) => sum + item.applications, 0);
  const totalActivity = data.courseActivity.reduce((sum, item) => sum + item.activity, 0);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vistas del Perfil</p>
                <p className="text-2xl font-bold">{totalViews}</p>
                <div className="flex items-center text-sm">
                  {getTrendIcon(profileViewsTrend.direction)}
                  <span className={cn("ml-1", getTrendColor(profileViewsTrend.direction))}>
                    {profileViewsTrend.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Aplicaciones</p>
                <p className="text-2xl font-bold">{totalApplications}</p>
                <div className="flex items-center text-sm">
                  {getTrendIcon(jobApplicationsTrend.direction)}
                  <span className={cn("ml-1", getTrendColor(jobApplicationsTrend.direction))}>
                    {jobApplicationsTrend.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              <Briefcase className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Actividad en Cursos</p>
                <p className="text-2xl font-bold">{totalActivity}</p>
                <div className="flex items-center text-sm">
                  {getTrendIcon(courseActivityTrend.direction)}
                  <span className={cn("ml-1", getTrendColor(courseActivityTrend.direction))}>
                    {courseActivityTrend.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              <BookOpen className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Actividad en {getTimeRangeLabel(timeRange)}
          </CardTitle>
          <CardDescription>
            Tendencias de vistas del perfil, aplicaciones de trabajo y actividad en cursos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Gráfico de actividad</p>
              <p className="text-xs text-muted-foreground">
                Se mostrará un gráfico interactivo aquí
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Datos Detallados</CardTitle>
          <CardDescription>
            Desglose diario de tu actividad
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  <Eye className="h-4 w-4 mr-2 text-blue-600" />
                  Vistas del Perfil
                </h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {data.profileViews.slice(-7).map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                      <span className="font-medium">{item.views}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  <Briefcase className="h-4 w-4 mr-2 text-green-600" />
                  Aplicaciones de Trabajo
                </h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {data.jobApplications.slice(-7).map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                      <span className="font-medium">{item.applications}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  <BookOpen className="h-4 w-4 mr-2 text-purple-600" />
                  Actividad en Cursos
                </h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {data.courseActivity.slice(-7).map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                      <span className="font-medium">{item.activity} min</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

