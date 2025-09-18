"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  ChevronDown, 
  ChevronRight, 
  BookOpen, 
  FileText, 
  HelpCircle, 
  Play, 
  Clock, 
  Eye, 
  EyeOff,
  Plus,
  Edit,
  Trash2,
  Paperclip,
  Video,
  Headphones,
  Image,
  File
} from "lucide-react";

interface CourseModule {
  id: string;
  title: string;
  description: string | null;
  orderIndex: number;
  estimatedDuration: number;
  isLocked: boolean;
  prerequisites: string[];
  hasCertificate: boolean;
  lessons: Array<{
    id: string;
    title: string;
    description: string | null;
    content: string;
    contentType: string;
    videoUrl: string | null;
    audioUrl: string | null;
    duration: number | null;
    orderIndex: number;
    isRequired: boolean;
    isPreview: boolean;
    attachments: Record<string, any>;
    resources?: Array<{
      id: string;
      name: string;
      type: string;
      url: string;
      size?: number;
    }>;
    quiz?: {
      id: string;
      title: string;
      questionCount: number;
      timeLimit?: number;
    };
  }>;
}

interface CourseStructureViewProps {
  courseId: string;
  modules: CourseModule[];
  onModuleSelect?: (moduleId: string) => void;
  onLessonSelect?: (lessonId: string) => void;
  onQuizSelect?: (quizId: string) => void;
  onAddModule?: () => void;
  onAddLesson?: (moduleId: string) => void;
  onAddQuiz?: (lessonId: string) => void;
  onEditModule?: (moduleId: string) => void;
  onEditLesson?: (lessonId: string) => void;
  onEditQuiz?: (quizId: string) => void;
  onDeleteModule?: (moduleId: string) => void;
  onDeleteLesson?: (lessonId: string) => void;
  onDeleteQuiz?: (quizId: string) => void;
}

