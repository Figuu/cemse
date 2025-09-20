"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  X, 
  RefreshCw,
  BookOpen,
  Star,
  Clock,
  Users
} from "lucide-react";
import { CourseCategory, CourseLevel } from "@/hooks/useCourses";

interface CourseFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedLevel: string;
  onLevelChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  sortOrder: "asc" | "desc";
  onSortOrderChange: (value: "asc" | "desc") => void;
  isEnrolled: boolean | undefined;
  onEnrolledChange: (value: boolean | undefined) => void;
  categories: CourseCategory[];
  levels: CourseLevel[];
  onReset: () => void;
  onApply: () => void;
  className?: string;
  userRole?: string;
}

export function CourseFilters({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedLevel,
  onLevelChange,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderChange,
  isEnrolled,
  onEnrolledChange,
  categories,
  levels,
  onReset,
  onApply,
  className,
  userRole
}: CourseFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const getSortLabel = (value: string) => {
    switch (value) {
      case "title":
        return "Título";
      case "rating":
        return "Calificación";
      case "studentsCount":
        return "Estudiantes";
      case "duration":
        return "Duración";
      case "createdAt":
        return "Fecha de Creación";
      default:
        return value;
    }
  };

  const getEnrolledLabel = (value: boolean | undefined) => {
    switch (value) {
      case true:
        return "Inscritos";
      case false:
        return "No Inscritos";
      default:
        return "Todos";
    }
  };

  const activeFiltersCount = [
    searchTerm,
    selectedCategory !== "all",
    selectedLevel !== "all",
    sortBy !== "createdAt",
    sortOrder !== "desc",
    isEnrolled !== undefined,
  ].filter(Boolean).length;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <CardTitle className="flex items-center text-lg sm:text-xl">
              <Filter className="h-5 w-5 mr-2" />
              Filtros y Búsqueda
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-sm">
              Encuentra los cursos que mejor se adapten a tus necesidades
            </CardDescription>
          </div>
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full sm:w-auto"
            >
              {showAdvanced ? "Ocultar" : "Mostrar"} Avanzado
            </Button>
            {activeFiltersCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
                className="w-full sm:w-auto"
              >
                <X className="h-4 w-4 mr-1" />
                Limpiar
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Buscar Cursos</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cursos..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>
        </div>

        {/* Basic Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Categoría</label>
            <Select value={selectedCategory} onValueChange={onCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    <div className="flex items-center justify-between w-full">
                      <span>{category.label}</span>
                      <Badge variant="outline" className="ml-2">
                        {category.count}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Nivel</label>
            <Select value={selectedLevel} onValueChange={onLevelChange}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar nivel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los niveles</SelectItem>
                {levels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    <div className="flex items-center justify-between w-full">
                      <span>{level.label}</span>
                      <Badge variant="outline" className="ml-2">
                        {level.count}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium text-sm">Filtros Avanzados</h4>
            
            <div className={`grid grid-cols-1 ${userRole === "YOUTH" ? "sm:grid-cols-2" : "sm:grid-cols-1"} gap-4`}>
              {userRole === "YOUTH" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Estado de Inscripción</label>
                  <Select 
                    value={isEnrolled === undefined ? "all" : isEnrolled.toString()} 
                    onValueChange={(value) => onEnrolledChange(value === "all" ? undefined : value === "true")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="true">Inscritos</SelectItem>
                      <SelectItem value="false">No Inscritos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Ordenar por</label>
                <Select value={sortBy} onValueChange={onSortChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar criterio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Fecha de Creación</SelectItem>
                    <SelectItem value="title">Título</SelectItem>
                    <SelectItem value="rating">Calificación</SelectItem>
                    <SelectItem value="studentsCount">Estudiantes</SelectItem>
                    <SelectItem value="duration">Duración</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Orden</label>
              <div className="flex space-x-2">
                <Button
                  variant={sortOrder === "asc" ? "default" : "outline"}
                  size="sm"
                  onClick={() => onSortOrderChange("asc")}
                  className="flex-1 sm:flex-none"
                >
                  Ascendente
                </Button>
                <Button
                  variant={sortOrder === "desc" ? "default" : "outline"}
                  size="sm"
                  onClick={() => onSortOrderChange("desc")}
                  className="flex-1 sm:flex-none"
                >
                  Descendente
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <BookOpen className="h-4 w-4 text-blue-600 mr-1" />
              <span className="text-sm font-medium">Total</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {categories.reduce((sum, cat) => sum + cat.count, 0)}
            </p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Star className="h-4 w-4 text-yellow-600 mr-1" />
              <span className="text-sm font-medium">Calificados</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">
              {categories.filter(cat => cat.count > 0).length}
            </p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Clock className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm font-medium">Categorías</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {categories.length}
            </p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Users className="h-4 w-4 text-purple-600 mr-1" />
              <span className="text-sm font-medium">Niveles</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {levels.length}
            </p>
          </div>
        </div>

        {/* Apply Button */}
        <div className="flex justify-end pt-4">
          <Button onClick={onApply} className="w-full sm:w-auto">
            <RefreshCw className="h-4 w-4 mr-2" />
            Aplicar Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
