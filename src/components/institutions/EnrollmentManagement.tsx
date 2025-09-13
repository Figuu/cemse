"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  UserPlus, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Eye,
  Users,
  Clock,
  Award,
  Calendar,
  MoreHorizontal,
  TrendingUp,
  BarChart3,
  BookOpen,
  GraduationCap
} from "lucide-react";
import { 
  useInstitutionStudents, 
  useInstitutionPrograms,
  useInstitutionCourses,
  ENROLLMENT_STATUS_LABELS
} from "@/hooks/useInstitutionStudents";

interface EnrollmentManagementProps {
  institutionId: string;
}

interface Enrollment {
  id: string;
  studentId: string;
  institutionId: string;
  programId?: string;
  courseId?: string;
  enrollmentDate: string;
  status: string;
  grade?: number;
  credits?: number;
  semester?: string;
  year?: number;
  notes?: string;
  student: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    avatarUrl?: string;
    studentNumber?: string;
  };
  program?: {
    id: string;
    name: string;
    level: string;
  };
  course?: {
    id: string;
    name: string;
    code: string;
    credits: number;
    level: string;
  };
}

export function EnrollmentManagement({ institutionId }: EnrollmentManagementProps) {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: "",
    status: "",
    programId: "",
    courseId: "",
    semester: "",
    year: "",
    sortBy: "enrollmentDate",
    sortOrder: "desc" as "asc" | "desc",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const { data: studentsData } = useInstitutionStudents(institutionId, { limit: 1000 });
  const { data: programsData } = useInstitutionPrograms(institutionId, { limit: 1000 });
  const { data: coursesData } = useInstitutionCourses(institutionId, { limit: 1000 });

  const students = studentsData?.students || [];
  const programs = programsData?.programs || [];
  const courses = coursesData?.courses || [];

  // Mock enrollments data (in real app, this would come from an API)
  const enrollments: Enrollment[] = [
    {
      id: "1",
      studentId: "1",
      institutionId,
      programId: "1",
      courseId: "1",
      enrollmentDate: "2024-01-15T00:00:00Z",
      status: "ACTIVE",
      grade: 85,
      credits: 3,
      semester: "Primer Semestre",
      year: 2024,
      student: {
        id: "1",
        firstName: "Juan",
        lastName: "Pérez",
        email: "juan.perez@email.com",
        studentNumber: "2024001",
      },
      program: {
        id: "1",
        name: "Ingeniería en Sistemas",
        level: "BACHELOR",
      },
      course: {
        id: "1",
        name: "Programación I",
        code: "PROG101",
        credits: 3,
        level: "BEGINNER",
      },
    },
    {
      id: "2",
      studentId: "2",
      institutionId,
      programId: "1",
      courseId: "2",
      enrollmentDate: "2024-01-15T00:00:00Z",
      status: "ACTIVE",
      grade: 92,
      credits: 4,
      semester: "Primer Semestre",
      year: 2024,
      student: {
        id: "2",
        firstName: "María",
        lastName: "González",
        email: "maria.gonzalez@email.com",
        studentNumber: "2024002",
      },
      program: {
        id: "1",
        name: "Ingeniería en Sistemas",
        level: "BACHELOR",
      },
      course: {
        id: "2",
        name: "Matemáticas I",
        code: "MATH101",
        credits: 4,
        level: "BEGINNER",
      },
    },
  ];

  const handleSearch = (search: string) => {
    setSearchTerm(search);
    setFilters(prev => ({
      ...prev,
      search,
      page: 1,
    }));
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: "bg-green-100 text-green-800",
      INACTIVE: "bg-gray-100 text-gray-800",
      COMPLETED: "bg-blue-100 text-blue-800",
      DROPPED: "bg-red-100 text-red-800",
      SUSPENDED: "bg-yellow-100 text-yellow-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getGradeColor = (grade?: number) => {
    if (!grade) return "text-muted-foreground";
    if (grade >= 90) return "text-green-600";
    if (grade >= 80) return "text-blue-600";
    if (grade >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Inscripciones</h2>
          <p className="text-muted-foreground">
            Administra inscripciones de estudiantes en programas y cursos
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Inscripción
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Buscar Inscripciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por estudiante, programa o curso..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Estado</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value || "")}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Todos los estados</option>
                {Object.entries(ENROLLMENT_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Programa</label>
              <select
                value={filters.programId}
                onChange={(e) => handleFilterChange("programId", e.target.value || "")}
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
              <label className="text-sm font-medium mb-2 block">Curso</label>
              <select
                value={filters.courseId}
                onChange={(e) => handleFilterChange("courseId", e.target.value || "")}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Todos los cursos</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Ordenar por</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="enrollmentDate">Fecha de inscripción</option>
                <option value="student">Estudiante</option>
                <option value="program">Programa</option>
                <option value="course">Curso</option>
                <option value="grade">Calificación</option>
                <option value="status">Estado</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enrollments List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Inscripciones</CardTitle>
        </CardHeader>
        <CardContent>
          {enrollments.length > 0 ? (
            <div className="space-y-4">
              {enrollments.map((enrollment) => (
                <Card key={enrollment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                          {enrollment.student.avatarUrl ? (
                            <img
                              src={enrollment.student.avatarUrl}
                              alt={`${enrollment.student.firstName} ${enrollment.student.lastName}`}
                              className="h-full w-full rounded-full object-cover"
                            />
                          ) : (
                            <Users className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">
                              {enrollment.student.firstName} {enrollment.student.lastName}
                            </h4>
                            <Badge variant="outline">#{enrollment.student.studentNumber}</Badge>
                            <Badge className={getStatusColor(enrollment.status)}>
                              {ENROLLMENT_STATUS_LABELS[enrollment.status]}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {enrollment.student.email}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        {enrollment.program && (
                          <div className="flex items-center gap-2 text-sm">
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Programa:</span>
                            <span>{enrollment.program.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {enrollment.program.level}
                            </Badge>
                          </div>
                        )}
                        {enrollment.course && (
                          <div className="flex items-center gap-2 text-sm">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Curso:</span>
                            <span>{enrollment.course.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {enrollment.course.code}
                            </Badge>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Inscrito:</span>
                          <span>{new Date(enrollment.enrollmentDate).toLocaleDateString('es-ES')}</span>
                        </div>
                        {enrollment.semester && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Semestre:</span>
                            <span>{enrollment.semester} {enrollment.year}</span>
                          </div>
                        )}
                        {enrollment.credits && (
                          <div className="flex items-center gap-2 text-sm">
                            <Award className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Créditos:</span>
                            <span>{enrollment.credits}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {enrollment.grade && (
                      <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Calificación:</span>
                          <span className={`text-lg font-bold ${getGradeColor(enrollment.grade)}`}>
                            {enrollment.grade}%
                          </span>
                        </div>
                      </div>
                    )}

                    {enrollment.notes && (
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-1">Notas:</p>
                        <p className="text-sm text-muted-foreground">{enrollment.notes}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
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
              <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay inscripciones</h3>
              <p className="text-muted-foreground mb-4">
                Comienza creando inscripciones para estudiantes
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Inscripción
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      {enrollments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Total Inscripciones</p>
                  <p className="text-2xl font-bold">{enrollments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Activas</p>
                  <p className="text-2xl font-bold">
                    {enrollments.filter(e => e.status === "ACTIVE").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Completadas</p>
                  <p className="text-2xl font-bold">
                    {enrollments.filter(e => e.status === "COMPLETED").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium">Promedio General</p>
                  <p className="text-2xl font-bold">
                    {enrollments.filter(e => e.grade).length > 0 
                      ? Math.round(enrollments.reduce((sum, e) => sum + (e.grade || 0), 0) / enrollments.filter(e => e.grade).length)
                      : 0
                    }%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
