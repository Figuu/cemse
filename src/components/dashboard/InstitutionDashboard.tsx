"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Award,
  TrendingUp,
  Plus,
  Eye,
  Edit,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Settings
} from "lucide-react";
import Link from "next/link";
import { useInstitutionAnalytics } from "@/hooks/useInstitutionAnalytics";
import { useInstitutionStudents, useInstitutionCourses } from "@/hooks/useInstitutionStudents";
import { useInstitutionId } from "@/hooks/useInstitutionId";
import { useQuery } from "@tanstack/react-query";

interface InstitutionDashboardProps {
  stats?: any[];
}

export function InstitutionDashboard({ stats = [] }: InstitutionDashboardProps) {
  const { data: session } = useSession();
  
  // Get institution ID using the custom hook
  const { institutionId, isLoading: institutionIdLoading, error: institutionIdError } = useInstitutionId();
  
  // Fetch institution analytics and students
  const { data: analytics, isLoading: analyticsLoading } = useInstitutionAnalytics(institutionId || '', {});
  const { data: studentsData, isLoading: studentsLoading } = useInstitutionStudents(institutionId || '', {});
  const { data: coursesData, isLoading: coursesLoading } = useInstitutionCourses(institutionId || '', { limit: 1000 });


  // Create stats from real data
  const courses = (coursesData as any)?.courses || [];
  const students = (studentsData as any)?.students || [];
  
  const activeCourses = courses.filter(c => c.status === "ACTIVE").length;
  const totalStudents = students.filter(s => s.status === "ACTIVE").length;
  
  const isLoading = institutionIdLoading || analyticsLoading || studentsLoading || coursesLoading;
  
  const realStats = [
    { title: "Cursos Activos", value: (analytics as any)?.overview?.activeCourses?.toString() || "0", icon: GraduationCap, change: { value: 12, type: "increase" as const } },
    { title: "Estudiantes", value: (analytics as any)?.overview?.totalStudents?.toString() || "0", icon: Users, change: { value: 18, type: "increase" as const } },
    { title: "Recursos Publicados", value: (analytics as any)?.overview?.totalAnnouncements?.toString() || "0", icon: BookOpen, change: { value: 5, type: "increase" as const } },
  ];

  const defaultStats = [
    { title: "Cursos Activos", value: "12", icon: GraduationCap, change: { value: 12, type: "increase" as const } },
    { title: "Estudiantes", value: "156", icon: Users, change: { value: 18, type: "increase" as const } },
    { title: "Recursos Publicados", value: "24", icon: BookOpen, change: { value: 5, type: "increase" as const } },
  ];

  const displayStats = ((analytics as any)?.overview && ((analytics as any).overview.totalStudents > 0 || (analytics as any).overview.activeCourses > 0)) ? realStats : defaultStats;

  // Debug logging
  console.log('Dashboard Debug:', {
    institutionId,
    institutionIdError,
    session: session?.user,
    coursesData,
    studentsData,
    analytics,
    courses: courses.length,
    students: students.length,
    activeCourses,
    totalStudents,
    displayStats
  });

  // Show error if institution ID cannot be obtained
  if (institutionIdError) {
    return (
      <div className="space-y-6">
        <div className="bg-card shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="text-center">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-4">
                Error al cargar la institución
              </h1>
              <p className="text-muted-foreground mb-4">
                {institutionIdError}
              </p>
              <p className="text-sm text-muted-foreground">
                Por favor, verifica que tu perfil esté correctamente configurado.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Use real courses data
  const recentCourses = courses.slice(0, 3).map(course => ({
    id: course.id,
    title: course.title || course.name,
    status: course.isActive ? "active" as const : "draft" as const
  }));

  // Use real students data
  const studentProgress = students.slice(0, 3).map(student => ({
    name: `${student.student?.firstName || ''} ${student.student?.lastName || ''}`.trim() || 'Sin nombre',
    course: student.program?.name || 'Sin programa',
    progress: Math.round((student.gpa || 0) * 20), // Convert GPA to percentage (assuming 5.0 scale)
    lastActivity: student.updatedAt ? new Date(student.updatedAt).toLocaleDateString() : 'Sin actividad'
  }));


  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-card shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                Panel de Institución
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Bienvenido, {session?.user?.profile?.firstName || 'Administrador'}. 
                Gestiona los cursos, estudiantes y recursos de tu institución.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-blue-100 text-blue-800">
                <GraduationCap className="h-3 w-3 mr-1" />
                Institución
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Institution Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {displayStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  {stat.change.type === 'increase' ? (
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                  ) : stat.change.type === 'decrease' ? (
                    <ArrowDownRight className="h-3 w-3 text-red-500" />
                  ) : (
                    <TrendingUp className="h-3 w-3 text-gray-500" />
                  )}
                  <span className={stat.change.type === 'increase' ? 'text-green-600' : 
                                  stat.change.type === 'decrease' ? 'text-red-600' : 'text-gray-600'}>
                    {stat.change.value > 0 ? '+' : ''}{stat.change.value}%
                  </span>
                  <span>vs mes anterior</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-1 gap-6">
        {/* Recent Courses */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                  <span>Mis Cursos</span>
                </CardTitle>
                <CardDescription>
                  Gestiona y supervisa tus cursos activos
                </CardDescription>
              </div>
              <Button asChild size="sm">
                <Link href="/courses/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Curso
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Cargando cursos...</p>
              </div>
            ) : recentCourses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay cursos creados</p>
                <p className="text-sm">Crea tu primer curso para comenzar</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentCourses.map((course) => (
                <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold">{course.title}</h4>
                      <Badge variant={course.status === 'active' ? 'default' : 'secondary'}>
                        {course.status === 'active' ? 'Activo' : 'Borrador'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/courses/${course.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/courses/${course.id}/edit`}>
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Gestión de Contenido</span>
          </CardTitle>
          <CardDescription>
            Accede a las herramientas de gestión de tu institución
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button asChild variant="outline" className="h-20 flex-col space-y-2">
              <Link href="/courses/create">
                <Plus className="h-6 w-6" />
                <span className="text-sm">Crear Curso</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col space-y-2">
              <Link href="/students">
                <Users className="h-6 w-6" />
                <span className="text-sm">Estudiantes</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col space-y-2">
              <Link href="/resources">
                <FileText className="h-6 w-6" />
                <span className="text-sm">Recursos</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
