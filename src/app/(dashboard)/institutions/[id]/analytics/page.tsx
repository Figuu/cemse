"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  BarChart3, 
  Download,
  RefreshCw,
  Settings,
  TrendingUp,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  Award
} from "lucide-react";
import { InstitutionAnalyticsDashboard } from "@/components/institutions/InstitutionAnalyticsDashboard";
import { ReportManagement } from "@/components/institutions/ReportManagement";
import { useInstitutionAnalytics, InstitutionAnalytics } from "@/hooks/useInstitutionAnalytics";
import Link from "next/link";

export default function InstitutionAnalyticsPage() {
  const params = useParams();
  const institutionId = params.id as string;
  const [activeTab, setActiveTab] = useState("analytics");

  // Mock institution data (in real app, this would come from an API)
  const institution = {
    id: institutionId,
    name: "Universidad Nacional de La Paz",
    department: "La Paz",
    region: "Altiplano",
    institutionType: "UNIVERSITY",
  };

  const { data: analytics } = useInstitutionAnalytics(institutionId, { period: "30d" });

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/institutions/${institutionId}/dashboard`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            Analytics y Reportes
          </h1>
          <p className="text-muted-foreground">
            Análisis y reportes de {institution.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configuración
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Estudiantes</p>
                  <p className="text-2xl font-bold">{(analytics as InstitutionAnalytics).overview.totalStudents.toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Programas Activos</p>
                  <p className="text-2xl font-bold">{(analytics as InstitutionAnalytics).overview.totalPrograms.toLocaleString()}</p>
                </div>
                <GraduationCap className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cursos Activos</p>
                  <p className="text-2xl font-bold">{(analytics as InstitutionAnalytics).overview.totalCourses.toLocaleString()}</p>
                </div>
                <BookOpen className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Promedio General</p>
                  <p className="text-2xl font-bold">{(analytics as InstitutionAnalytics).academicPerformance.averageGrade.toFixed(1)}</p>
                </div>
                <Award className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Metrics */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tasa de Finalización</p>
                  <p className="text-2xl font-bold">{(analytics as InstitutionAnalytics).academicPerformance.completionRate.toFixed(1)}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tasa de Retención</p>
                  <p className="text-2xl font-bold">{(analytics as InstitutionAnalytics).academicPerformance.retentionRate.toFixed(1)}%</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tasa de Graduación</p>
                  <p className="text-2xl font-bold">{(analytics as InstitutionAnalytics).academicPerformance.graduationRate.toFixed(1)}%</p>
                </div>
                <GraduationCap className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Inscripciones</p>
                  <p className="text-2xl font-bold">{(analytics as InstitutionAnalytics).overview.totalEnrollments.toLocaleString()}</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reportes</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          <InstitutionAnalyticsDashboard institutionId={institutionId} />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <ReportManagement institutionId={institutionId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
