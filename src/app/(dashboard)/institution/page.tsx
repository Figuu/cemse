"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { 
  Building2, 
  Users, 
  GraduationCap, 
  BookOpen, 
  TrendingUp, 
  Settings,
  Plus,
  BarChart3,
  MapPin,
  Globe,
  Award,
  FileText,
  Calendar
} from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useInstitutionStudents, useInstitutionCourses, useInstitutionPrograms, STUDENT_STATUS_LABELS, COURSE_STATUS_LABELS } from "@/hooks/useInstitutionStudents";
import { useInstitutionAnalytics } from "@/hooks/useInstitutionAnalytics";


function InstitutionPageContent() {
  const [activeTab, setActiveTab] = useState<"overview" | "courses" | "students" | "resources" | "analytics">("overview");
  const { data: session } = useSession();
  
  // Get institution ID from session
  const institutionId = session?.user?.profile?.institutionId;
  
  // Fetch real data
  const { data: studentsData, isLoading: studentsLoading } = useInstitutionStudents(institutionId, { limit: 10 });
  const { data: coursesData, isLoading: coursesLoading } = useInstitutionCourses(institutionId, { limit: 10 });
  const { data: programsData, isLoading: programsLoading } = useInstitutionPrograms(institutionId, { limit: 10 });
  const { data: analytics, isLoading: analyticsLoading } = useInstitutionAnalytics(institutionId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "INACTIVE":
        return "bg-gray-100 text-gray-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "DRAFT":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    return STUDENT_STATUS_LABELS[status as keyof typeof STUDENT_STATUS_LABELS] || 
           COURSE_STATUS_LABELS[status as keyof typeof COURSE_STATUS_LABELS] || 
           status;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mi Institución</h1>
          <p className="text-muted-foreground">
            Gestiona cursos, estudiantes y recursos educativos
          </p>
        </div>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configuración
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Curso
          </Button>
        </div>
      </div>

      {/* Institution Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">Universidad Tecnológica de Bolivia</h2>
              <p className="text-muted-foreground mb-2">
                Institución educativa líder en formación tecnológica y profesional en Bolivia.
              </p>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {(analytics as any)?.institution?.region || "Región no especificada"}
                </div>
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-1" />
                  {(analytics as any)?.institution?.department || "Departamento no especificado"}
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {(analytics as any)?.overview?.totalStudents || 0} estudiantes
                </div>
              </div>
            </div>
            <Button variant="outline">
              Editar Perfil
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estudiantes</p>
                <p className="text-2xl font-bold">{(analytics as any)?.overview?.totalStudents || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cursos Activos</p>
                <p className="text-2xl font-bold">{(analytics as any)?.overview?.activeCourses ?? 0}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Programas</p>
                <p className="text-2xl font-bold">{(analytics as any)?.overview?.totalPrograms || 0}</p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inscripciones</p>
                <p className="text-2xl font-bold">{(analytics as any)?.overview?.totalEnrollments || 0}</p>
              </div>
              <BookOpen className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "overview", name: "Resumen", icon: BarChart3 },
            { id: "courses", name: "Cursos", icon: GraduationCap },
            { id: "students", name: "Estudiantes", icon: Users },
            { id: "resources", name: "Recursos", icon: BookOpen },
            { id: "analytics", name: "Analíticas", icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "overview" | "courses" | "students" | "analytics")}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cursos Recientes</CardTitle>
                <CardDescription>
                  Tus cursos más recientes y su progreso
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {coursesLoading ? (
                    <div className="text-center py-4">Cargando cursos...</div>
                  ) : !(coursesData as any)?.courses || (coursesData as any).courses.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No hay cursos disponibles
                    </div>
                  ) : (coursesData as any).courses.slice(0, 3).map((course) => {
                    const enrollmentProgress = Math.round((course._count?.enrollments || 0) / Math.max(course.studentsCount || 1, 1) * 100);
                    return (
                      <div key={course.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{course.title || course.name}</h4>
                          <p className="text-sm text-muted-foreground">{course.instructor?.firstName} {course.instructor?.lastName}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full transition-all"
                                style={{ width: `${enrollmentProgress}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {enrollmentProgress}%
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(course.isActive ? "ACTIVE" : "INACTIVE")}>
                            {getStatusText(course.isActive ? "ACTIVE" : "INACTIVE")}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {course.studentsCount || 0} estudiantes
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
                <CardDescription>
                  Últimas actividades en tu institución
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm">Nuevo estudiante inscrito en &quot;Programación Web Frontend&quot;</p>
                      <p className="text-xs text-muted-foreground">Hace 2 horas</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm">Curso &quot;Gestión de Proyectos&quot; completado por 28 estudiantes</p>
                      <p className="text-xs text-muted-foreground">Hace 1 día</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm">Nuevo recurso agregado: &quot;Guía de React Hooks&quot;</p>
                      <p className="text-xs text-muted-foreground">Hace 3 días</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "courses" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Cursos</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Curso
            </Button>
          </div>
          
          <div className="space-y-4">
            {coursesLoading ? (
              <div className="text-center py-8">Cargando cursos...</div>
            ) : !(coursesData as any)?.courses || (coursesData as any).courses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay cursos registrados</p>
                <p className="text-sm">Los cursos aparecerán aquí cuando se creen</p>
              </div>
            ) : (coursesData as any).courses.map((course) => {
              const enrollmentProgress = Math.round((course._count?.enrollments || 0) / Math.max(course.studentsCount || 1, 1) * 100);
              return (
                <Card key={course.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-semibold">{course.title || course.name}</h4>
                          <Badge className={getStatusColor(course.isActive ? "ACTIVE" : "INACTIVE")}>
                            {getStatusText(course.isActive ? "ACTIVE" : "INACTIVE")}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-3">{course.description}</p>
                        <p className="text-sm text-muted-foreground mb-3">
                          Instructor: {course.instructor?.firstName} {course.instructor?.lastName} • {course.studentsCount || 0} estudiantes
                        </p>
                        <div className="flex items-center space-x-6 text-sm text-muted-foreground mb-3">
                          {course.publishedAt && (
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              Publicado: {formatDate(course.publishedAt)}
                            </div>
                          )}
                          {course.createdAt && (
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              Creado: {formatDate(course.createdAt)}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all"
                              style={{ width: `${enrollmentProgress}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {enrollmentProgress}%
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Users className="h-4 w-4 mr-2" />
                          Estudiantes
                        </Button>
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-2" />
                          Contenido
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "students" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Estudiantes</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Estudiante
            </Button>
          </div>
          
          <div className="space-y-4">
            {studentsLoading ? (
              <div className="text-center py-8">Cargando estudiantes...</div>
            ) : (studentsData as any)?.students?.map((student) => {
              const completionProgress = Math.round((student.enrollments?.filter(e => e.status === "COMPLETED").length || 0) / Math.max(student.enrollments?.length || 1, 1) * 100);
              return (
                <Card key={student.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{student.student?.firstName} {student.student?.lastName}</h4>
                          <p className="text-sm text-muted-foreground">{student.student?.email}</p>
                          <p className="text-sm text-muted-foreground">
                            {student.program?.name || "Sin programa asignado"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full transition-all"
                                style={{ width: `${completionProgress}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {completionProgress}%
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Inscrito: {formatDate(student.enrollmentDate)}
                          </p>
                        </div>
                        <Badge className={getStatusColor(student.status)}>
                          {getStatusText(student.status)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            }) || []}
          </div>
        </div>
      )}

      {activeTab === "resources" && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Gestión de Recursos</h3>
            <p className="text-muted-foreground">
              Aquí podrás gestionar todos los recursos educativos de tu institución.
            </p>
          </CardContent>
        </Card>
      )}

      {activeTab === "analytics" && (
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Analíticas</h3>
            <p className="text-muted-foreground">
              Visualiza el rendimiento de tus cursos y el progreso de tus estudiantes.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function InstitutionPage() {
  return (
    <RoleGuard allowedRoles={["INSTITUTION", "SUPERADMIN"]}>
      <InstitutionPageContent />
    </RoleGuard>
  );
}
