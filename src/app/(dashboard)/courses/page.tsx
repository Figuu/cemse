"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { CourseCreationModal } from "@/components/courses/CourseCreationModal";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";

export default function CoursesPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedMunicipality, setSelectedMunicipality] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isEnrolled, setIsEnrolled] = useState<boolean | undefined>(undefined);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteCourseId, setDeleteCourseId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Role-based logic
  const isYouth = session?.user?.role === "YOUTH";
  const isInstitution = session?.user?.role === "INSTITUTION";
  const isSuperAdmin = session?.user?.role === "SUPERADMIN";

  // Fetch municipality institutions for the filter (only for authorized users)
  const { data: municipalityInstitutions = [] } = useQuery({
    queryKey: ['municipality-institutions-courses'],
    queryFn: async () => {
      const response = await fetch('/api/admin/institutions');
      if (!response.ok) throw new Error('Failed to fetch institutions');
      const institutions = await response.json();
      // Filter only municipality type institutions
      return institutions.filter((institution: any) => institution.institutionType === 'MUNICIPALITY');
    },
    enabled: !isYouth // Only fetch for non-youth users
  });

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

  // Filter courses by municipality
  const filteredCourses = courses.filter(course => {
    if (selectedMunicipality === "all") return true;
    return course.institutionName === selectedMunicipality;
  });

  const enrolledCourses = filteredCourses.filter(course => course.isEnrolled);
  const availableCourses = filteredCourses.filter(course => !course.isEnrolled);

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
    setSelectedMunicipality("all");
    setSortBy("createdAt");
    setSortOrder("desc");
    setIsEnrolled(undefined);
  };

  const handleApplyFilters = () => {
    refetch();
  };

  const handleCreateCourse = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateSuccess = () => {
    refetch();
  };

  const handleEditCourse = (courseId: string) => {
    router.push(`/courses/${courseId}/edit`);
  };

  const handleDeleteCourse = (courseId: string) => {
    setDeleteCourseId(courseId);
  };

  const confirmDelete = async () => {
    if (!deleteCourseId) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/courses/${deleteCourseId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        refetch();
        setDeleteCourseId(null);
      } else {
        const errorData = await response.json();
        console.error('Error deleting course:', errorData.error);
      }
    } catch (error) {
      console.error('Error deleting course:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-6">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-xl font-bold text-foreground sm:text-2xl">Cursos</h1>
            <p className="text-sm text-muted-foreground sm:text-base">Explora y gestiona tus cursos de formación profesional</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-video bg-gray-200"></div>
              <CardContent className="p-4 sm:p-6">
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
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-6">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-xl font-bold text-foreground sm:text-2xl">Cursos</h1>
            <p className="text-sm text-muted-foreground sm:text-base">Explora y gestiona tus cursos de formación profesional</p>
          </div>
        </div>
        <Card>
          <CardContent className="text-center py-8 sm:py-12">
            <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold mb-2">Error al cargar cursos</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={refetch} size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={["YOUTH", "COMPANIES", "INSTITUTION", "SUPERADMIN"]}>
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">Cursos</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Explora y gestiona tus cursos de formación profesional
          </p>
        </div>
        {!isYouth && (
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <Button onClick={handleCreateCourse} className="w-full sm:w-auto text-xs sm:text-sm">
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              <span className="hidden sm:inline">Crear Curso</span>
              <span className="sm:hidden">Crear</span>
            </Button>
          </div>
        )}
      </div>

        {/* Filters */}
        <CourseFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedLevel={selectedLevel}
          onLevelChange={setSelectedLevel}
          selectedMunicipality={selectedMunicipality}
          onMunicipalityChange={setSelectedMunicipality}
          sortBy={sortBy}
          onSortChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          isEnrolled={isEnrolled}
          onEnrolledChange={setIsEnrolled}
          categories={categories}
          levels={levels}
          municipalityInstitutions={municipalityInstitutions}
          onReset={handleResetFilters}
          onApply={handleApplyFilters}
          userRole={session?.user?.role}
        />

        {/* View Mode Toggle */}
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="flex-1 sm:flex-none text-xs sm:text-sm"
            >
              <Grid3X3 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="ml-2 sm:hidden">Cuadrícula</span>
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="flex-1 sm:flex-none text-xs sm:text-sm"
            >
              <List className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="ml-2 sm:hidden">Lista</span>
            </Button>
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-right">
            {courses.length} cursos encontrados
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className={`grid w-full h-auto ${isYouth ? 'grid-cols-3' : 'grid-cols-1'}`}>
            <TabsTrigger value="all" className="text-xs sm:text-sm py-2">
              <span className="hidden sm:inline">Todos ({courses.length})</span>
              <span className="sm:hidden">Todos</span>
            </TabsTrigger>
            {isYouth && (
              <>
                <TabsTrigger value="enrolled" className="text-xs sm:text-sm py-2">
                  <span className="hidden sm:inline">Mis Cursos ({enrolledCourses.length})</span>
                  <span className="sm:hidden">Mis Cursos</span>
                </TabsTrigger>
                <TabsTrigger value="available" className="text-xs sm:text-sm py-2">
                  <span className="hidden sm:inline">Disponibles ({availableCourses.length})</span>
                  <span className="sm:hidden">Disponibles</span>
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {courses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8 sm:py-12">
            <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold mb-2">No se encontraron cursos</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Intenta ajustar tus filtros de búsqueda
            </p>
          </CardContent>
        </Card>
            ) : (
              <div className={cn(
                "gap-3 sm:gap-4 lg:gap-6",
                viewMode === "grid" 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" 
                  : "space-y-3 sm:space-y-4"
              )}>
                {courses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onEnroll={handleEnroll}
                    onUnenroll={handleUnenroll}
                    onView={handleViewCourse}
                    onEdit={handleEditCourse}
                    onDelete={handleDeleteCourse}
                    showActions={true}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="enrolled" className="space-y-4">
            {enrolledCourses.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8 sm:py-12">
                  <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold mb-2">No tienes cursos inscritos</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Explora los cursos disponibles e inscríbete en los que te interesen
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className={cn(
                "gap-3 sm:gap-4 lg:gap-6",
                viewMode === "grid" 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" 
                  : "space-y-3 sm:space-y-4"
              )}>
                {enrolledCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onEnroll={handleEnroll}
                    onUnenroll={handleUnenroll}
                    onView={handleViewCourse}
                    onEdit={handleEditCourse}
                    onDelete={handleDeleteCourse}
                    showActions={true}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="available" className="space-y-4">
            {availableCourses.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8 sm:py-12">
                  <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold mb-2">No hay cursos disponibles</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Todos los cursos están en tu lista de inscritos
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className={cn(
                "gap-3 sm:gap-4 lg:gap-6",
                viewMode === "grid" 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" 
                  : "space-y-3 sm:space-y-4"
              )}>
                {availableCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onEnroll={handleEnroll}
                    onUnenroll={handleUnenroll}
                    onView={handleViewCourse}
                    onEdit={handleEditCourse}
                    onDelete={handleDeleteCourse}
                    showActions={true}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}
          </TabsContent>

        </Tabs>
    </div>
    
    {/* Course Creation Modal */}
    <CourseCreationModal
      isOpen={isCreateModalOpen}
      onClose={() => setIsCreateModalOpen(false)}
      onSuccess={handleCreateSuccess}
    />

    {/* Delete Confirmation Dialog */}
    <Dialog open={!!deleteCourseId} onOpenChange={() => setDeleteCourseId(null)}>
      <DialogContent className="max-w-md mx-4">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg lg:text-xl">¿Eliminar curso?</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Esta acción no se puede deshacer. El curso será eliminado permanentemente
            y todos los datos asociados se perderán.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={() => setDeleteCourseId(null)}
            className="w-full sm:w-auto order-2 sm:order-1 text-xs sm:text-sm"
          >
            Cancelar
          </Button>
          <Button
            onClick={confirmDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 w-full sm:w-auto order-1 sm:order-2 text-xs sm:text-sm"
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </RoleGuard>
  );
}
