"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  GraduationCap, 
  BarChart3,
  Users,
  BookOpen,
  Settings
} from "lucide-react";
import { ProgramManagement } from "@/components/institutions/ProgramManagement";
import { EnrollmentManagement } from "@/components/institutions/EnrollmentManagement";
import { useInstitutionPrograms } from "@/hooks/useInstitutionStudents";
import Link from "next/link";

export default function InstitutionProgramsPage() {
  const params = useParams();
  const institutionId = params.id as string;
  const [activeTab, setActiveTab] = useState("programs");

  // Mock institution data (in real app, this would come from an API)
  const institution = {
    id: institutionId,
    name: "Universidad Nacional de La Paz",
    department: "La Paz",
    region: "Altiplano",
    institutionType: "UNIVERSITY",
  };

  const { data: programsData } = useInstitutionPrograms(institutionId, { limit: 1000 });
  const programs = programsData?.programs || [];

  const activePrograms = programs.filter(p => p.status === "ACTIVE").length;
  const totalStudents = programs.reduce((sum, p) => sum + p.currentStudents, 0);
  const totalCourses = programs.reduce((sum, p) => sum + (p._count?.courses || 0), 0);

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
            <GraduationCap className="h-8 w-8 text-primary" />
            Programas Académicos
          </h1>
          <p className="text-muted-foreground">
            Gestión de programas académicos de {institution.name}
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
                <p className="text-sm font-medium text-muted-foreground">Total Programas</p>
                <p className="text-2xl font-bold">{programs.length}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Programas Activos</p>
                <p className="text-2xl font-bold">{activePrograms}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Total Cursos</p>
                <p className="text-2xl font-bold">{totalCourses}</p>
              </div>
              <BookOpen className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="programs">Programas</TabsTrigger>
          <TabsTrigger value="enrollments">Inscripciones</TabsTrigger>
        </TabsList>

        <TabsContent value="programs" className="space-y-6">
          <ProgramManagement institutionId={institutionId} />
        </TabsContent>

        <TabsContent value="enrollments" className="space-y-6">
          <EnrollmentManagement institutionId={institutionId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
