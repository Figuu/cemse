"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  students: number;
  status: "active" | "draft" | "completed";
  startDate: string;
  endDate: string;
  progress: number;
}

interface Student {
  id: string;
  name: string;
  email: string;
  course: string;
  progress: number;
  lastActivity: string;
  status: "active" | "inactive" | "completed";
}

interface InstitutionStats {
  totalStudents: number;
  activeCourses: number;
  completedCourses: number;
  totalResources: number;
  certificatesIssued: number;
  averageCompletion: number;
}

const mockCourses: Course[] = [
  {
    id: "1",
    title: "Programación Web Frontend",
    description: "Curso completo de desarrollo web frontend con React y TypeScript.",
    instructor: "Dr. María González",
    students: 45,
    status: "active",
    startDate: "2024-01-15",
    endDate: "2024-04-15",
    progress: 75
  },
  {
    id: "2",
    title: "Marketing Digital Avanzado",
    description: "Estrategias avanzadas de marketing digital y redes sociales.",
    instructor: "Lic. Carlos Mendoza",
    students: 32,
    status: "active",
    startDate: "2024-02-01",
    endDate: "2024-05-01",
    progress: 45
  },
  {
    id: "3",
    title: "Gestión de Proyectos",
    description: "Metodologías ágiles y herramientas de gestión de proyectos.",
    instructor: "Ing. Ana Rodríguez",
    students: 28,
    status: "completed",
    startDate: "2023-10-01",
    endDate: "2023-12-15",
    progress: 100
  }
];

const mockStudents: Student[] = [
  {
    id: "1",
    name: "Juan Pérez",
    email: "juan.perez@email.com",
    course: "Programación Web Frontend",
    progress: 85,
    lastActivity: "2024-01-20",
    status: "active"
  },
  {
    id: "2",
    name: "María García",
    email: "maria.garcia@email.com",
    course: "Marketing Digital Avanzado",
    progress: 60,
    lastActivity: "2024-01-19",
    status: "active"
  },
  {
    id: "3",
    name: "Carlos López",
    email: "carlos.lopez@email.com",
    course: "Gestión de Proyectos",
    progress: 100,
    lastActivity: "2023-12-10",
    status: "completed"
  }
];

const mockStats: InstitutionStats = {
  totalStudents: 150,
  activeCourses: 8,
  completedCourses: 12,
  totalResources: 45,
  certificatesIssued: 89,
  averageCompletion: 78
};

export default function InstitutionPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "courses" | "students" | "resources" | "analytics">("overview");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Activo";
      case "draft":
        return "Borrador";
      case "completed":
        return "Completado";
      case "inactive":
        return "Inactivo";
      default:
        return status;
    }
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
                  La Paz, Bolivia
                </div>
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-1" />
                  www.utb.edu.bo
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {mockStats.totalStudents} estudiantes
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
                <p className="text-2xl font-bold">{mockStats.totalStudents}</p>
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
                <p className="text-2xl font-bold">{mockStats.activeCourses}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Certificados</p>
                <p className="text-2xl font-bold">{mockStats.certificatesIssued}</p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recursos</p>
                <p className="text-2xl font-bold">{mockStats.totalResources}</p>
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
                  {mockCourses.slice(0, 3).map((course) => (
                    <div key={course.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{course.title}</h4>
                        <p className="text-sm text-muted-foreground">{course.instructor}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all"
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{course.progress}%</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(course.status)}>
                          {getStatusText(course.status)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {course.students} estudiantes
                        </span>
                      </div>
                    </div>
                  ))}
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
            {mockCourses.map((course) => (
              <Card key={course.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-semibold">{course.title}</h4>
                        <Badge className={getStatusColor(course.status)}>
                          {getStatusText(course.status)}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-3">{course.description}</p>
                      <p className="text-sm text-muted-foreground mb-3">
                        Instructor: {course.instructor} • {course.students} estudiantes
                      </p>
                      <div className="flex items-center space-x-6 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Inicio: {formatDate(course.startDate)}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Fin: {formatDate(course.endDate)}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">{course.progress}%</span>
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
            ))}
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
            {mockStudents.map((student) => (
              <Card key={student.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{student.name}</h4>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                        <p className="text-sm text-muted-foreground">{student.course}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all"
                              style={{ width: `${student.progress}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">{student.progress}%</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Última actividad: {formatDate(student.lastActivity)}
                        </p>
                      </div>
                      <Badge className={getStatusColor(student.status)}>
                        {getStatusText(student.status)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
