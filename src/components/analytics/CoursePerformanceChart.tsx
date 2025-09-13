"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  BookOpen, 
  MessageCircle, 
  HelpCircle,
  Award,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CoursePerformanceData {
  id: string;
  title: string;
  level: string;
  status: string;
  totalEnrollments: number;
  completedEnrollments: number;
  completionRate: number;
  averageProgress: number;
  totalModules: number;
  totalDiscussions: number;
  totalQuestions: number;
  engagementScore: number;
}

interface CoursePerformanceChartProps {
  data: CoursePerformanceData[];
  className?: string;
}

export function CoursePerformanceChart({ data, className }: CoursePerformanceChartProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "DRAFT":
        return "bg-yellow-100 text-yellow-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "Activo";
      case "DRAFT":
        return "Borrador";
      case "COMPLETED":
        return "Completado";
      default:
        return status;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "BEGINNER":
        return "bg-blue-100 text-blue-800";
      case "INTERMEDIATE":
        return "bg-yellow-100 text-yellow-800";
      case "ADVANCED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case "BEGINNER":
        return "Principiante";
      case "INTERMEDIATE":
        return "Intermedio";
      case "ADVANCED":
        return "Avanzado";
      default:
        return level;
    }
  };

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

  // Sort by engagement score for better visualization
  const sortedData = [...data].sort((a, b) => b.engagementScore - a.engagementScore);

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          Rendimiento de Cursos
        </CardTitle>
        <CardDescription>
          Análisis del rendimiento y engagement de los cursos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {sortedData.map((course, index) => (
            <div key={course.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-lg">{course.title}</h3>
                    <Badge className={getStatusColor(course.status)}>
                      {getStatusText(course.status)}
                    </Badge>
                    <Badge className={getLevelColor(course.level)}>
                      {getLevelText(course.level)}
                    </Badge>
                  </div>
                  
                  {/* Course Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="text-lg font-semibold">{course.totalEnrollments}</div>
                      <div className="text-xs text-muted-foreground">Estudiantes</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <BookOpen className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="text-lg font-semibold">{course.totalModules}</div>
                      <div className="text-xs text-muted-foreground">Módulos</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <MessageCircle className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="text-lg font-semibold">{course.totalDiscussions}</div>
                      <div className="text-xs text-muted-foreground">Discusiones</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <HelpCircle className="h-4 w-4 text-orange-600" />
                      </div>
                      <div className="text-lg font-semibold">{course.totalQuestions}</div>
                      <div className="text-xs text-muted-foreground">Preguntas</div>
                    </div>
                  </div>
                </div>
                
                {/* Engagement Score */}
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getEngagementColor(course.engagementScore)}`}>
                    {course.engagementScore.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Engagement {getEngagementLabel(course.engagementScore)}
                  </div>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Tasa de Completación</span>
                    <span className="font-medium">{course.completionRate}%</span>
                  </div>
                  <Progress value={course.completionRate} className="h-2" />
                </div>
                
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Progreso Promedio</span>
                    <span className="font-medium">{course.averageProgress}%</span>
                  </div>
                  <Progress value={course.averageProgress} className="h-2" />
                </div>
              </div>

              {/* Performance Indicators */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <Award className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-muted-foreground">
                      {course.completedEnrollments} completados
                    </span>
                  </div>
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 text-blue-600 mr-1" />
                    <span className="text-muted-foreground">
                      {course.totalEnrollments - course.completedEnrollments} en progreso
                    </span>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  #{index + 1} en engagement
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
