"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  GraduationCap, 
  BookOpen, 
  Award, 
  Clock,
  TrendingUp,
  Star,
  Users,
  CheckCircle
} from "lucide-react";

interface CourseCompletionChartProps {
  data: {
    totalEnrollments: number;
    completedCourses: number;
    completionRate: number;
    averageCompletionTime: number;
    topCourses: Array<{ course: string; enrollments: number; completions: number }>;
    certificatesIssued: number;
    courseRatings: Array<{ course: string; rating: number; reviews: number }>;
  };
}

export function CourseCompletionChart({ data }: CourseCompletionChartProps) {
  const completionMetrics = [
    {
      title: "Total Inscripciones",
      value: data.totalEnrollments.toLocaleString(),
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      description: "Cursos en los que se han inscrito usuarios"
    },
    {
      title: "Cursos Completados",
      value: data.completedCourses.toLocaleString(),
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
      description: "Cursos completados exitosamente"
    },
    {
      title: "Tasa de Finalización",
      value: `${data.completionRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      description: "Porcentaje de cursos completados"
    },
    {
      title: "Tiempo Promedio",
      value: `${data.averageCompletionTime} días`,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      description: "Tiempo promedio para completar un curso"
    },
    {
      title: "Certificados Emitidos",
      value: data.certificatesIssued.toLocaleString(),
      icon: Award,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      description: "Certificados entregados a estudiantes"
    }
  ];

  const getCompletionLevel = (rate: number) => {
    if (rate >= 80) return { level: "Excelente", color: "text-green-600", bgColor: "bg-green-100" };
    if (rate >= 60) return { level: "Bueno", color: "text-blue-600", bgColor: "bg-blue-100" };
    if (rate >= 40) return { level: "Regular", color: "text-yellow-600", bgColor: "bg-yellow-100" };
    return { level: "Necesita Mejora", color: "text-red-600", bgColor: "bg-red-100" };
  };

  const completionLevel = getCompletionLevel(data.completionRate);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {completionMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${metric.bgColor}`}>
                    <Icon className={`h-4 w-4 ${metric.color}`} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      {metric.title}
                    </div>
                    <div className="text-2xl font-bold">{metric.value}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Completion Rate Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <GraduationCap className="h-5 w-5 mr-2" />
            Tasa de Finalización de Cursos
          </CardTitle>
          <CardDescription>
            Análisis del rendimiento de finalización de cursos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center p-6 bg-muted/50 rounded-lg">
            <div className="text-4xl font-bold mb-2">{data.completionRate.toFixed(1)}%</div>
            <div className={`text-lg font-medium ${completionLevel.color} mb-2`}>
              {completionLevel.level}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div 
                className={`h-3 rounded-full ${completionLevel.bgColor.replace('bg-', 'bg-').replace('-100', '-500')}`}
                style={{ width: `${data.completionRate}%` } as React.CSSProperties}
              ></div>
            </div>
            <div className="text-sm text-muted-foreground">
              {data.completedCourses} de {data.totalEnrollments} cursos completados
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Courses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Cursos Más Populares
            </CardTitle>
            <CardDescription>
              Cursos con más inscripciones y finalizaciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topCourses.slice(0, 10).map((course, index) => {
                const completionRate = course.enrollments > 0 ? 
                  (course.completions / course.enrollments) * 100 : 0;
                
                return (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                          {index + 1}
                        </div>
                        <span className="font-medium truncate">{course.course}</span>
                      </div>
                      <div className="text-sm font-medium text-muted-foreground">
                        {completionRate.toFixed(1)}%
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{course.enrollments} inscripciones</span>
                      <span>{course.completions} completados</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${completionRate}%` } as React.CSSProperties}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Course Ratings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2" />
              Calificaciones de Cursos
            </CardTitle>
            <CardDescription>
              Cursos mejor calificados por los estudiantes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.courseRatings.slice(0, 10).map((course, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center text-xs font-bold text-yellow-600">
                        {index + 1}
                      </div>
                      <span className="font-medium truncate">{course.course}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-medium">{course.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{course.reviews} reseñas</span>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3 w-3 ${
                            star <= Math.round(course.rating) 
                              ? 'text-yellow-500 fill-current' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Insights de Rendimiento</CardTitle>
          <CardDescription>
            Análisis detallado del rendimiento de los cursos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {data.completionRate.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">
                Tasa de Finalización General
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {data.averageCompletionTime}
              </div>
              <div className="text-sm text-muted-foreground">
                Días Promedio para Completar
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {data.certificatesIssued}
              </div>
              <div className="text-sm text-muted-foreground">
                Certificados Emitidos
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
