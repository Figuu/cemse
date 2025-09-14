"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  GraduationCap, 
  Users, 
  Award,
  Plus,
  RefreshCw,
  AlertCircle,
  Search,
  Filter,
  BarChart3,
  TrendingUp,
  Settings
} from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useInstructorCourses, useInstructorStudents, useInstructorAnalytics } from "@/hooks/useInstructorDashboard";
import { InstructorCourseCard } from "@/components/instructor/InstructorCourseCard";
import { InstructorStudentCard } from "@/components/instructor/InstructorStudentCard";

export default function InstructorDashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeRange, setTimeRange] = useState("30");

  const {
    courses,
    isLoading: coursesLoading,
    error: coursesError,
    refetch: refetchCourses,
    deleteCourse,
  } = useInstructorCourses({
    search: searchTerm || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const {
    students,
    isLoading: studentsLoading,
    error: studentsError,
    refetch: refetchStudents,
  } = useInstructorStudents();

  const {
    analytics,
    isLoading: analyticsLoading,
    error: analyticsError,
    refetch: refetchAnalytics,
  } = useInstructorAnalytics({
    timeRange: parseInt(timeRange),
  });

  const filteredCourses = courses.filter(course => {
    if (searchTerm) {
      return course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
             course.description.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  const filteredStudents = students.filter(student => {
    if (searchTerm) {
      return student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
             student.course.title.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  const handleCreateCourse = () => {
    // This would open a modal or navigate to a create course page
    console.log("Create course");
  };

  const handleViewCourse = (courseId: string) => {
    // This would navigate to course detail page
    console.log("View course:", courseId);
  };

  const handleEditCourse = (courseId: string) => {
    // This would open edit modal or navigate to edit page
    console.log("Edit course:", courseId);
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este curso?")) {
      await deleteCourse(courseId);
    }
  };

  const handleManageStudents = (courseId: string) => {
    // This would navigate to course students page
    console.log("Manage students for course:", courseId);
  };

  const handleManageContent = (courseId: string) => {
    // This would navigate to course content management page
    console.log("Manage content for course:", courseId);
  };

  const handleViewStudent = (studentId: string) => {
    // This would navigate to student profile page
    console.log("View student:", studentId);
  };

  const handleMessageStudent = (studentId: string) => {
    // This would open messaging interface
    console.log("Message student:", studentId);
  };

  const handleViewStudentProgress = (studentId: string) => {
    // This would navigate to student progress page
    console.log("View student progress:", studentId);
  };

  if (coursesLoading || studentsLoading || analyticsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Panel del Instructor</h1>
            <p className="text-muted-foreground">Gestiona tus cursos y estudiantes</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (coursesError || studentsError || analyticsError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Panel del Instructor</h1>
            <p className="text-muted-foreground">Gestiona tus cursos y estudiantes</p>
          </div>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error al cargar datos</h3>
            <p className="text-muted-foreground mb-4">
              {coursesError || studentsError || analyticsError}
            </p>
            <Button onClick={() => {
              refetchCourses();
              refetchStudents();
              refetchAnalytics();
            }}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={["INSTRUCTOR"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Panel del Instructor</h1>
            <p className="text-muted-foreground">
              Gestiona tus cursos, estudiantes y analíticas
            </p>
          </div>
          <div className="flex space-x-2 mt-4 sm:mt-0">
            <Button variant="outline" onClick={() => {
              refetchCourses();
              refetchStudents();
              refetchAnalytics();
            }}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
            <Button onClick={handleCreateCourse}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Curso
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configuración
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar cursos y estudiantes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos los estados</option>
                  <option value="ACTIVE">Activos</option>
                  <option value="DRAFT">Borradores</option>
                  <option value="COMPLETED">Completados</option>
                </select>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="7">Últimos 7 días</option>
                  <option value="30">Últimos 30 días</option>
                  <option value="90">Últimos 90 días</option>
                  <option value="365">Último año</option>
                </select>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Overview */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="text-center py-4">
                <div className="flex items-center justify-center mb-2">
                  <GraduationCap className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-600">{analytics.overview.totalCourses}</div>
                <div className="text-sm text-muted-foreground">Cursos Totales</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="text-center py-4">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-600">{analytics.overview.totalStudents}</div>
                <div className="text-sm text-muted-foreground">Estudiantes</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="text-center py-4">
                <div className="flex items-center justify-center mb-2">
                  <Award className="h-8 w-8 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-purple-600">{analytics.overview.completionRate}%</div>
                <div className="text-sm text-muted-foreground">Tasa de Completación</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="text-center py-4">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-orange-600">{analytics.overview.averageProgress}%</div>
                <div className="text-sm text-muted-foreground">Progreso Promedio</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="courses">Cursos ({filteredCourses.length})</TabsTrigger>
            <TabsTrigger value="students">Estudiantes ({filteredStudents.length})</TabsTrigger>
            <TabsTrigger value="analytics">Analíticas</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cursos Recientes</CardTitle>
                  <CardDescription>
                    Tus cursos más recientes y su rendimiento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredCourses.slice(0, 3).map((course) => (
                      <div key={course.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{course.title}</h4>
                          <p className="text-sm text-muted-foreground">{course.stats.totalStudents} estudiantes</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full transition-all"
                                style={{ width: `${course.stats.averageProgress}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">{course.stats.averageProgress}%</span>
                          </div>
                        </div>
                        <Badge className={course.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                          {course.status === "ACTIVE" ? "Activo" : "Borrador"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Estudiantes Recientes</CardTitle>
                  <CardDescription>
                    Últimos estudiantes inscritos en tus cursos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredStudents.slice(0, 3).map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                            <Users className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <h4 className="font-medium">{student.name}</h4>
                            <p className="text-sm text-muted-foreground">{student.course.title}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{student.enrollment.progressPercentage}%</div>
                          <div className="text-xs text-muted-foreground">
                            {student.enrollment.isCompleted ? "Completado" : "En Progreso"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="courses" className="space-y-4">
            {filteredCourses.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No se encontraron cursos</h3>
                  <p className="text-muted-foreground">
                    Crea tu primer curso para comenzar a enseñar
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <InstructorCourseCard
                    key={course.id}
                    course={course}
                    onView={handleViewCourse}
                    onEdit={handleEditCourse}
                    onDelete={handleDeleteCourse}
                    onManageStudents={handleManageStudents}
                    onManageContent={handleManageContent}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="students" className="space-y-4">
            {filteredStudents.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No se encontraron estudiantes</h3>
                  <p className="text-muted-foreground">
                    Los estudiantes aparecerán aquí cuando se inscriban en tus cursos
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredStudents.map((student) => (
                  <InstructorStudentCard
                    key={student.id}
                    student={student}
                    onView={handleViewStudent}
                    onMessage={handleMessageStudent}
                    onViewProgress={handleViewStudentProgress}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            {analytics ? (
              <div className="space-y-6">
                {/* Course Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle>Rendimiento de Cursos</CardTitle>
                    <CardDescription>
                      Análisis del rendimiento de tus cursos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.coursePerformance.map((course) => (
                        <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium">{course.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {course.totalStudents} estudiantes • {course.completionRate}% completado
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{course.averageProgress}%</div>
                            <div className="text-xs text-muted-foreground">Progreso Promedio</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Student Engagement */}
                <Card>
                  <CardHeader>
                    <CardTitle>Compromiso de Estudiantes</CardTitle>
                    <CardDescription>
                      Actividad reciente de tus estudiantes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.studentEngagement.slice(0, 5).map((student) => (
                        <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                              <Users className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                              <h4 className="font-medium">{student.name}</h4>
                              <p className="text-sm text-muted-foreground">{student.course.title}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{student.progress}%</div>
                            <div className="text-xs text-muted-foreground">
                              {student.isCompleted ? "Completado" : "En Progreso"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay datos de analíticas</h3>
                  <p className="text-muted-foreground">
                    Los datos de analíticas aparecerán aquí cuando tengas cursos y estudiantes
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </RoleGuard>
  );
}
