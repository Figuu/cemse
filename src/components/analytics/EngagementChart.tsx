"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  MessageCircle, 
  HelpCircle, 
  BookOpen, 
  Users, 
  TrendingUp,
  BarChart3,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EngagementData {
  discussionCount: number;
  questionCount: number;
  quizAttempts: number;
  averageSessionTime: number;
  activeStudents: number;
  engagementScore: number;
}

interface TimeSeriesData {
  date: string;
  enrollments: number;
  completions: number;
}

interface EngagementChartProps {
  engagementData: EngagementData;
  timeSeriesData: TimeSeriesData[];
  className?: string;
}

export function EngagementChart({ engagementData, timeSeriesData, className }: EngagementChartProps) {
  const getEngagementColor = (score: number) => {
    if (score >= 0.8) return "text-green-600";
    if (score >= 0.5) return "text-yellow-600";
    return "text-red-600";
  };

  const getEngagementLabel = (score: number) => {
    if (score >= 0.8) return "Alto";
    if (score >= 0.5) return "Medio";
    return "Bajo";
  };

  const getEngagementBgColor = (score: number) => {
    if (score >= 0.8) return "bg-green-100";
    if (score >= 0.5) return "bg-yellow-100";
    return "bg-red-100";
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate engagement metrics
  const totalEngagement = engagementData.discussionCount + engagementData.questionCount + engagementData.quizAttempts;
  const averageEngagementPerStudent = engagementData.activeStudents > 0 
    ? totalEngagement / engagementData.activeStudents 
    : 0;

  // Calculate trends from time series data
  const recentData = timeSeriesData.slice(-7); // Last 7 days
  const previousData = timeSeriesData.slice(-14, -7); // Previous 7 days
  
  const recentEngagement = recentData.reduce((sum, day) => sum + day.enrollments, 0);
  const previousEngagement = previousData.reduce((sum, day) => sum + day.enrollments, 0);
  
  const engagementTrend = previousEngagement > 0 
    ? ((recentEngagement - previousEngagement) / previousEngagement) * 100
    : 0;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Engagement Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Resumen de Engagement
          </CardTitle>
          <CardDescription>
            Métricas de participación y actividad de los estudiantes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Engagement Score */}
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${getEngagementBgColor(engagementData.engagementScore)} mb-2`}>
                <span className={`text-2xl font-bold ${getEngagementColor(engagementData.engagementScore)}`}>
                  {engagementData.engagementScore.toFixed(1)}
                </span>
              </div>
              <div className="text-sm font-medium">Engagement Score</div>
              <div className={`text-xs ${getEngagementColor(engagementData.engagementScore)}`}>
                {getEngagementLabel(engagementData.engagementScore)}
              </div>
            </div>

            {/* Active Students */}
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-2">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600">{engagementData.activeStudents}</div>
              <div className="text-sm text-muted-foreground">Estudiantes Activos</div>
            </div>

            {/* Total Engagement */}
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-2">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-600">{totalEngagement}</div>
              <div className="text-sm text-muted-foreground">Total Interacciones</div>
            </div>

            {/* Average Session Time */}
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-2">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">
                {formatTime(engagementData.averageSessionTime)}
              </div>
              <div className="text-sm text-muted-foreground">Tiempo Promedio</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Engagement Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageCircle className="h-5 w-5 mr-2" />
            Desglose de Engagement
          </CardTitle>
          <CardDescription>
            Distribución de las diferentes formas de participación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Discussions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium">Discusiones</div>
                  <div className="text-sm text-muted-foreground">Participación en foros</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{engagementData.discussionCount}</div>
                <div className="text-sm text-muted-foreground">
                  {totalEngagement > 0 ? Math.round((engagementData.discussionCount / totalEngagement) * 100) : 0}%
                </div>
              </div>
            </div>

            {/* Questions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <HelpCircle className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="font-medium">Preguntas</div>
                  <div className="text-sm text-muted-foreground">Consultas y dudas</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{engagementData.questionCount}</div>
                <div className="text-sm text-muted-foreground">
                  {totalEngagement > 0 ? Math.round((engagementData.questionCount / totalEngagement) * 100) : 0}%
                </div>
              </div>
            </div>

            {/* Quiz Attempts */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BookOpen className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="font-medium">Intentos de Quiz</div>
                  <div className="text-sm text-muted-foreground">Evaluaciones completadas</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{engagementData.quizAttempts}</div>
                <div className="text-sm text-muted-foreground">
                  {totalEngagement > 0 ? Math.round((engagementData.quizAttempts / totalEngagement) * 100) : 0}%
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Engagement Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Tendencias de Engagement
          </CardTitle>
          <CardDescription>
            Evolución de la participación en los últimos días
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Trend Indicator */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Tendencia (7 días)</span>
                <Badge className={engagementTrend >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                  {engagementTrend >= 0 ? "↗" : "↘"} {Math.abs(engagementTrend).toFixed(1)}%
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                Promedio por estudiante: {averageEngagementPerStudent.toFixed(1)}
              </div>
            </div>

            {/* Time Series Chart (Simplified) */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Inscripciones por Día</div>
              <div className="flex items-end space-x-1 h-20">
                {recentData.map((day, index) => {
                  const maxValue = Math.max(...recentData.map(d => d.enrollments));
                  const height = maxValue > 0 ? (day.enrollments / maxValue) * 100 : 0;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-blue-500 rounded-t"
                        style={{ height: `${height}%` }}
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDate(day.date)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
