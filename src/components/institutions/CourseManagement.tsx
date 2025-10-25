"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
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
  MapPin,
  MoreHorizontal,
  TrendingUp,
  BarChart3,
  User
} from "lucide-react";
import { 
  useInstitutionCourses, 
  useInstitutionPrograms,
  COURSE_LEVEL_LABELS,
  COURSE_STATUS_LABELS,
  CourseFilters
} from "@/hooks/useInstitutionStudents";
import { InstitutionCourse } from "@/hooks/useInstitutionStudents";

interface CourseManagementProps {
  institutionId: string;
}

export function CourseManagement({ institutionId }: CourseManagementProps) {
  const [filters, setFilters] = useState<CourseFilters>({
    page: 1,
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const { data: coursesData, isLoading } = useInstitutionCourses(institutionId, filters);
  const { data: programsData } = useInstitutionPrograms(institutionId, { limit: 1000 });
  const courses = coursesData?.courses || [];
  const programs = programsData?.programs || [];

  const handleSearch = (search: string) => {
    setSearchTerm(search);
    setFilters(prev => ({
      ...prev,
      search,
      page: 1,
    }));
  };

  const handleFilterChange = (key: keyof CourseFilters, value: any) => {
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
      CANCELLED: "bg-red-100 text-red-800",
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
          <h2 className="text-2xl font-bold">Gestión de Cursos</h2>
          <p className="text-muted-foreground">
            Administra cursos académicos de la institución
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Crear Curso
        </Button>
      </div>

      {/* Search and Filters */}
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
                value={filters.status || ""}
                onChange={(e) => handleFilterChange("status", e.target.value || undefined)}
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
                value={filters.level || ""}
                onChange={(e) => handleFilterChange("level", e.target.value || undefined)}
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
                value={filters.programId || ""}
                onChange={(e) => handleFilterChange("programId", e.target.value || undefined)}
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
                value={filters.sortBy || "createdAt"}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="createdAt">Fecha de creación</option>
                <option value="name">Nombre</option>
                <option value="code">Código</option>
                <option value="level">Nivel</option>
                <option value="credits">Créditos</option>
                <option value="currentStudents">Estudiantes</option>
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
          {isLoading ? (
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
                <Card key={course.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-lg">{course.name}</h4>
                          <Badge variant="outline">{course.code}</Badge>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getLevelColor(course.level)}>
                            {COURSE_LEVEL_LABELS[course.level]}
                          </Badge>
                          <Badge className={getStatusColor(course.status)}>
                            {COURSE_STATUS_LABELS[course.status]}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>

                    {course.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {course.description}
                      </p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4" />
                          <span>{course.credits} créditos</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{course.studentsCount || 0} estudiantes</span>
                        </div>
                        {course.program && (
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            <span>{course.program.name}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 text-sm text-muted-foreground">
                        {course.instructor && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>
                              {course.instructor.instructor.firstName} {course.instructor.instructor.lastName}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

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

      {/* Statistics */}
      {courses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Total Cursos</p>
                  <p className="text-2xl font-bold">{courses.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Activos</p>
                  <p className="text-2xl font-bold">
                    {courses.filter(c => c.status === "ACTIVE").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Total Estudiantes</p>
                  <p className="text-2xl font-bold">
                    {courses.reduce((sum, c) => sum + (c.studentsCount || 0), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium">Total Créditos</p>
                  <p className="text-2xl font-bold">
                    {courses.reduce((sum, c) => sum + c.credits, 0)}
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
