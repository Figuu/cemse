"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  Play, 
  Lock, 
  Unlock,
  Award,
  Calendar,
  Timer,
  Users,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CourseProgress, ModuleProgress } from "@/hooks/useCourseProgress";

interface CourseProgressTrackerProps {
  progress: CourseProgress;
  onModuleClick?: (moduleId: string) => void;
  onLessonClick?: (lessonId: string) => void;
  className?: string;
}

export function CourseProgressTracker({ 
  progress, 
  onModuleClick,
  onLessonClick,
  className 
}: CourseProgressTrackerProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatTimeSpent = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getProgressColor = (progressPercent: number) => {
    if (progressPercent >= 100) return "bg-green-500";
    if (progressPercent >= 75) return "bg-blue-500";
    if (progressPercent >= 50) return "bg-yellow-500";
    if (progressPercent >= 25) return "bg-orange-500";
    return "bg-gray-500";
  };

  const getStatusIcon = (isCompleted: boolean, isLocked: boolean) => {
    if (isLocked) return <Lock className="h-4 w-4 text-gray-400" />;
    if (isCompleted) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <Play className="h-4 w-4 text-blue-500" />;
  };

  const getStatusColor = (isCompleted: boolean, isLocked: boolean) => {
    if (isLocked) return "bg-gray-100 text-gray-600";
    if (isCompleted) return "bg-green-100 text-green-800";
    return "bg-blue-100 text-blue-800";
  };

  const getStatusText = (isCompleted: boolean, isLocked: boolean) => {
    if (isLocked) return "Bloqueado";
    if (isCompleted) return "Completado";
    return "En Progreso";
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Course Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{progress.courseTitle}</CardTitle>
              <CardDescription>
                Progreso del curso y estadísticas de aprendizaje
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {progress.overall.progress}%
              </div>
              <div className="text-sm text-muted-foreground">
                Completado
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progreso General</span>
              <span>{progress.overall.completedLessons} de {progress.overall.totalLessons} lecciones</span>
            </div>
            <Progress 
              value={progress.overall.progress} 
              className="h-3"
            />
          </div>

          {/* Course Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <BookOpen className="h-4 w-4 text-blue-600 mr-1" />
                <span className="text-sm font-medium">Lecciones</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {progress.overall.totalLessons}
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm font-medium">Completadas</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {progress.overall.completedLessons}
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Clock className="h-4 w-4 text-purple-600 mr-1" />
                <span className="text-sm font-medium">Tiempo</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">
                {formatTimeSpent(progress.overall.totalTimeSpent)}
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Award className="h-4 w-4 text-yellow-600 mr-1" />
                <span className="text-sm font-medium">Módulos</span>
              </div>
              <p className="text-2xl font-bold text-yellow-600">
                {progress.modules.length}
              </p>
            </div>
          </div>

          {/* Enrollment Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                <span>Inscrito el {new Date(progress.enrollment.enrolledAt).toLocaleDateString()}</span>
              </div>
              {progress.enrollment.lastAccessedAt && (
                <div className="flex items-center">
                  <Timer className="h-4 w-4 text-muted-foreground mr-2" />
                  <span>Último acceso: {new Date(progress.enrollment.lastAccessedAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modules */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Módulos del Curso</h3>
        {progress.modules.map((module) => (
          <Card key={module.id} className="overflow-hidden">
            <CardHeader 
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => {
                toggleModule(module.id);
                onModuleClick?.(module.id);
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(module.progress === 100, module.isLocked)}
                  <div>
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                    {module.description && (
                      <CardDescription className="mt-1">
                        {module.description}
                      </CardDescription>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(module.progress === 100, module.isLocked)}>
                    {getStatusText(module.progress === 100, module.isLocked)}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    {expandedModules.has(module.id) ? "Ocultar" : "Mostrar"}
                  </Button>
                </div>
              </div>
            </CardHeader>

            {expandedModules.has(module.id) && (
              <CardContent className="pt-0">
                {/* Module Progress */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progreso del Módulo</span>
                    <span>{module.completedLessons} de {module.totalLessons} lecciones</span>
                  </div>
                  <Progress 
                    value={module.progress} 
                    className="h-2"
                  />
                </div>

                {/* Module Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Duración Estimada</div>
                    <div className="font-semibold">{formatDuration(module.estimatedDuration)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Lecciones</div>
                    <div className="font-semibold">{module.totalLessons}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Progreso</div>
                    <div className="font-semibold">{module.progress}%</div>
                  </div>
                </div>

                {/* Lessons */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Lecciones</h4>
                  {module.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors",
                        lesson.progress.isCompleted ? "bg-green-50 border-green-200" : "bg-white"
                      )}
                      onClick={() => onLessonClick?.(lesson.id)}
                    >
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(lesson.progress.isCompleted, false)}
                        <div>
                          <div className="font-medium">{lesson.title}</div>
                          {lesson.description && (
                            <div className="text-sm text-muted-foreground">
                              {lesson.description}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {lesson.duration && (
                          <div className="text-sm text-muted-foreground">
                            {formatDuration(lesson.duration)}
                          </div>
                        )}
                        {lesson.isRequired && (
                          <Badge variant="outline" className="text-xs">
                            Requerida
                          </Badge>
                        )}
                        {lesson.isPreview && (
                          <Badge variant="outline" className="text-xs">
                            Vista Previa
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Completion Status */}
      {progress.enrollment.isCompleted && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="text-center py-8">
            <Award className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              ¡Curso Completado!
            </h3>
            <p className="text-green-600 mb-4">
              Felicidades por completar este curso. Has aprendido mucho.
            </p>
            <div className="text-sm text-green-600">
              Completado el {new Date(progress.enrollment.completedAt!).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
