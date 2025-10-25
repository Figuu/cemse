"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Calendar,
  Bell,
  Target,
  Award,
  Clock,
  Filter,
  Download,
  RefreshCw,
  FileText,
  PieChart,
  Activity
} from "lucide-react";
import { 
  useInstitutionAnalytics, 
  InstitutionAnalytics,
  ANALYTICS_PERIODS, 
  formatPercentage, 
  formatNumber, 
} from "@/hooks/useInstitutionAnalytics";

interface InstitutionAnalyticsDashboardProps {
  institutionId: string;
}

export function InstitutionAnalyticsDashboard({ institutionId }: InstitutionAnalyticsDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<"7d" | "30d" | "90d" | "1y" | "all">("30d");
  const [activeTab, setActiveTab] = useState("overview");

  const { data: analytics, isLoading: analyticsLoading } = useInstitutionAnalytics(institutionId, {
    period: selectedPeriod,
  });

  if (analyticsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-muted rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-4 bg-muted rounded w-24"></div>
                  <div className="h-8 bg-muted rounded w-16"></div>
                  <div className="h-3 bg-muted rounded w-20"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No hay datos disponibles</h3>
        <p className="text-muted-foreground">
          No se encontraron datos de analytics para esta institución
        </p>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics de {(analytics as InstitutionAnalytics).institution.name}</h2>
          <p className="text-muted-foreground flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Período: {ANALYTICS_PERIODS.find(p => p.value === selectedPeriod)?.label}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as "7d" | "30d" | "90d" | "1y" | "all")}
            className="p-2 border rounded-md"
          >
            {ANALYTICS_PERIODS.map((period) => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Alertas
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estudiantes</p>
                <p className="text-2xl font-bold">{formatNumber((analytics as InstitutionAnalytics).overview.totalStudents)}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Programas</p>
                <p className="text-2xl font-bold">{formatNumber((analytics as InstitutionAnalytics).overview.totalPrograms)}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cursos</p>
                <p className="text-2xl font-bold">{formatNumber((analytics as InstitutionAnalytics).overview.totalCourses)}</p>
              </div>
              <BookOpen className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inscripciones</p>
                <p className="text-2xl font-bold">{formatNumber((analytics as InstitutionAnalytics).overview.totalEnrollments)}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Academic Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Promedio General</p>
                <p className="text-2xl font-bold">{(analytics as InstitutionAnalytics).academicPerformance.averageGrade.toFixed(1)}</p>
              </div>
              <Award className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tasa de Finalización</p>
                <p className="text-2xl font-bold">{formatPercentage((analytics as InstitutionAnalytics).academicPerformance.completionRate)}</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tasa de Retención</p>
                <p className="text-2xl font-bold">{formatPercentage((analytics as InstitutionAnalytics).academicPerformance.retentionRate)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tasa de Graduación</p>
                <p className="text-2xl font-bold">{formatPercentage((analytics as InstitutionAnalytics).academicPerformance.graduationRate)}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="students">Estudiantes</TabsTrigger>
          <TabsTrigger value="programs">Programas</TabsTrigger>
          <TabsTrigger value="courses">Cursos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Student Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Distribución de Estudiantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {Object.entries((analytics as InstitutionAnalytics).studentStatusDistribution).map(([status, count]) => (
                  <div key={status} className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold mb-1">{count as number}</div>
                    <Badge variant="outline" className="text-sm">
                      {status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Program Level Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Distribución por Nivel de Programa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Object.entries((analytics as InstitutionAnalytics).programLevelDistribution).map(([level, count]) => (
                  <div key={level} className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold mb-1">{count as number}</div>
                    <div className="text-sm text-muted-foreground">{level}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Engagement Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Métricas de Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold mb-1">
                    {(analytics as InstitutionAnalytics).engagementMetrics.averageStudentsPerProgram.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">Estudiantes/Programa</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold mb-1">
                    {(analytics as InstitutionAnalytics).engagementMetrics.averageCoursesPerProgram.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">Cursos/Programa</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold mb-1">
                    {(analytics as InstitutionAnalytics).engagementMetrics.averageEnrollmentsPerCourse.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">Inscripciones/Curso</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold mb-1">
                    {(analytics as InstitutionAnalytics).engagementMetrics.announcementFrequency}
                  </div>
                  <div className="text-sm text-muted-foreground">Anuncios/Día</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold mb-1">
                    {(analytics as InstitutionAnalytics).engagementMetrics.eventFrequency}
                  </div>
                  <div className="text-sm text-muted-foreground">Eventos/Día</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          {/* Student Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Estados de Estudiantes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries((analytics as InstitutionAnalytics).studentStatusDistribution).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="capitalize">{status}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{count as number}</span>
                      <span className="text-sm text-muted-foreground">
                        ({formatPercentage(((count as number) / (analytics as InstitutionAnalytics).overview.totalStudents) * 100)})
                      </span>
                      {(count as number) < 10 && (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="programs" className="space-y-6">
          {/* Top Performing Programs */}
          <Card>
            <CardHeader>
              <CardTitle>Programas con Mejor Rendimiento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(analytics as InstitutionAnalytics).topPerformingPrograms.map((program, index) => (
                  <div key={program.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold">{program.name}</h4>
                        <p className="text-sm text-muted-foreground">{program.level}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{program.enrollments} estudiantes</div>
                      <div className="text-sm text-muted-foreground">{program.courses} cursos</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          {/* Top Performing Courses */}
          <Card>
            <CardHeader>
              <CardTitle>Cursos con Mejor Rendimiento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(analytics as InstitutionAnalytics).topPerformingCourses.map((course, index) => (
                  <div key={course.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold">{course.name}</h4>
                        <p className="text-sm text-muted-foreground">{course.code} - {course.level}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{course.enrollments} estudiantes</div>
                      <div className="text-sm text-muted-foreground">
                        {formatPercentage(course.enrollmentRate)} tasa
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
