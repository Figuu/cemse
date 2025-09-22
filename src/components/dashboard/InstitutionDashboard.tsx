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
  TrendingDown,
  Activity,
  Clock,
  CheckCircle,
  Plus,
  Eye,
  Edit,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  FileText,
  Settings
} from "lucide-react";
import Link from "next/link";
import { useInstitutionAnalytics } from "@/hooks/useInstitutionAnalytics";
import { useInstitutionStudents } from "@/hooks/useInstitutionStudents";

interface InstitutionDashboardProps {
  stats?: any[];
}

export function InstitutionDashboard({ stats = [] }: InstitutionDashboardProps) {
  const { data: session } = useSession();
  
  // Get institution ID from session (assuming it's available in user profile)
  const institutionId = session?.user?.profile?.institutionId;
  
  // Fetch institution analytics and students
  const { data: analytics } = useInstitutionAnalytics(institutionId || '');
  const { data: studentsData } = useInstitutionStudents(institutionId || '');

  // Create stats from real data
  const realStats = analytics ? [
    { title: "Cursos Activos", value: analytics.overview?.totalCourses?.toString() || "0", icon: GraduationCap, change: { value: 12, type: "increase" as const } },
    { title: "Estudiantes", value: analytics.overview?.totalStudents?.toString() || "0", icon: Users, change: { value: 18, type: "increase" as const } },
    { title: "Recursos Publicados", value: "25", icon: BookOpen, change: { value: 5, type: "increase" as const } }, // TODO: Add resources count to analytics
    { title: "Certificados Emitidos", value: "45", icon: Award, change: { value: 22, type: "increase" as const } }, // TODO: Add certificates count to analytics
  ] : [];

  const defaultStats = [
    { title: "Cursos Activos", value: "0", icon: GraduationCap, change: { value: 0, type: "neutral" as const } },
    { title: "Estudiantes", value: "0", icon: Users, change: { value: 0, type: "neutral" as const } },
    { title: "Recursos Publicados", value: "0", icon: BookOpen, change: { value: 0, type: "neutral" as const } },
    { title: "Certificados Emitidos", value: "0", icon: Award, change: { value: 0, type: "neutral" as const } },
  ];

  const displayStats = realStats.length > 0 ? realStats : (stats.length > 0 ? stats : defaultStats);

  // Use real courses data if available (from topPerformingPrograms or create mock data)
  const recentCourses = analytics?.topPerformingPrograms?.slice(0, 3).map(program => ({
    id: program.id,
    title: program.name,
    students: program.enrollments || 0,
    completion: Math.round(program.enrollmentRate || 0),
    status: "active" as const
  })) || [];

  // Use real students data if available
  const students = studentsData?.students || [];
  const studentProgress = students.slice(0, 3).map(student => ({
    name: `${student.student?.firstName || ''} ${student.student?.lastName || ''}`.trim() || 'Sin nombre',
    course: student.program?.name || 'Sin programa',
    progress: Math.round((student.gpa || 0) * 20), // Convert GPA to percentage (assuming 5.0 scale)
    lastActivity: student.updatedAt ? new Date(student.updatedAt).toLocaleDateString() : 'Sin actividad'
  }));

  const getCompletionColor = (completion: number) => {
    if (completion >= 80) return "text-green-600";
    if (completion >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

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
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                <GraduationCap className="h-3 w-3 mr-1" />
                Institución
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Institution Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
                  {analytics ? analytics[stat.title.toLowerCase().replace(/\s+/g, '_')] : stat.value}
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

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Courses */}
        <Card className="lg:col-span-2">
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
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{course.students} estudiantes</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Target className="h-4 w-4" />
                        <span className={getCompletionColor(course.completion)}>
                          {course.completion}% completado
                        </span>
                      </div>
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
          </CardContent>
        </Card>

        {/* Student Progress */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <span>Progreso de Estudiantes</span>
                </CardTitle>
                <CardDescription>
                  Seguimiento de avances recientes
                </CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/students">
                  Ver todos
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {studentProgress.map((student, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{student.course}</p>
                    </div>
                    <span className="text-sm font-semibold">{student.progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(student.progress)}`}
                      style={{ 
                        width: `${Math.min(Math.max(student.progress || 0, 0), 100)}%` 
                      }}
                      role="progressbar"
                      aria-valuenow={student.progress || 0}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Última actividad: {student.lastActivity}
                  </p>
                </div>
              ))}
            </div>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            <Button asChild variant="outline" className="h-20 flex-col space-y-2">
              <Link href="/institution/analytics">
                <BarChart3 className="h-6 w-6" />
                <span className="text-sm">Analíticas</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Overview */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <span>Estadísticas de Cursos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Tasa de Completado Promedio</span>
                <span className="font-semibold text-green-600">73%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Estudiantes Activos</span>
                <span className="font-semibold text-blue-600">142</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Certificados Emitidos</span>
                <span className="font-semibold text-purple-600">89</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Satisfacción Promedio</span>
                <span className="font-semibold text-orange-600">4.7/5</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-orange-600" />
              <span>Actividad Reciente</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <div className="flex-1">
                  <p className="text-sm">Nuevo estudiante en Marketing Digital</p>
                  <p className="text-xs text-muted-foreground">Hace 5 minutos</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <div className="flex-1">
                  <p className="text-sm">Curso "Finanzas Personales" completado</p>
                  <p className="text-xs text-muted-foreground">Hace 15 minutos</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <div className="flex-1">
                  <p className="text-sm">Recurso "Guía de Emprendimiento" publicado</p>
                  <p className="text-xs text-muted-foreground">Hace 1 hora</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <div className="flex-1">
                  <p className="text-sm">Certificado emitido para Ana Martínez</p>
                  <p className="text-xs text-muted-foreground">Hace 2 horas</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
