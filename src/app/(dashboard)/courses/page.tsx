"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Plus,
  RefreshCw,
  AlertCircle,
  Grid3X3,
  List
} from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useCourses } from "@/hooks/useCourses";
import { CourseCard } from "@/components/courses/CourseCard";
import { CourseFilters } from "@/components/courses/CourseFilters";
import { RecommendationSection } from "@/components/courses/RecommendationSection";

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isEnrolled, setIsEnrolled] = useState<boolean | undefined>(undefined);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState("all");

  const {
    courses,
    categories,
    levels,
    isLoading,
    error,
    refetch,
    enrollInCourse,
    unenrollFromCourse,
  } = useCourses({
    search: searchTerm || undefined,
    category: selectedCategory !== "all" ? selectedCategory : undefined,
    level: selectedLevel !== "all" ? selectedLevel : undefined,
    sortBy,
    sortOrder,
    isEnrolled,
  });

  const enrolledCourses = courses.filter(course => course.isEnrolled);
  const availableCourses = courses.filter(course => !course.isEnrolled);

  const handleEnroll = async (courseId: string) => {
    await enrollInCourse(courseId);
  };

  const handleUnenroll = async (courseId: string) => {
    await unenrollFromCourse(courseId);
  };

  const handleViewCourse = (courseId: string) => {
    // Navigate to course detail page
    window.location.href = `/courses/${courseId}`;
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedLevel("all");
    setSortBy("createdAt");
    setSortOrder("desc");
    setIsEnrolled(undefined);
  };

  const handleApplyFilters = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Cursos</h1>
            <p className="text-muted-foreground">Explora y gestiona tus cursos de formación profesional</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-video bg-gray-200"></div>
              <CardContent className="p-6">
                <div className="space-y-3">
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

  if (error) {
  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Cursos</h1>
            <p className="text-muted-foreground">Explora y gestiona tus cursos de formación profesional</p>
          </div>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error al cargar cursos</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={refetch}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={["YOUTH", "COMPANIES", "INSTITUTION", "ADMIN", "INSTRUCTOR"]}>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cursos</h1>
          <p className="text-muted-foreground">
            Explora y gestiona tus cursos de formación profesional
          </p>
        </div>
          <div className="flex space-x-2 mt-4 sm:mt-0">
            <Button variant="outline" onClick={refetch}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
          Crear Curso
        </Button>
          </div>
      </div>

        {/* Filters */}
        <CourseFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedLevel={selectedLevel}
          onLevelChange={setSelectedLevel}
          sortBy={sortBy}
          onSortChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          isEnrolled={isEnrolled}
          onEnrolledChange={setIsEnrolled}
          categories={categories}
          levels={levels}
          onReset={handleResetFilters}
          onApply={handleApplyFilters}
        />

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
              </Button>
            </div>
          <div className="text-sm text-muted-foreground">
            {courses.length} cursos encontrados
                </div>
              </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Todos ({courses.length})</TabsTrigger>
            <TabsTrigger value="enrolled">Mis Cursos ({enrolledCourses.length})</TabsTrigger>
            <TabsTrigger value="available">Disponibles ({availableCourses.length})</TabsTrigger>
            <TabsTrigger value="recommendations">Recomendaciones</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {courses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No se encontraron cursos</h3>
            <p className="text-muted-foreground">
              Intenta ajustar tus filtros de búsqueda
            </p>
          </CardContent>
        </Card>
            ) : (
              <div className={cn(
                "gap-6",
                viewMode === "grid" 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
                  : "space-y-4"
              )}>
                {courses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onEnroll={handleEnroll}
                    onUnenroll={handleUnenroll}
                    onView={handleViewCourse}
                    showActions={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="enrolled" className="space-y-4">
            {enrolledCourses.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No tienes cursos inscritos</h3>
                  <p className="text-muted-foreground">
                    Explora los cursos disponibles e inscríbete en los que te interesen
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className={cn(
                "gap-6",
                viewMode === "grid" 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
                  : "space-y-4"
              )}>
                {enrolledCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onEnroll={handleEnroll}
                    onUnenroll={handleUnenroll}
                    onView={handleViewCourse}
                    showActions={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="available" className="space-y-4">
            {availableCourses.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay cursos disponibles</h3>
                  <p className="text-muted-foreground">
                    Todos los cursos están en tu lista de inscritos
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className={cn(
                "gap-6",
                viewMode === "grid" 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
                  : "space-y-4"
              )}>
                {availableCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onEnroll={handleEnroll}
                    onUnenroll={handleUnenroll}
                    onView={handleViewCourse}
                    showActions={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <RecommendationSection
              title="Recomendaciones para ti"
              description="Cursos seleccionados especialmente para ti basados en tus intereses y progreso"
              showTabs={true}
              limit={12}
              onEnroll={handleEnroll}
              onView={handleViewCourse}
              onBookmark={(courseId) => {
                // TODO: Implement bookmark functionality
                console.log("Bookmarking course:", courseId);
              }}
            />
          </TabsContent>
        </Tabs>
    </div>
    </RoleGuard>
  );
}
