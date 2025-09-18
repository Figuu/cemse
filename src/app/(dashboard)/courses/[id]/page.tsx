"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  Star, 
  Play,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Share2,
  Settings,
  FileText,
  HelpCircle,
  Edit,
  Plus,
  Users,
  BarChart3,
  Headphones,
  Image,
  Trash2
} from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useCourses } from "@/hooks/useCourses";
import { useCourseProgress } from "@/hooks/useCourseProgress";
import { CourseCard } from "@/components/courses/CourseCard";
import { CourseProgressTracker } from "@/components/courses/CourseProgressTracker";
import { LessonViewer } from "@/components/courses/LessonViewer";
import { ModuleManager } from "@/components/courses/ModuleManager";
import { LessonManager } from "@/components/courses/LessonManager";
import { QuizManager } from "@/components/courses/QuizManager";
import { CourseStructureView } from "@/components/courses/CourseStructureView";
import { UnifiedCourseManager } from "@/components/courses/UnifiedCourseManager";
import { useSession } from "next-auth/react";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const courseId = params.id as string;
  
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [isLoadingModules, setIsLoadingModules] = useState(false);
  const [isLoadingLessons, setIsLoadingLessons] = useState(false);
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(false);

  // Role-based logic
  const isYouth = session?.user?.role === "YOUTH";
  const isInstitution = session?.user?.role === "INSTITUTION";
  const isSuperAdmin = session?.user?.role === "SUPERADMIN";
  const canManageCourse = isInstitution || isSuperAdmin;

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

  // Fetch modules, lessons, and quizzes for management view
  useEffect(() => {
    if (canManageCourse && courseId) {
      // Fetch modules
      setIsLoadingModules(true);
      fetch(`/api/courses/${courseId}/modules`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          if (data.success) {
            setModules(data.modules || []);
          } else {
            console.error('Error fetching modules:', data.error);
            setModules([]);
          }
        })
        .catch(err => {
          console.error('Error fetching modules:', err);
          setModules([]);
        })
        .finally(() => setIsLoadingModules(false));

      // Fetch lessons
      setIsLoadingLessons(true);
      fetch(`/api/courses/${courseId}/lessons`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          if (data.success) {
            setLessons(data.lessons || []);
          } else {
            console.error('Error fetching lessons:', data.error);
            setLessons([]);
          }
        })
        .catch(err => {
          console.error('Error fetching lessons:', err);
          setLessons([]);
        })
        .finally(() => setIsLoadingLessons(false));

      // Fetch quizzes
      setIsLoadingQuizzes(true);
      fetch(`/api/courses/${courseId}/quizzes`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          if (data.success) {
            setQuizzes(data.quizzes || []);
          } else {
            console.error('Error fetching quizzes:', data.error);
            setQuizzes([]);
          }
        })
        .catch(err => {
          console.error('Error fetching quizzes:', err);
          setQuizzes([]);
        })
        .finally(() => setIsLoadingQuizzes(false));
    }
  }, [canManageCourse, courseId]);

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

  // For admin users, show a management-focused layout
  if (canManageCourse) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Management Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">{course.title}</h1>
              <p className="text-muted-foreground">Gestión del Curso</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => router.push(`/courses/${courseId}/edit`)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar Curso
              </Button>
              <Button variant="outline" onClick={() => router.push('/courses')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Cursos
              </Button>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Módulos</p>
                    <p className="text-2xl font-bold">{modules.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Lecciones</p>
                    <p className="text-2xl font-bold">{lessons.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <HelpCircle className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium">Cuestionarios</p>
                    <p className="text-2xl font-bold">{quizzes.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium">Estudiantes</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Unified Course Management */}
        <UnifiedCourseManager
          courseId={courseId}
          modules={modules}
          lessons={lessons}
          quizzes={quizzes}
          onModulesChange={setModules}
          onLessonsChange={setLessons}
          onQuizzesChange={setQuizzes}
        />
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

  // For youth users, show a learning-focused layout
  if (session?.user?.role === "YOUTH") {
    return (
      <RoleGuard allowedRoles={["YOUTH", "COMPANIES", "INSTITUTION", "SUPERADMIN"]}>
        <div className="space-y-6">
          {/* Compact Header for Youth */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => router.push('/courses')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">{course.title}</h1>
                <p className="text-sm text-muted-foreground">
                  {course.instructor?.name} • {course.category} • {course.level}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
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

          {/* Learning Content - Main Focus */}
          {course.isEnrolled && progress ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Course Progress Sidebar */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle className="text-lg">Tu Progreso</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {Math.round(progress.overall.progress)}%
                      </div>
                      <p className="text-sm text-muted-foreground">Completado</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Lecciones</span>
                        <span>{progress.overall.completedLessons}/{progress.overall.totalLessons}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(progress.overall.completedLessons / progress.overall.totalLessons) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Módulos</span>
                        <span>{progress.modules.filter(m => m.progress === 100).length}/{progress.modules.length}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(progress.modules.filter(m => m.progress === 100).length / progress.modules.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Learning Content */}
              <div className="lg:col-span-3">
                {selectedLesson ? (
                  <LessonViewer
                    lesson={selectedLesson}
                    progress={selectedLesson.progress}
                    onProgressUpdate={handleProgressUpdate}
                    onPrevious={handlePreviousLesson}
                    onNext={handleNextLesson}
                  />
                ) : (
                  <div className="space-y-6">
                    {/* Course Modules */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <BookOpen className="h-5 w-5 mr-2" />
                          Módulos del Curso
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {progress.modules.map((module, moduleIndex) => (
                            <div key={module.id} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-semibold">
                                    {moduleIndex + 1}
                                  </div>
                                  <div>
                                    <h3 className="font-semibold">{module.title}</h3>
                                    <p className="text-sm text-muted-foreground">
                                      {module.lessons.length} lecciones • {module.estimatedDuration} min
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className="text-sm text-muted-foreground">
                                    {module.completedLessons}/{module.lessons.length}
                                  </div>
                                  <div className="w-16 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${(module.completedLessons / module.lessons.length) * 100}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                              
                              {/* Module Lessons */}
                              <div className="space-y-2">
                                {module.lessons.map((lesson, lessonIndex) => (
                                  <div 
                                    key={lesson.id}
                                    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                                      lesson.progress.isCompleted 
                                        ? 'bg-green-50 border border-green-200' 
                                        : lesson.id === selectedLessonId
                                        ? 'bg-blue-50 border border-blue-200'
                                        : 'bg-gray-50 hover:bg-gray-100'
                                    }`}
                                    onClick={() => handleLessonClick(lesson.id)}
                                  >
                                    <div className={`flex items-center justify-center w-6 h-6 rounded-full text-sm font-medium ${
                                      lesson.progress.isCompleted 
                                        ? 'bg-green-500 text-white' 
                                        : 'bg-gray-300 text-gray-600'
                                    }`}>
                                      {lesson.progress.isCompleted ? (
                                        <CheckCircle className="h-4 w-4" />
                                      ) : (
                                        `${moduleIndex + 1}.${lessonIndex + 1}`
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <h4 className="font-medium text-sm">{lesson.title}</h4>
                                      <p className="text-xs text-muted-foreground">
                                        {lesson.duration || 0} min • {lesson.contentType}
                                      </p>
                                    </div>
                                    {lesson.isRequired && (
                                      <Badge variant="secondary" className="text-xs">Requerida</Badge>
                                    )}
                                    {lesson.isPreview && (
                                      <Badge variant="default" className="text-xs">Vista Previa</Badge>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Course Information - Collapsed */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Información del Curso</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="font-medium">Duración</p>
                            <p className="text-muted-foreground">{Math.floor(course.duration / 60)}h {course.duration % 60}m</p>
                          </div>
                          <div>
                            <p className="font-medium">Nivel</p>
                            <p className="text-muted-foreground">{course.level}</p>
                          </div>
                          <div>
                            <p className="font-medium">Estudiantes</p>
                            <p className="text-muted-foreground">{course.studentsCount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="font-medium">Calificación</p>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                              <span className="text-muted-foreground">{course.rating.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                        {course.description && (
                          <div>
                            <p className="font-medium mb-2">Descripción</p>
                            <p className="text-sm text-muted-foreground">{course.description}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Not Enrolled - Show Course Info */
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
          )}
        </div>
      </RoleGuard>
    );
  }

  // Original layout for other roles (Institution, SuperAdmin, etc.)
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
            
            {/* Role-based actions */}
            {canManageCourse ? (
              // Management actions for Institution and SuperAdmin
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setActiveTab("modules")}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Gestionar Módulos
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setActiveTab("lessons")}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Gestionar Lecciones
                </Button>
                <Button 
                  size="sm"
                  onClick={() => router.push(`/courses/${courseId}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Curso
                </Button>
              </>
            ) : (
              // Enrollment actions for other roles
              course.isEnrolled ? (
                <Button variant="outline" size="sm" onClick={handleUnenroll}>
                  Desinscribirse
                </Button>
              ) : (
                <Button size="sm" onClick={handleEnroll}>
                  <Play className="h-4 w-4 mr-2" />
                  Inscribirse
                </Button>
              )
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

        {/* Management Content for Institution/SuperAdmin */}
        {canManageCourse && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Módulos</p>
                      <p className="text-2xl font-bold">{modules.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Lecciones</p>
                      <p className="text-2xl font-bold">{lessons.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <HelpCircle className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium">Cuestionarios</p>
                      <p className="text-2xl font-bold">{quizzes.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-orange-600" />
                    <div>
                      <p className="text-sm font-medium">Estudiantes</p>
                      <p className="text-2xl font-bold">0</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Información del Curso</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Título</p>
                    <p className="text-muted-foreground">{course.title}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Descripción</p>
                    <p className="text-muted-foreground">{course.description}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Categoría</p>
                    <p className="text-muted-foreground">{course.category}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Nivel</p>
                    <p className="text-muted-foreground">{course.level}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Acciones Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => router.push(`/courses/${courseId}/edit`)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Información del Curso
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => router.push(`/courses/${courseId}/edit`)}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Gestionar Módulos y Lecciones
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
