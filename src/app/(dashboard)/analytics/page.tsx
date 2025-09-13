"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  BookOpen, 
  MessageCircle, 
  HelpCircle,
  Award,
  Download,
  RefreshCw,
  AlertCircle,
  Filter,
  Calendar,
  FileText,
  Settings
} from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useCourseAnalytics } from "@/hooks/useCourseAnalytics";
import { CoursePerformanceChart } from "@/components/analytics/CoursePerformanceChart";
import { EngagementChart } from "@/components/analytics/EngagementChart";

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("30d");
  const [courseId, setCourseId] = useState("");
  const [instructorId, setInstructorId] = useState("");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const {
    analytics,
    isLoading,
    error,
    refetch,
    generateReport,
    downloadReport,
  } = useCourseAnalytics({
    timeRange,
    courseId: courseId || undefined,
    instructorId: instructorId || undefined,
  });

  const handleGenerateReport = async (reportType: string) => {
    setIsGeneratingReport(true);
    try {
      const report = await generateReport({
        reportType: reportType as any,
        timeRange,
        courseId: courseId || undefined,
        instructorId: instructorId || undefined,
        includeCharts: true,
      });
      
      if (report) {
        // Handle report generation success
        console.log("Report generated:", report);
      }
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleDownloadReport = async (reportType: string, format: string = "csv") => {
    try {
      await downloadReport({
        reportType: reportType as any,
        timeRange,
        courseId: courseId || undefined,
        instructorId: instructorId || undefined,
        includeCharts: false,
      }, format);
    } catch (error) {
      console.error("Failed to download report:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analíticas de Cursos</h1>
            <p className="text-muted-foreground">Análisis detallado del rendimiento y engagement</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analíticas de Cursos</h1>
            <p className="text-muted-foreground">Análisis detallado del rendimiento y engagement</p>
          </div>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error al cargar analíticas</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={refetch}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={["INSTRUCTOR", "ADMIN", "SUPERADMIN"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analíticas de Cursos</h1>
            <p className="text-muted-foreground">
              Análisis detallado del rendimiento y engagement
            </p>
          </div>
          <div className="flex space-x-2 mt-4 sm:mt-0">
            <Button variant="outline" onClick={refetch}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
            <Button onClick={() => handleGenerateReport("comprehensive")} disabled={isGeneratingReport}>
              <FileText className="h-4 w-4 mr-2" />
              {isGeneratingReport ? "Generando..." : "Generar Reporte"}
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configuración
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="7d">Últimos 7 días</option>
                  <option value="30d">Últimos 30 días</option>
                  <option value="90d">Últimos 90 días</option>
                  <option value="1y">Último año</option>
                </select>
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="ID del Curso"
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="ID del Instructor"
                  value={instructorId}
                  onChange={(e) => setInstructorId(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overview Stats */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="text-center py-4">
                <div className="flex items-center justify-center mb-2">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-600">{analytics.courseMetrics.totalCourses}</div>
                <div className="text-sm text-muted-foreground">Cursos Totales</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="text-center py-4">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-600">{analytics.courseMetrics.totalEnrollments}</div>
                <div className="text-sm text-muted-foreground">Inscripciones</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="text-center py-4">
                <div className="flex items-center justify-center mb-2">
                  <Award className="h-8 w-8 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-purple-600">{analytics.courseMetrics.completionRate}%</div>
                <div className="text-sm text-muted-foreground">Tasa de Completación</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="text-center py-4">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-orange-600">{analytics.courseMetrics.averageProgress}%</div>
                <div className="text-sm text-muted-foreground">Progreso Promedio</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="performance">Rendimiento</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="reports">Reportes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {analytics && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Cursos por Estado</CardTitle>
                    <CardDescription>
                      Distribución de cursos según su estado actual
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Activos</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${analytics.courseMetrics.totalCourses > 0 ? (analytics.courseMetrics.activeCourses / analytics.courseMetrics.totalCourses) * 100 : 0}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{analytics.courseMetrics.activeCourses}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Borradores</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-yellow-500 h-2 rounded-full"
                              style={{ width: `${analytics.courseMetrics.totalCourses > 0 ? (analytics.courseMetrics.draftCourses / analytics.courseMetrics.totalCourses) * 100 : 0}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{analytics.courseMetrics.draftCourses}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Completados</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${analytics.courseMetrics.totalCourses > 0 ? (analytics.courseMetrics.completedCourses / analytics.courseMetrics.totalCourses) * 100 : 0}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{analytics.courseMetrics.completedCourses}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Métricas de Engagement</CardTitle>
                    <CardDescription>
                      Participación y actividad de los estudiantes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Discusiones</span>
                        <span className="text-lg font-semibold">{analytics.studentEngagement.discussionCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Preguntas</span>
                        <span className="text-lg font-semibold">{analytics.studentEngagement.questionCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Intentos de Quiz</span>
                        <span className="text-lg font-semibold">{analytics.studentEngagement.quizAttempts}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Estudiantes Activos</span>
                        <span className="text-lg font-semibold">{analytics.studentEngagement.activeStudents}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            {analytics && (
              <CoursePerformanceChart 
                data={analytics.coursePerformance} 
                className="w-full"
              />
            )}
          </TabsContent>

          <TabsContent value="engagement" className="space-y-6">
            {analytics && (
              <EngagementChart 
                engagementData={analytics.studentEngagement}
                timeSeriesData={analytics.timeSeriesData}
                className="w-full"
              />
            )}
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Rendimiento de Cursos
                  </CardTitle>
                  <CardDescription>
                    Análisis detallado del rendimiento de cada curso
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Incluye métricas de completación, progreso y engagement por curso.
                    </p>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleDownloadReport("course_performance", "csv")}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        CSV
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDownloadReport("course_performance", "json")}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        JSON
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Engagement de Estudiantes
                  </CardTitle>
                  <CardDescription>
                    Análisis de participación y actividad estudiantil
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Incluye discusiones, preguntas, intentos de quiz y tiempo de sesión.
                    </p>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleDownloadReport("student_engagement", "csv")}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        CSV
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDownloadReport("student_engagement", "json")}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        JSON
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Analíticas de Instructores
                  </CardTitle>
                  <CardDescription>
                    Rendimiento y métricas por instructor
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Incluye cursos, estudiantes, completación y engagement por instructor.
                    </p>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleDownloadReport("instructor_analytics", "csv")}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        CSV
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDownloadReport("instructor_analytics", "json")}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        JSON
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    Análisis de Completación
                  </CardTitle>
                  <CardDescription>
                    Tiempos de completación y patrones de progreso
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Incluye tiempos de completación, progreso y demografía estudiantil.
                    </p>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleDownloadReport("completion_analysis", "csv")}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        CSV
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDownloadReport("completion_analysis", "json")}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        JSON
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Analíticas de Contenido
                  </CardTitle>
                  <CardDescription>
                    Análisis de módulos, lecciones y recursos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Incluye acceso a contenido, duración y popularidad de recursos.
                    </p>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleDownloadReport("content_analytics", "csv")}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        CSV
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDownloadReport("content_analytics", "json")}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        JSON
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Reporte Completo
                  </CardTitle>
                  <CardDescription>
                    Análisis integral con todas las métricas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Incluye todos los análisis anteriores en un solo reporte.
                    </p>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleDownloadReport("comprehensive", "csv")}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        CSV
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDownloadReport("comprehensive", "json")}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        JSON
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </RoleGuard>
  );
}