export function CourseStructureView({
  courseId,
  modules,
  onModuleSelect,
  onLessonSelect,
  onQuizSelect,
  onAddModule,
  onAddLesson,
  onAddQuiz,
  onEditModule,
  onEditLesson,
  onEditQuiz,
  onDeleteModule,
  onDeleteLesson,
  onDeleteQuiz,
}: CourseStructureViewProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const toggleLesson = (lessonId: string) => {
    const newExpanded = new Set(expandedLessons);
    if (newExpanded.has(lessonId)) {
      newExpanded.delete(lessonId);
    } else {
      newExpanded.add(lessonId);
    }
    setExpandedLessons(newExpanded);
  };

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType) {
      case "VIDEO":
        return <Video className="h-4 w-4 text-red-500" />;
      case "AUDIO":
        return <Headphones className="h-4 w-4 text-blue-500" />;
      case "IMAGE":
        return <Image className="h-4 w-4 text-green-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "Sin duración";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getFileTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "pdf":
        return <File className="h-3 w-3 text-red-500" />;
      case "doc":
      case "docx":
        return <File className="h-3 w-3 text-blue-500" />;
      case "ppt":
      case "pptx":
        return <File className="h-3 w-3 text-orange-500" />;
      case "xls":
      case "xlsx":
        return <File className="h-3 w-3 text-green-500" />;
      default:
        return <File className="h-3 w-3 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Course Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Estructura del Curso</h2>
          <p className="text-muted-foreground">Organiza módulos, lecciones y recursos</p>
        </div>
        {onAddModule && (
          <Button onClick={onAddModule}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Módulo
          </Button>
        )}
      </div>

      {/* Modules List */}
      {modules.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay módulos</h3>
            <p className="text-muted-foreground mb-4">
              Comienza creando el primer módulo de tu curso
            </p>
            {onAddModule && (
              <Button onClick={onAddModule}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Módulo
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {modules
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((module, moduleIndex) => (
              <Card key={module.id} className="overflow-hidden">
                <Collapsible
                  open={expandedModules.has(module.id)}
                  onOpenChange={() => toggleModule(module.id)}
                >
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            {expandedModules.has(module.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            <BookOpen className="h-5 w-5 text-blue-600" />
                            <div>
                              <CardTitle className="text-lg">
                                Módulo {moduleIndex + 1}: {module.title}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground">
                                {module.description || "Sin descripción"}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">
                            {module.lessons.length} lección{module.lessons.length !== 1 ? 'es' : ''}
                          </Badge>
                          <Badge variant="secondary">
                            {formatDuration(module.estimatedDuration)}
                          </Badge>
                          {module.isLocked && (
                            <Badge variant="destructive">Bloqueado</Badge>
                          )}
                          {module.hasCertificate && (
                            <Badge variant="default">Certificado</Badge>
                          )}
                          {onEditModule && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditModule(module.id);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {onDeleteModule && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteModule(module.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      {module.lessons.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <FileText className="h-8 w-8 mx-auto mb-2" />
                          <p>No hay lecciones en este módulo</p>
                          {onAddLesson && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={() => onAddLesson(module.id)}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Agregar Lección
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {module.lessons
                            .sort((a, b) => a.orderIndex - b.orderIndex)
                            .map((lesson, lessonIndex) => (
                              <div key={lesson.id} className="border rounded-lg p-4">
                                <Collapsible
                                  open={expandedLessons.has(lesson.id)}
                                  onOpenChange={() => toggleLesson(lesson.id)}
                                >
                                  <CollapsibleTrigger asChild>
                                    <div className="cursor-pointer hover:bg-muted/50 transition-colors rounded p-2 -m-2">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                          <div className="flex items-center space-x-2">
                                            {expandedLessons.has(lesson.id) ? (
                                              <ChevronDown className="h-4 w-4" />
                                            ) : (
                                              <ChevronRight className="h-4 w-4" />
                                            )}
                                            {getContentTypeIcon(lesson.contentType)}
                                            <div>
                                              <h4 className="font-medium">
                                                {moduleIndex + 1}.{lessonIndex + 1} {lesson.title}
                                              </h4>
                                              <p className="text-sm text-muted-foreground">
                                                {lesson.description || "Sin descripción"}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <Badge variant="outline">
                                            {formatDuration(lesson.duration)}
                                          </Badge>
                                          {lesson.isRequired && (
                                            <Badge variant="default">Requerida</Badge>
                                          )}
                                          {lesson.isPreview && (
                                            <Badge variant="secondary">Vista previa</Badge>
                                          )}
                                          {onEditLesson && (
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                onEditLesson(lesson.id);
                                              }}
                                            >
                                              <Edit className="h-4 w-4" />
                                            </Button>
                                          )}
                                          {onDeleteLesson && (
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteLesson(lesson.id);
                                              }}
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </CollapsibleTrigger>
                                  
                                  <CollapsibleContent className="mt-4">
                                    <div className="space-y-4">
                                      {/* Lesson Content Preview */}
                                      <div className="bg-muted/50 rounded-lg p-4">
                                        <h5 className="font-medium mb-2">Contenido de la Lección</h5>
                                        <div className="flex items-center space-x-2 mb-2">
                                          {getContentTypeIcon(lesson.contentType)}
                                          <span className="text-sm capitalize">
                                            {lesson.contentType.toLowerCase()}
                                          </span>
                                          {lesson.videoUrl && (
                                            <Badge variant="outline">Video</Badge>
                                          )}
                                          {lesson.audioUrl && (
                                            <Badge variant="outline">Audio</Badge>
                                          )}
                                        </div>
                                        {lesson.content && (
                                          <p className="text-sm text-muted-foreground line-clamp-2">
                                            {lesson.content}
                                          </p>
                                        )}
                                      </div>

                                      {/* Resources */}
                                      {lesson.resources && lesson.resources.length > 0 && (
                                        <div>
                                          <h5 className="font-medium mb-2 flex items-center">
                                            <Paperclip className="h-4 w-4 mr-2" />
                                            Recursos Adjuntos ({lesson.resources.length})
                                          </h5>
                                          <div className="space-y-1">
                                            {lesson.resources.map((resource, index) => (
                                              <div
                                                key={index}
                                                className="flex items-center space-x-2 p-2 bg-muted/30 rounded"
                                              >
                                                {getFileTypeIcon(resource.type)}
                                                <span className="text-sm">{resource.name}</span>
                                                <Badge variant="outline" className="text-xs">
                                                  {resource.type.toUpperCase()}
                                                </Badge>
                                                {resource.size && (
                                                  <span className="text-xs text-muted-foreground">
                                                    {(resource.size / 1024).toFixed(1)} KB
                                                  </span>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {/* Quiz */}
                                      {lesson.quiz && (
                                        <div>
                                          <h5 className="font-medium mb-2 flex items-center">
                                            <HelpCircle className="h-4 w-4 mr-2" />
                                            Cuestionario
                                          </h5>
                                          <div className="flex items-center space-x-2 p-2 bg-muted/30 rounded">
                                            <HelpCircle className="h-4 w-4 text-purple-500" />
                                            <span className="text-sm">{lesson.quiz.title}</span>
                                            <Badge variant="outline">
                                              {lesson.quiz.questionCount} preguntas
                                            </Badge>
                                            {lesson.quiz.timeLimit && (
                                              <Badge variant="secondary">
                                                {lesson.quiz.timeLimit} min
                                              </Badge>
                                            )}
                                            {onEditQuiz && (
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onEditQuiz(lesson.quiz!.id)}
                                              >
                                                <Edit className="h-3 w-3" />
                                              </Button>
                                            )}
                                          </div>
                                        </div>
                                      )}

                                      {/* Add Resources/Quiz Buttons */}
                                      <div className="flex space-x-2">
                                        {onAddLesson && (
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onAddLesson(module.id)}
                                          >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Agregar Lección
                                          </Button>
                                        )}
                                        {onAddQuiz && (
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onAddQuiz(lesson.id)}
                                          >
                                            <HelpCircle className="h-4 w-4 mr-2" />
                                            {lesson.quiz ? 'Editar Cuestionario' : 'Agregar Cuestionario'}
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  </CollapsibleContent>
                                </Collapsible>
                              </div>
                            ))}
                        </div>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}
