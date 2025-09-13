"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Building2, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Calendar,
  BarChart3,
  Settings,
  Bell,
  TrendingUp,
  UserPlus,
  Award,
  Clock,
  MapPin,
  Phone,
  Mail,
  Globe,
  Download,
  RefreshCw,
  Plus
} from "lucide-react";
import { StudentManagementDashboard } from "@/components/institutions/StudentManagementDashboard";
import { useInstitutionStudents, useInstitutionPrograms, useInstitutionCourses } from "@/hooks/useInstitutionStudents";
import Link from "next/link";

export default function InstitutionDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const institutionId = params.id as string;
  const [activeTab, setActiveTab] = useState("overview");

  // Mock institution data (in real app, this would come from an API)
  const institution = {
    id: institutionId,
    name: "Universidad Nacional de La Paz",
    department: "La Paz",
    region: "Altiplano",
    institutionType: "UNIVERSITY",
    email: "info@unlp.edu.bo",
    phone: "+591-2-1234567",
    website: "https://unlp.edu.bo",
    address: "Av. Villazón, La Paz, Bolivia",
    isActive: true,
  };

  const { data: studentsData } = useInstitutionStudents(institutionId, { limit: 1000 });
  const { data: programsData } = useInstitutionPrograms(institutionId, { limit: 1000 });
  const { data: coursesData } = useInstitutionCourses(institutionId, { limit: 1000 });

  const students = studentsData?.students || [];
  const programs = programsData?.programs || [];
  const courses = coursesData?.courses || [];

  const activeStudents = students.filter(s => s.status === "ACTIVE").length;
  const activePrograms = programs.filter(p => p.status === "ACTIVE").length;
  const activeCourses = courses.filter(c => c.status === "ACTIVE").length;
  const graduatedStudents = students.filter(s => s.status === "GRADUATED").length;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/institutions">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            {institution.name}
          </h1>
          <p className="text-muted-foreground">
            Panel de administración de la institución
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

      {/* Institution Info */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Ubicación</p>
                <p className="text-sm text-muted-foreground">{institution.department}, {institution.region}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Teléfono</p>
                <p className="text-sm text-muted-foreground">{institution.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{institution.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Sitio Web</p>
                <a 
                  href={institution.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  {institution.website}
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estudiantes Activos</p>
                <p className="text-2xl font-bold">{activeStudents}</p>
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
                <p className="text-2xl font-bold">{activePrograms}</p>
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
                <p className="text-2xl font-bold">{activeCourses}</p>
              </div>
              <BookOpen className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Graduados</p>
                <p className="text-2xl font-bold">{graduatedStudents}</p>
              </div>
              <Award className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <UserPlus className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">Nuevo estudiante registrado</p>
                <p className="text-xs text-muted-foreground">Hace 2 horas</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">Nuevo programa creado</p>
                <p className="text-xs text-muted-foreground">Hace 1 día</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <BookOpen className="h-5 w-5 text-purple-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">Curso actualizado</p>
                <p className="text-xs text-muted-foreground">Hace 2 días</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Award className="h-5 w-5 text-orange-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">Estudiante graduado</p>
                <p className="text-xs text-muted-foreground">Hace 3 días</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="students">Estudiantes</TabsTrigger>
          <TabsTrigger value="programs">Programas</TabsTrigger>
          <TabsTrigger value="courses">Cursos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Overview Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Student Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Estudiantes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Activos</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${(activeStudents / students.length) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{activeStudents}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Graduados</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${(graduatedStudents / students.length) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{graduatedStudents}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Inactivos</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div 
                          className="bg-gray-500 h-2 rounded-full" 
                          style={{ width: `${((students.length - activeStudents - graduatedStudents) / students.length) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{students.length - activeStudents - graduatedStudents}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Program Levels */}
            <Card>
              <CardHeader>
                <CardTitle>Niveles de Programas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {programs.reduce((acc, program) => {
                    acc[program.level] = (acc[program.level] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>).map(([level, count]) => (
                    <div key={level} className="flex items-center justify-between">
                      <span className="text-sm">{level}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full" 
                            style={{ width: `${(count / programs.length) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button className="h-20 flex flex-col items-center justify-center">
                    <UserPlus className="h-6 w-6 mb-2" />
                    <span className="text-sm">Agregar Estudiante</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <GraduationCap className="h-6 w-6 mb-2" />
                    <span className="text-sm">Crear Programa</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <BookOpen className="h-6 w-6 mb-2" />
                    <span className="text-sm">Crear Curso</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <BarChart3 className="h-6 w-6 mb-2" />
                    <span className="text-sm">Ver Reportes</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Próximos Eventos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Examen Final - Matemáticas</p>
                      <p className="text-xs text-muted-foreground">15 de Diciembre, 2024</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Ceremonia de Graduación</p>
                      <p className="text-xs text-muted-foreground">20 de Diciembre, 2024</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Reunión de Facultad</p>
                      <p className="text-xs text-muted-foreground">22 de Diciembre, 2024</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <StudentManagementDashboard institutionId={institutionId} />
        </TabsContent>

        <TabsContent value="programs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Programas Académicos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Gestión de Programas</h3>
                <p className="text-muted-foreground mb-4">
                  La gestión de programas se encuentra en la pestaña de Estudiantes
                </p>
                <Button onClick={() => setActiveTab("students")}>
                  Ir a Gestión de Estudiantes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cursos Académicos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Gestión de Cursos</h3>
                <p className="text-muted-foreground mb-4">
                  La gestión de cursos se encuentra en la pestaña de Estudiantes
                </p>
                <Button onClick={() => setActiveTab("students")}>
                  Ir a Gestión de Estudiantes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
