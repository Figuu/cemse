"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  BookOpen, 
  BarChart3,
  Users,
  Award,
  Settings
} from "lucide-react";
import { CourseManagement } from "@/components/institutions/CourseManagement";
import { EnrollmentManagement } from "@/components/institutions/EnrollmentManagement";
import { useInstitutionCourses } from "@/hooks/useInstitutionStudents";
import Link from "next/link";

export default function InstitutionCoursesPage() {
  const params = useParams();
  const institutionId = params.id as string;
  const [activeTab, setActiveTab] = useState("courses");

  // Mock institution data (in real app, this would come from an API)
  const institution = {
    id: institutionId,
    name: "Universidad Nacional de La Paz",
    department: "La Paz",
    region: "Altiplano",
    institutionType: "UNIVERSITY",
  };

  const { data: coursesData } = useInstitutionCourses(institutionId, { limit: 1000 });
  const courses = coursesData?.courses || [];

  const activeCourses = courses.filter(c => c.status === "ACTIVE").length;
  const totalStudents = courses.reduce((sum, c) => sum + (c.studentsCount || 0), 0);
  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);

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
            <BookOpen className="h-8 w-8 text-primary" />
            Cursos Académicos
          </h1>
          <p className="text-muted-foreground">
            Gestión de cursos académicos de {institution.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Reportes
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configuración
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Cursos</p>
                <p className="text-2xl font-bold">{courses.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cursos Activos</p>
                <p className="text-2xl font-bold">{activeCourses}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Estudiantes</p>
                <p className="text-2xl font-bold">{totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Créditos</p>
                <p className="text-2xl font-bold">{totalCredits}</p>
              </div>
              <Award className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="courses">Cursos</TabsTrigger>
          <TabsTrigger value="enrollments">Inscripciones</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-6">
          <CourseManagement institutionId={institutionId} />
        </TabsContent>

        <TabsContent value="enrollments" className="space-y-6">
          <EnrollmentManagement institutionId={institutionId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
