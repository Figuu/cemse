"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Eye,
  Users,
  Clock,
  Award,
  BookOpen,
  Calendar,
  MoreHorizontal,
  TrendingUp,
  BarChart3
} from "lucide-react";
import { 
  useInstitutionPrograms, 
  PROGRAM_LEVEL_LABELS,
  PROGRAM_STATUS_LABELS,
  ProgramFilters
} from "@/hooks/useInstitutionStudents";
import { InstitutionProgram } from "@/hooks/useInstitutionStudents";

interface ProgramManagementProps {
  institutionId: string;
}

export function ProgramManagement({ institutionId }: ProgramManagementProps) {
  const [filters, setFilters] = useState<ProgramFilters>({
    page: 1,
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const { data: programsData, isLoading } = useInstitutionPrograms(institutionId, filters);
  const programs = programsData?.programs || [];

  const handleSearch = (search: string) => {
    setSearchTerm(search);
    setFilters(prev => ({
      ...prev,
      search,
      page: 1,
    }));
  };

  const handleFilterChange = (key: keyof ProgramFilters, value: any) => {
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
      SUSPENDED: "bg-yellow-100 text-yellow-800",
      COMPLETED: "bg-blue-100 text-blue-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      CERTIFICATE: "bg-blue-100 text-blue-800",
      DIPLOMA: "bg-green-100 text-green-800",
      ASSOCIATE: "bg-purple-100 text-purple-800",
      BACHELOR: "bg-orange-100 text-orange-800",
      MASTER: "bg-red-100 text-red-800",
      DOCTORATE: "bg-indigo-100 text-indigo-800",
      CONTINUING_EDUCATION: "bg-pink-100 text-pink-800",
    };
    return colors[level] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Programas</h2>
          <p className="text-muted-foreground">
            Administra programas académicos de la institución
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Crear Programa
        </Button>
      </div>

      {/* Search and Filters */}
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
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Estado</label>
              <select
                value={filters.status || ""}
                onChange={(e) => handleFilterChange("status", e.target.value || undefined)}
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
                value={filters.level || ""}
                onChange={(e) => handleFilterChange("level", e.target.value || undefined)}
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
                value={filters.sortBy || "createdAt"}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="createdAt">Fecha de creación</option>
                <option value="name">Nombre</option>
                <option value="level">Nivel</option>
                <option value="duration">Duración</option>
                <option value="currentStudents">Estudiantes</option>
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
          {isLoading ? (
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
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-1">{program.name}</h4>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getLevelColor(program.level)}>
                            {PROGRAM_LEVEL_LABELS[program.level]}
                          </Badge>
                          <Badge className={getStatusColor(program.status)}>
                            {PROGRAM_STATUS_LABELS[program.status]}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>

                    {program.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {program.description}
                      </p>
                    )}

                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{program.duration} meses</span>
                      </div>
                      {program.credits && (
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          <span>{program.credits} créditos</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{program.currentStudents} estudiantes</span>
                        {program.maxStudents && (
                          <span>/ {program.maxStudents} máximo</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        <span>{program._count?.courses || 0} cursos</span>
                      </div>
                    </div>

                    {program.startDate && (
                      <div className="text-xs text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            Inicio: {new Date(program.startDate).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                        {program.endDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              Fin: {new Date(program.endDate).toLocaleDateString('es-ES')}
                            </span>
                          </div>
                        )}
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

      {/* Statistics */}
      {programs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Total Programas</p>
                  <p className="text-2xl font-bold">{programs.length}</p>
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
                    {programs.filter(p => p.status === "ACTIVE").length}
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
                    {programs.reduce((sum, p) => sum + p.currentStudents, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium">Total Cursos</p>
                  <p className="text-2xl font-bold">
                    {programs.reduce((sum, p) => sum + (p._count?.courses || 0), 0)}
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
