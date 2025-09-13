"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  UserPlus, 
  Search, 
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  RefreshCw,
  TrendingUp,
  Calendar,
  Award,
  Clock,
  MapPin,
  Phone,
  Mail,
  MoreHorizontal
} from "lucide-react";
import { 
  useInstitutionStudents, 
  useInstitutionPrograms, 
  useInstitutionCourses,
  STUDENT_STATUS_LABELS,
  PROGRAM_LEVEL_LABELS,
  COURSE_LEVEL_LABELS,
  StudentFilters,
  ProgramFilters,
  CourseFilters
} from "@/hooks/useInstitutionStudents";
import { InstitutionStudent, InstitutionProgram, InstitutionCourse } from "@/hooks/useInstitutionStudents";

interface StudentManagementDashboardProps {
  institutionId: string;
}

export function StudentManagementDashboard({ institutionId }: StudentManagementDashboardProps) {
  const [activeTab, setActiveTab] = useState("students");
  const [studentFilters, setStudentFilters] = useState<StudentFilters>({
    page: 1,
    limit: 20,
    sortBy: "enrollmentDate",
    sortOrder: "desc",
  });
  const [programFilters, setProgramFilters] = useState<ProgramFilters>({
    page: 1,
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [courseFilters, setCourseFilters] = useState<CourseFilters>({
    page: 1,
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const { data: studentsData, isLoading: studentsLoading } = useInstitutionStudents(institutionId, studentFilters);
  const { data: programsData, isLoading: programsLoading } = useInstitutionPrograms(institutionId, programFilters);
  const { data: coursesData, isLoading: coursesLoading } = useInstitutionCourses(institutionId, courseFilters);

  const students = studentsData?.students || [];
  const programs = programsData?.programs || [];
  const courses = coursesData?.courses || [];

  const handleStudentSearch = (search: string) => {
    setSearchTerm(search);
    setStudentFilters(prev => ({
      ...prev,
      search,
      page: 1,
    }));
  };

  const handleStudentFilterChange = (key: keyof StudentFilters, value: any) => {
    setStudentFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const handleProgramFilterChange = (key: keyof ProgramFilters, value: any) => {
    setProgramFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const handleCourseFilterChange = (key: keyof CourseFilters, value: any) => {
    setCourseFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: "bg-green-100 text-green-800",
      INACTIVE: "bg-gray-100 text-gray-800",
      SUSPENDED: "bg-yellow-100 text-yellow-800",
      GRADUATED: "bg-blue-100 text-blue-800",
      DROPPED_OUT: "bg-red-100 text-red-800",
      TRANSFERRED: "bg-purple-100 text-purple-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      BEGINNER: "bg-green-100 text-green-800",
      INTERMEDIATE: "bg-blue-100 text-blue-800",
      ADVANCED: "bg-orange-100 text-orange-800",
      EXPERT: "bg-red-100 text-red-800",
    };
    return colors[level] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Estudiantes</h2>
          <p className="text-muted-foreground">
            Administra estudiantes, programas y cursos de la institución
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
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Estudiantes</p>
                <p className="text-2xl font-bold">{students.length}</p>
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
                <p className="text-2xl font-bold">{programs.filter(p => p.status === "ACTIVE").length}</p>
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
                <p className="text-2xl font-bold">{courses.filter(c => c.status === "ACTIVE").length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estudiantes Activos</p>
                <p className="text-2xl font-bold">{students.filter(s => s.status === "ACTIVE").length}</p>
              </div>
              <UserPlus className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="students">Estudiantes</TabsTrigger>
          <TabsTrigger value="programs">Programas</TabsTrigger>
          <TabsTrigger value="courses">Cursos</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-6">
          {/* Students Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Buscar Estudiantes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Buscar por nombre, número de estudiante, email..."
                      value={searchTerm}
                      onChange={(e) => handleStudentSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Estudiante
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Estado</label>
                  <select
                    value={studentFilters.status || ""}
                    onChange={(e) => handleStudentFilterChange("status", e.target.value || undefined)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Todos los estados</option>
                    {Object.entries(STUDENT_STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Programa</label>
                  <select
                    value={studentFilters.programId || ""}
                    onChange={(e) => handleStudentFilterChange("programId", e.target.value || undefined)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Todos los programas</option>
                    {programs.map((program) => (
                      <option key={program.id} value={program.id}>
                        {program.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Ordenar por</label>
                  <select
                    value={studentFilters.sortBy || "enrollmentDate"}
                    onChange={(e) => handleStudentFilterChange("sortBy", e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="enrollmentDate">Fecha de inscripción</option>
                    <option value="studentNumber">Número de estudiante</option>
                    <option value="status">Estado</option>
                    <option value="gpa">GPA</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Students List */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Estudiantes</CardTitle>
            </CardHeader>
            <CardContent>
              {studentsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center gap-4 p-4 border rounded-lg">
                      <div className="h-10 w-10 bg-muted rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : students.length > 0 ? (
                <div className="space-y-4">
                  {students.map((student) => (
                    <div key={student.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50">
                      <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                        {student.student.avatarUrl ? (
                          <img
                            src={student.student.avatarUrl}
                            alt={`${student.student.firstName} ${student.student.lastName}`}
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          <Users className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">
                            {student.student.firstName} {student.student.lastName}
                          </h4>
                          <Badge className={getStatusColor(student.status)}>
                            {STUDENT_STATUS_LABELS[student.status]}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>#{student.studentNumber}</span>
                          <span>{student.student.email}</span>
                          {student.program && (
                            <span>{student.program.name}</span>
                          )}
                          {student.gpa && (
                            <span>GPA: {student.gpa.toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay estudiantes</h3>
                  <p className="text-muted-foreground mb-4">
                    Comienza agregando estudiantes a la institución
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Primer Estudiante
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="programs" className="space-y-6">
          {/* Programs Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Buscar Programas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Buscar programas..."
                      value={programFilters.search || ""}
                      onChange={(e) => handleProgramFilterChange("search", e.target.value || undefined)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Programa
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Estado</label>
                  <select
                    value={programFilters.status || ""}
                    onChange={(e) => handleProgramFilterChange("status", e.target.value || undefined)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Todos los estados</option>
                    {Object.entries(PROGRAM_STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Nivel</label>
                  <select
                    value={programFilters.level || ""}
                    onChange={(e) => handleProgramFilterChange("level", e.target.value || undefined)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Todos los niveles</option>
                    {Object.entries(PROGRAM_LEVEL_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Ordenar por</label>
                  <select
                    value={programFilters.sortBy || "createdAt"}
                    onChange={(e) => handleProgramFilterChange("sortBy", e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="createdAt">Fecha de creación</option>
                    <option value="name">Nombre</option>
                    <option value="level">Nivel</option>
                    <option value="duration">Duración</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Programs List */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Programas</CardTitle>
            </CardHeader>
            <CardContent>
              {programsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="animate-pulse p-4 border rounded-lg">
                      <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : programs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {programs.map((program) => (
                    <Card key={program.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold">{program.name}</h4>
                          <Badge className={getStatusColor(program.status)}>
                            {PROGRAM_STATUS_LABELS[program.status]}
                          </Badge>
                        </div>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4" />
                            <span>{PROGRAM_LEVEL_LABELS[program.level]}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{program.duration} meses</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{program.currentStudents} estudiantes</span>
                          </div>
                          {program.credits && (
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4" />
                              <span>{program.credits} créditos</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-4">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Eye className="h-4 w-4 mr-2" />
                            Ver
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay programas</h3>
                  <p className="text-muted-foreground mb-4">
                    Comienza creando programas académicos
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primer Programa
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          {/* Courses Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Buscar Cursos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Buscar cursos..."
                      value={courseFilters.search || ""}
                      onChange={(e) => handleCourseFilterChange("search", e.target.value || undefined)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Curso
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Estado</label>
                  <select
                    value={courseFilters.status || ""}
                    onChange={(e) => handleCourseFilterChange("status", e.target.value || undefined)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Todos los estados</option>
                    {Object.entries(COURSE_STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Nivel</label>
                  <select
                    value={courseFilters.level || ""}
                    onChange={(e) => handleCourseFilterChange("level", e.target.value || undefined)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Todos los niveles</option>
                    {Object.entries(COURSE_LEVEL_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Programa</label>
                  <select
                    value={courseFilters.programId || ""}
                    onChange={(e) => handleCourseFilterChange("programId", e.target.value || undefined)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Todos los programas</option>
                    {programs.map((program) => (
                      <option key={program.id} value={program.id}>
                        {program.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Ordenar por</label>
                  <select
                    value={courseFilters.sortBy || "createdAt"}
                    onChange={(e) => handleCourseFilterChange("sortBy", e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="createdAt">Fecha de creación</option>
                    <option value="name">Nombre</option>
                    <option value="code">Código</option>
                    <option value="level">Nivel</option>
                    <option value="credits">Créditos</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Courses List */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Cursos</CardTitle>
            </CardHeader>
            <CardContent>
              {coursesLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="animate-pulse p-4 border rounded-lg">
                      <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : courses.length > 0 ? (
                <div className="space-y-4">
                  {courses.map((course) => (
                    <div key={course.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50">
                      <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{course.name}</h4>
                          <Badge className={getLevelColor(course.level)}>
                            {COURSE_LEVEL_LABELS[course.level]}
                          </Badge>
                          <Badge variant="outline">
                            {course.code}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{course.credits} créditos</span>
                          {course.program && (
                            <span>{course.program.name}</span>
                          )}
                          {course.instructor && (
                            <span>
                              {course.instructor.instructor.firstName} {course.instructor.instructor.lastName}
                            </span>
                          )}
                          <span>{course.currentStudents} estudiantes</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay cursos</h3>
                  <p className="text-muted-foreground mb-4">
                    Comienza creando cursos académicos
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primer Curso
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
