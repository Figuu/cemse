"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  Star, 
  Play,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Share2
} from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useCourses } from "@/hooks/useCourses";
import { useCourseProgress } from "@/hooks/useCourseProgress";
import { CourseCard } from "@/components/courses/CourseCard";
import { CourseProgressTracker } from "@/components/courses/CourseProgressTracker";
import { LessonViewer } from "@/components/courses/LessonViewer";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  const {
    courses,
    isLoading: coursesLoading,
    error: coursesError,
    enrollInCourse,
    unenrollFromCourse,
  } = useCourses();

  const course = courses.find(c => c.id === courseId);

  const {
    progress,
    isLoading: progressLoading,
    error: progressError,
    updateLessonProgress,
  } = useCourseProgress(course?.isEnrolled ? courseId : "");

  const handleEnroll = async () => {
    if (course) {
      await enrollInCourse(course.id);
    }
  };

  const handleUnenroll = async () => {
    if (course) {
      await unenrollFromCourse(course.id);
    }
  };

  const handleLessonClick = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    setActiveTab("lesson");
  };

  const handleModuleClick = (moduleId: string) => {
    // Find first lesson in module
    if (progress) {
      const moduleData = progress.modules.find(m => m.id === moduleId);
      if (moduleData && moduleData.lessons.length > 0) {
        setSelectedLessonId(moduleData.lessons[0].id);
        setActiveTab("lesson");
      }
    }
  };

  const handleProgressUpdate = async (isCompleted: boolean, timeSpent: number) => {
    if (selectedLessonId) {
      return await updateLessonProgress(selectedLessonId, isCompleted, timeSpent);
    }
    return false;
  };

  const handlePreviousLesson = () => {
    if (progress && selectedLessonId) {
      // Find current lesson and get previous one
      for (const moduleData of progress.modules) {
        const lessonIndex = moduleData.lessons.findIndex(l => l.id === selectedLessonId);
        if (lessonIndex > 0) {
          setSelectedLessonId(moduleData.lessons[lessonIndex - 1].id);
          return;
        }
        if (lessonIndex === 0) {
          // Go to previous module's last lesson
          const moduleIndex = progress.modules.findIndex(m => m.id === moduleData.id);
          if (moduleIndex > 0) {
            const prevModule = progress.modules[moduleIndex - 1];
            if (prevModule.lessons.length > 0) {
              setSelectedLessonId(prevModule.lessons[prevModule.lessons.length - 1].id);
              return;
            }
          }
        }
      }
    }
  };

  const handleNextLesson = () => {
    if (progress && selectedLessonId) {
      // Find current lesson and get next one
      for (const moduleData of progress.modules) {
        const lessonIndex = moduleData.lessons.findIndex(l => l.id === selectedLessonId);
        if (lessonIndex >= 0 && lessonIndex < moduleData.lessons.length - 1) {
          setSelectedLessonId(moduleData.lessons[lessonIndex + 1].id);
          return;
        }
        if (lessonIndex === moduleData.lessons.length - 1) {
          // Go to next module's first lesson
          const moduleIndex = progress.modules.findIndex(m => m.id === moduleData.id);
          if (moduleIndex < progress.modules.length - 1) {
            const nextModule = progress.modules[moduleIndex + 1];
            if (nextModule.lessons.length > 0) {
              setSelectedLessonId(nextModule.lessons[0].id);
              return;
            }
          }
        }
      }
    }
  };

  if (coursesLoading || progressLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => router.push('/courses')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="animate-pulse">
              <div className="aspect-video bg-gray-200"></div>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (coursesError || progressError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => router.push('/courses')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error al cargar el curso</h3>
            <p className="text-muted-foreground mb-4">
              {coursesError || progressError}
            </p>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => router.push('/courses')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Curso no encontrado</h3>
            <p className="text-muted-foreground">
              El curso que buscas no existe o no tienes acceso a él.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedLesson = selectedLessonId && progress 
    ? progress.modules
        .flatMap(m => m.lessons)
        .find(l => l.id === selectedLessonId)
        ? {
            ...progress.modules
              .flatMap(m => m.lessons)
              .find(l => l.id === selectedLessonId)!,
            module: {
              id: progress.modules
                .find(m => m.lessons.some(l => l.id === selectedLessonId))?.id || "",
              title: progress.modules
                .find(m => m.lessons.some(l => l.id === selectedLessonId))?.title || "",
              courseId: courseId
            },
            course: {
              id: courseId,
              title: course?.title || "",
              description: course?.description || null
            }
          } as any
        : null
    : null;

  return (
    <RoleGuard allowedRoles={["YOUTH", "COMPANIES", "INSTITUTION", "SUPERADMIN"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => router.push('/courses')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{course.title}</h1>
              <p className="text-muted-foreground">
                {course.instructor?.name} • {course.category}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Compartir
            </Button>
            {course.isEnrolled ? (
              <Button variant="outline" size="sm" onClick={handleUnenroll}>
                Desinscribirse
              </Button>
            ) : (
              <Button size="sm" onClick={handleEnroll}>
                <Play className="h-4 w-4 mr-2" />
                Inscribirse
              </Button>
            )}
          </div>
        </div>

        {/* Course Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CourseCard
              course={course}
              onEnroll={handleEnroll}
              onUnenroll={handleUnenroll}
              onView={() => {}}
              showActions={false}
            />
          </div>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información del Curso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Duración</span>
                  <span className="font-medium">{Math.floor(course.duration / 60)}h {course.duration % 60}m</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Nivel</span>
                  <Badge variant="outline">{course.level}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Estudiantes</span>
                  <span className="font-medium">{course.studentsCount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Calificación</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="font-medium">{course.rating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Lecciones</span>
                  <span className="font-medium">{course.totalLessons}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Módulos</span>
                  <span className="font-medium">{course.totalModules}</span>
                </div>
              </CardContent>
            </Card>

            {course.objectives.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Objetivos de Aprendizaje</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {course.objectives.map((objective, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="progress">Progreso</TabsTrigger>
            <TabsTrigger value="lesson">Lección</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Descripción</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{course.description}</p>
                </CardContent>
              </Card>

              {course.prerequisites.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Prerrequisitos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {course.prerequisites.map((prerequisite, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Clock className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{prerequisite}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            {course.isEnrolled && progress ? (
              <CourseProgressTracker
                progress={progress}
                onModuleClick={handleModuleClick}
                onLessonClick={handleLessonClick}
              />
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No inscrito en el curso</h3>
                  <p className="text-muted-foreground mb-4">
                    Inscríbete en el curso para ver tu progreso
                  </p>
                  <Button onClick={handleEnroll}>
                    <Play className="h-4 w-4 mr-2" />
                    Inscribirse
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="lesson" className="space-y-6">
            {selectedLesson ? (
              <LessonViewer
                lesson={selectedLesson}
                progress={selectedLesson.progress}
                onProgressUpdate={handleProgressUpdate}
                onPrevious={handlePreviousLesson}
                onNext={handleNextLesson}
              />
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Selecciona una lección</h3>
                  <p className="text-muted-foreground">
                    Ve a la pestaña de progreso y selecciona una lección para comenzar
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
