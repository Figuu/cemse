"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { LessonFileUpload } from "./LessonFileUpload";
import { ResourceUpload } from "./ResourceUpload";
import {
  Plus,
  Edit,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  BookOpen,
  FileText,
  HelpCircle,
  Play,
  Headphones,
  Image,
  Clock,
  Eye,
  EyeOff,
  Settings,
  Save,
  X,
  List,
} from "lucide-react";
import { QuizQuestionEditor } from "./QuizQuestionEditor";

interface Module {
  id: string;
  title: string;
  description: string | null;
  orderIndex: number;
  estimatedDuration: number;
  isLocked: boolean;
  prerequisites: string[];
  hasCertificate: boolean;
}

interface Lesson {
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
  attachments: any[];
  moduleId: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  questions: any[];
  timeLimit: number | null;
  passingScore: number;
  isPublished: boolean;
  courseId: string;
  lessonId: string | null;
}

interface UnifiedCourseManagerProps {
  courseId: string;
  modules: Module[];
  lessons: Lesson[];
  quizzes: Quiz[];
  onModulesChange: (modules: Module[]) => void;
  onLessonsChange: (lessons: Lesson[]) => void;
  onQuizzesChange: (quizzes: Quiz[]) => void;
}

export function UnifiedCourseManager({
  courseId,
  modules,
  lessons,
  quizzes,
  onModulesChange,
  onLessonsChange,
  onQuizzesChange,
}: UnifiedCourseManagerProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [editingItem, setEditingItem] = useState<{
    type: 'module' | 'lesson' | 'quiz';
    id: string | null;
    moduleId?: string;
    lessonId?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingQuizQuestions, setEditingQuizQuestions] = useState<string | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);

  // Form states
  const [moduleForm, setModuleForm] = useState({
    title: "",
    description: "",
    estimatedDuration: 0,
    isLocked: false,
    hasCertificate: false,
  });

  const [lessonForm, setLessonForm] = useState({
    title: "",
    description: "",
    content: "",
    contentType: "TEXT" as "TEXT" | "VIDEO" | "AUDIO" | "DOCUMENT",
    videoUrl: "",
    audioUrl: "",
    duration: 0,
    isRequired: true,
    isPreview: false,
    attachments: [] as any[],
  });

  // Auto-hide success messages
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Sync uploadedFileUrl with lessonForm when upload completes
  useEffect(() => {
    if (uploadedFileUrl) {
      console.log("🔄 [UnifiedCourseManager] Syncing uploadedFileUrl to lessonForm:", uploadedFileUrl, "contentType:", lessonForm.contentType);

      if (lessonForm.contentType === "VIDEO") {
        setLessonForm(prev => ({ ...prev, videoUrl: uploadedFileUrl }));
        console.log("✅ [UnifiedCourseManager] Updated lessonForm.videoUrl to:", uploadedFileUrl);
      } else if (lessonForm.contentType === "AUDIO") {
        setLessonForm(prev => ({ ...prev, audioUrl: uploadedFileUrl }));
        console.log("✅ [UnifiedCourseManager] Updated lessonForm.audioUrl to:", uploadedFileUrl);
      }
    }
  }, [uploadedFileUrl, lessonForm.contentType]);

  const [quizForm, setQuizForm] = useState({
    title: "",
    description: "",
    timeLimit: 0,
    passingScore: 70,
    isPublished: false,
  });

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  const openCreateModal = (type: 'module' | 'lesson' | 'quiz', moduleId?: string, lessonId?: string) => {
    setEditingItem({ type, id: null, moduleId, lessonId });
    setUploadedFileUrl(null); // Reset uploaded file URL
    if (type === 'module') {
      setModuleForm({
        title: "",
        description: "",
        estimatedDuration: 0,
        isLocked: false,
        hasCertificate: false,
      });
    } else if (type === 'lesson') {
      setLessonForm({
        title: "",
        description: "",
        content: "",
        contentType: "TEXT" as "TEXT" | "VIDEO" | "AUDIO" | "DOCUMENT",
        videoUrl: "",
        audioUrl: "",
        duration: 0,
        isRequired: true,
        isPreview: false,
        attachments: [],
      });
    } else if (type === 'quiz') {
      setQuizForm({
        title: "",
        description: "",
        timeLimit: 0,
        passingScore: 70,
        isPublished: false,
      });
    }
  };

  const openEditModal = (type: 'module' | 'lesson' | 'quiz', item: any) => {
    setEditingItem({ type, id: item.id, moduleId: item.moduleId, lessonId: item.lessonId });
    if (type === 'module') {
      setModuleForm({
        title: item.title,
        description: item.description || "",
        estimatedDuration: item.estimatedDuration || 0,
        isLocked: item.isLocked || false,
        hasCertificate: item.hasCertificate || false,
      });
    } else if (type === 'lesson') {
      setLessonForm({
        title: item.title,
        description: item.description || "",
        content: item.content || "",
        contentType: item.contentType || "TEXT",
        videoUrl: item.videoUrl || "",
        audioUrl: item.audioUrl || "",
        duration: item.duration || 0,
        isRequired: item.isRequired || false,
        isPreview: item.isPreview || false,
        attachments: item.attachments || [],
      });
    } else if (type === 'quiz') {
      setQuizForm({
        title: item.title,
        description: item.description || "",
        timeLimit: item.timeLimit || 0,
        passingScore: item.passingScore || 70,
        isPublished: item.isPublished || false,
      });
    }
  };

  const handleSave = async () => {
    if (!editingItem) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (editingItem.type === 'module') {
        const isUpdate = Boolean(editingItem.id);
        const url = isUpdate
          ? `/api/courses/${courseId}/modules/${editingItem.id}`
          : `/api/courses/${courseId}/modules`;
        const method = isUpdate ? 'PUT' : 'POST';
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...moduleForm,
          }),
        });

        if (!response.ok) throw new Error('Failed to save module');
        const data = await response.json();
        
        if (isUpdate) {
          onModulesChange(modules.map(m => m.id === editingItem.id ? data.module : m));
          setSuccess('Módulo actualizado exitosamente');
        } else {
          onModulesChange([...modules, data.module]);
          setSuccess('Módulo creado exitosamente');
        }
      } else if (editingItem.type === 'lesson') {
        // Determine the appropriate URL field based on content type
        let videoUrl = null;
        let audioUrl = null;

        if (lessonForm.contentType === "VIDEO") {
          videoUrl = uploadedFileUrl || lessonForm.videoUrl || null;
        } else if (lessonForm.contentType === "AUDIO") {
          audioUrl = uploadedFileUrl || lessonForm.audioUrl || null;
        }

        const isUpdate = Boolean(editingItem.id);
        const url = isUpdate
          ? `/api/courses/${courseId}/modules/${editingItem.moduleId}/lessons/${editingItem.id}`
          : `/api/courses/${courseId}/modules/${editingItem.moduleId}/lessons`;
        const method = isUpdate ? 'PUT' : 'POST';

        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...lessonForm,
            videoUrl,
            audioUrl,
          }),
        });

        if (!response.ok) throw new Error('Failed to save lesson');
        const data = await response.json();
        
        if (isUpdate) {
          onLessonsChange(lessons.map(l => l.id === editingItem.id ? data.lesson : l));
          setSuccess('Lección actualizada exitosamente');
        } else {
          onLessonsChange([...lessons, data.lesson]);
          setSuccess('Lección creada exitosamente');
        }
      } else if (editingItem.type === 'quiz') {
        console.log('Creating/updating quiz:', {
          courseId,
          quizForm,
          editingItem,
          lessonId: editingItem.lessonId
        });

        const response = await fetch(`/api/courses/${courseId}/quizzes`, {
          method: editingItem.id ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...quizForm,
            id: editingItem.id,
            lessonId: editingItem.lessonId,
          }),
        });

        console.log('Quiz API response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Quiz API error:', errorData);
          throw new Error(errorData.error || 'Failed to save quiz');
        }
        
        const data = await response.json();
        console.log('Quiz API success data:', data);
        console.log('Current quizzes before update:', quizzes);
        console.log('New quiz data:', data.quiz);
        
        if (editingItem.id) {
          onQuizzesChange(quizzes.map(q => q.id === editingItem.id ? data.quiz : q));
          setSuccess('Cuestionario actualizado exitosamente');
        } else {
          const updatedQuizzes = [...quizzes, data.quiz];
          console.log('Updated quizzes after adding new quiz:', updatedQuizzes);
          onQuizzesChange(updatedQuizzes);
          setSuccess('Cuestionario creado exitosamente');
        }
      }

      setEditingItem(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (type: 'module' | 'lesson' | 'quiz', id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este elemento?')) return;

    setIsLoading(true);
    setError(null);

    try {
      let response;
      if (type === 'module') {
        response = await fetch(`/api/courses/${courseId}/modules/${id}`, { method: 'DELETE' });
        if (response.ok) {
          onModulesChange(modules.filter(m => m.id !== id));
          onLessonsChange(lessons.filter(l => l.moduleId !== id));
        }
      } else if (type === 'lesson') {
        const lesson = lessons.find(l => l.id === id);
        response = await fetch(`/api/courses/${courseId}/modules/${lesson?.moduleId}/lessons/${id}`, { method: 'DELETE' });
        if (response.ok) {
          onLessonsChange(lessons.filter(l => l.id !== id));
          onQuizzesChange(quizzes.filter(q => q.lessonId !== id));
        }
      } else if (type === 'quiz') {
        response = await fetch(`/api/courses/${courseId}/quizzes/${id}`, { method: 'DELETE' });
        if (response.ok) {
          onQuizzesChange(quizzes.filter(q => q.id !== id));
        }
      }

      if (!response?.ok) throw new Error('Failed to delete');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setIsLoading(false);
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "VIDEO": return <Play className="h-4 w-4 text-red-500" />;
      case "AUDIO": return <Headphones className="h-4 w-4 text-blue-500" />;
      case "TEXT": return <FileText className="h-4 w-4 text-gray-500" />;
      case "IMAGE": return <Image className="h-4 w-4 text-purple-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case "VIDEO": return "Video";
      case "AUDIO": return "Audio";
      case "DOCUMENT": return "Documento";
      case "TEXT": return "Texto";
      case "IMAGE": return "Imagen";
      default: return "Texto";
    }
  };

  const handleFileUpload = async (file: File): Promise<string> => {
    console.log("handleFileUpload called with file:", file.name, file.type);
    
    try {
      // Determine category based on file type
      let category = "other";
      if (file.type.startsWith("video/")) {
        category = "course-video";
      } else if (file.type.startsWith("audio/")) {
        category = "course-audio";
      } else if (file.type.startsWith("image/")) {
        category = "course-thumbnail";
      }
      
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);

      console.log("Uploading file to /api/files/minio/upload...");
      const response = await fetch("/api/files/minio/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Upload failed:", errorData);
        throw new Error(errorData.error || "Failed to upload file");
      }

      const data = await response.json();
      console.log("Upload successful:", data);
      
      if (data.success && data.file) {
        // Use the proxy URL which works in both local and production environments
        setUploadedFileUrl(data.file.url);
        return data.file.url;
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("File upload error:", error);
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Estructura del Curso</h2>
          <p className="text-muted-foreground">
            Organiza módulos, lecciones y cuestionarios de forma intuitiva
          </p>
        </div>
        <Button onClick={() => openCreateModal('module')}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Módulo
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      {/* Course Structure */}
      <div className="space-y-4">
        {modules.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                No hay módulos en este curso. Crea el primero para empezar.
              </p>
              <Button onClick={() => openCreateModal('module')}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Módulo
              </Button>
            </CardContent>
          </Card>
        ) : (
          modules
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((module, moduleIndex) => {
              const moduleLessons = lessons
                .filter(lesson => lesson.moduleId === module.id)
                .sort((a, b) => a.orderIndex - b.orderIndex);
              
              return (
                <Card key={module.id} className="overflow-hidden">
                  <Collapsible
                    open={expandedModules.has(module.id)}
                    onOpenChange={() => toggleModule(module.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center justify-center w-10 h-10 bg-blue-500 text-white rounded-full font-bold text-lg">
                              {moduleIndex + 1}
                            </div>
                            <div>
                              <CardTitle className="text-xl">{module.title}</CardTitle>
                              {module.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {module.description}
                                </p>
                              )}
                              <div className="flex items-center space-x-4 mt-2">
                                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                                  {moduleLessons.length} lecciones
                                </Badge>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {module.estimatedDuration} min
                                </div>
                                {module.isLocked && (
                                  <Badge variant="outline">Bloqueado</Badge>
                                )}
                                {module.hasCertificate && (
                                  <Badge variant="default">Certificado</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {expandedModules.has(module.id) ? (
                              <ChevronDown className="h-5 w-5 text-gray-500" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-gray-500" />
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <CardContent className="p-0">
                        <div className="p-4 border-b bg-gray-50">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-700">Lecciones del Módulo</h4>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => openCreateModal('lesson', module.id)}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Nueva Lección
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditModal('module', module)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => handleDelete('module', module.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {moduleLessons.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
                            <p>No hay lecciones en este módulo</p>
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-3"
                              onClick={() => openCreateModal('lesson', module.id)}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Agregar Primera Lección
                            </Button>
                          </div>
                        ) : (
                          <div className="divide-y">
                            {moduleLessons.map((lesson, lessonIndex) => {
                              const lessonQuizzes = quizzes.filter(quiz => quiz.lessonId === lesson.id);
                              console.log(`Lesson ${lesson.id} (${lesson.title}) quizzes:`, lessonQuizzes);
                              console.log('All quizzes:', quizzes);
                              
                              return (
                                <div key={lesson.id} className="p-4 hover:bg-gray-50">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                      <div className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 rounded-full font-semibold text-sm">
                                        {moduleIndex + 1}.{lessonIndex + 1}
                                      </div>
                                      <div className="flex items-center space-x-3">
                                        {getContentTypeIcon(lesson.contentType)}
                                        <div>
                                          <div className="flex items-center space-x-2">
                                            <h5 className="font-medium">{lesson.title}</h5>
                                            {lessonQuizzes.length > 0 && (
                                              <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                                                <HelpCircle className="h-3 w-3 mr-1" />
                                                {lessonQuizzes.length} quiz{lessonQuizzes.length > 1 ? 'es' : ''}
                                              </Badge>
                                            )}
                                          </div>
                                          {lesson.description && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                              {lesson.description}
                                            </p>
                                          )}
                                          <div className="flex items-center space-x-3 mt-2">
                                            <div className="flex items-center text-sm text-muted-foreground">
                                              <Clock className="h-3 w-3 mr-1" />
                                              {lesson.duration || 0} min
                                            </div>
                                            <Badge variant="outline" className="text-xs">
                                              {getContentTypeLabel(lesson.contentType)}
                                            </Badge>
                                            {lesson.isRequired && (
                                              <Badge variant="secondary" className="text-xs">Requerida</Badge>
                                            )}
                                            {lesson.isPreview && (
                                              <Badge variant="default" className="text-xs">Vista Previa</Badge>
                                            )}
                                            {lessonQuizzes.length > 0 && (
                                              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                                                <HelpCircle className="h-3 w-3 mr-1" />
                                                {lessonQuizzes.length} quiz{lessonQuizzes.length > 1 ? 'es' : ''}
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex space-x-2">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => openEditModal('lesson', lesson)}
                                        title="Editar lección"
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-red-500 hover:text-red-700"
                                        onClick={() => handleDelete('lesson', lesson.id)}
                                        title="Eliminar lección"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>

                                  {/* Lesson Quizzes */}
                                  <div className="mt-4 ml-12">
                                    <div className="flex items-center justify-between mb-3">
                                      <div className="flex items-center space-x-2">
                                        <HelpCircle className="h-4 w-4 text-purple-500" />
                                        <span className="text-sm font-medium text-gray-700">
                                          Cuestionarios ({lessonQuizzes.length})
                                        </span>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => openCreateModal('quiz', module.id, lesson.id)}
                                        className="text-purple-600 border-purple-200 hover:bg-purple-50"
                                      >
                                        <Plus className="h-3 w-3 mr-1" />
                                        Agregar Quiz
                                      </Button>
                                    </div>
                                    
                                    {lessonQuizzes.length === 0 ? (
                                      <div className="text-center py-4 text-muted-foreground bg-gray-50 rounded-lg">
                                        <HelpCircle className="h-6 w-6 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">No hay cuestionarios en esta lección</p>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="mt-2 text-purple-600 hover:text-purple-700"
                                          onClick={() => openCreateModal('quiz', module.id, lesson.id)}
                                        >
                                          <Plus className="h-3 w-3 mr-1" />
                                          Crear Primer Quiz
                                        </Button>
                                      </div>
                                    ) : (
                                      <div className="space-y-2">
                                        {lessonQuizzes.map((quiz) => (
                                          <div key={quiz.id} className="flex items-center justify-between bg-purple-50 p-3 rounded-lg border border-purple-200">
                                            <div className="flex items-center space-x-3">
                                              <HelpCircle className="h-4 w-4 text-purple-500" />
                                              <div>
                                                <span className="text-sm font-medium">{quiz.title}</span>
                                                {quiz.description && (
                                                  <p className="text-xs text-muted-foreground mt-1">{quiz.description}</p>
                                                )}
                                                <div className="flex items-center space-x-2 mt-1">
                                                  <Badge variant="outline" className="text-xs">
                                                    {quiz.questions?.length || 0} preguntas
                                                  </Badge>
                                                  {quiz.timeLimit && (
                                                    <Badge variant="outline" className="text-xs">
                                                      {quiz.timeLimit} min
                                                    </Badge>
                                                  )}
                                                  <Badge variant="outline" className="text-xs">
                                                    {quiz.passingScore}% aprobación
                                                  </Badge>
                                                  <Badge variant={quiz.isPublished ? "default" : "secondary"} className="text-xs">
                                                    {quiz.isPublished ? "Publicado" : "Borrador"}
                                                  </Badge>
                                                </div>
                                              </div>
                                            </div>
                                            <div className="flex space-x-1">
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setEditingQuizQuestions(quiz.id)}
                                                title="Gestionar preguntas"
                                                className="text-purple-600 hover:text-purple-700 hover:bg-purple-100"
                                              >
                                                <List className="h-3 w-3" />
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => openEditModal('quiz', quiz)}
                                                title="Editar cuestionario"
                                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                                              >
                                                <Edit className="h-3 w-3" />
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-red-500 hover:text-red-700 hover:bg-red-100"
                                                onClick={() => handleDelete('quiz', quiz.id)}
                                                title="Eliminar cuestionario"
                                              >
                                                <Trash2 className="h-3 w-3" />
                                              </Button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              );
            })
        )}
      </div>


      {/* Edit/Create Modal */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem?.id ? 'Editar' : 'Crear'} {editingItem?.type === 'module' ? 'Módulo' : editingItem?.type === 'lesson' ? 'Lección' : 'Cuestionario'}
            </DialogTitle>
            <DialogDescription>
              {editingItem?.id 
                ? `Modifica los detalles del ${editingItem.type === 'module' ? 'módulo' : editingItem.type === 'lesson' ? 'lección' : 'cuestionario'}.`
                : `Completa la información para crear un nuevo ${editingItem?.type === 'module' ? 'módulo' : editingItem?.type === 'lesson' ? 'lección' : 'cuestionario'}.`
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {editingItem?.type === 'module' && (
              <>
                <div>
                  <Label htmlFor="module-title">Título del Módulo</Label>
                  <Input
                    id="module-title"
                    value={moduleForm.title}
                    onChange={(e) => setModuleForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ej: Introducción a React"
                  />
                </div>
                <div>
                  <Label htmlFor="module-description">Descripción</Label>
                  <Textarea
                    id="module-description"
                    value={moduleForm.description}
                    onChange={(e) => setModuleForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe qué aprenderán los estudiantes en este módulo"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="module-duration">Duración Estimada (minutos)</Label>
                    <Input
                      id="module-duration"
                      type="number"
                      value={moduleForm.estimatedDuration}
                      onChange={(e) => setModuleForm(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="flex items-center space-x-4 pt-6">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={moduleForm.isLocked}
                        onChange={(e) => setModuleForm(prev => ({ ...prev, isLocked: e.target.checked }))}
                      />
                      <span className="text-sm">Módulo Bloqueado</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={moduleForm.hasCertificate}
                        onChange={(e) => setModuleForm(prev => ({ ...prev, hasCertificate: e.target.checked }))}
                      />
                      <span className="text-sm">Incluir Certificado</span>
                    </label>
                  </div>
                </div>
              </>
            )}

            {editingItem?.type === 'lesson' && (
              <>
                <div>
                  <Label htmlFor="lesson-title">Título de la Lección</Label>
                  <Input
                    id="lesson-title"
                    value={lessonForm.title}
                    onChange={(e) => setLessonForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ej: Componentes en React"
                  />
                </div>
                <div>
                  <Label htmlFor="lesson-description">Descripción</Label>
                  <Textarea
                    id="lesson-description"
                    value={lessonForm.description}
                    onChange={(e) => setLessonForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Breve descripción de la lección"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lesson-type">Tipo de Contenido</Label>
                    <Select
                      value={lessonForm.contentType}
                      onValueChange={(value) => setLessonForm(prev => ({ ...prev, contentType: value as "TEXT" | "VIDEO" | "AUDIO" | "DOCUMENT" }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TEXT">Texto</SelectItem>
                        <SelectItem value="VIDEO">Video</SelectItem>
                        <SelectItem value="AUDIO">Audio</SelectItem>
                        <SelectItem value="DOCUMENT">Documento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="lesson-duration">Duración (minutos)</Label>
                    <Input
                      id="lesson-duration"
                      type="number"
                      value={lessonForm.duration}
                      onChange={(e) => setLessonForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                {/* File Upload Section */}
                {(lessonForm.contentType === "VIDEO" || lessonForm.contentType === "AUDIO" || lessonForm.contentType === "DOCUMENT") && (
                  <div>
                    <Label>Subir Archivo {getContentTypeLabel(lessonForm.contentType)}</Label>
                    <LessonFileUpload
                      contentType={lessonForm.contentType as "VIDEO" | "AUDIO" | "DOCUMENT" | "TEXT"}
                      onUpload={handleFileUpload}
                      onUploadComplete={(url) => {
                        console.log("[UnifiedCourseManager] File upload complete, URL:", url);
                        setUploadedFileUrl(url);
                      }}
                      onRemove={() => setUploadedFileUrl(null)}
                      currentUrl={uploadedFileUrl || undefined}
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="lesson-content">Contenido</Label>
                  <Textarea
                    id="lesson-content"
                    value={lessonForm.content}
                    onChange={(e) => setLessonForm(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Contenido de la lección (texto, instrucciones, etc.)"
                    rows={4}
                  />
                </div>

                {/* Resource Upload Section */}
                <div>
                  <ResourceUpload
                    onResourcesChange={(resources) => {
                      setLessonForm(prev => ({ ...prev, attachments: resources }));
                    }}
                    initialResources={lessonForm.attachments}
                    disabled={isLoading}
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={lessonForm.isRequired}
                      onChange={(e) => setLessonForm(prev => ({ ...prev, isRequired: e.target.checked }))}
                    />
                    <span className="text-sm">Lección Requerida</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={lessonForm.isPreview}
                      onChange={(e) => setLessonForm(prev => ({ ...prev, isPreview: e.target.checked }))}
                    />
                    <span className="text-sm">Vista Previa</span>
                  </label>
                </div>
              </>
            )}

            {editingItem?.type === 'quiz' && (
              <>
                <div>
                  <Label htmlFor="quiz-title">Título del Cuestionario</Label>
                  <Input
                    id="quiz-title"
                    value={quizForm.title}
                    onChange={(e) => setQuizForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ej: Evaluación de Conceptos Básicos"
                  />
                </div>
                <div>
                  <Label htmlFor="quiz-description">Descripción</Label>
                  <Textarea
                    id="quiz-description"
                    value={quizForm.description}
                    onChange={(e) => setQuizForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descripción del cuestionario"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quiz-time">Tiempo Límite (minutos)</Label>
                    <Input
                      id="quiz-time"
                      type="number"
                      value={quizForm.timeLimit}
                      onChange={(e) => setQuizForm(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 0 }))}
                      placeholder="0 = Sin límite"
                    />
                  </div>
                  <div>
                    <Label htmlFor="quiz-passing">Puntuación Mínima (%)</Label>
                    <Input
                      id="quiz-passing"
                      type="number"
                      value={quizForm.passingScore}
                      onChange={(e) => setQuizForm(prev => ({ ...prev, passingScore: parseInt(e.target.value) || 70 }))}
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="quiz-published"
                    checked={quizForm.isPublished}
                    onChange={(e) => setQuizForm(prev => ({ ...prev, isPublished: e.target.checked }))}
                  />
                  <Label htmlFor="quiz-published">Publicar Cuestionario</Label>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingItem(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Guardando...' : editingItem?.id ? 'Guardar Cambios' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quiz Question Editor */}
      {editingQuizQuestions && (
        <QuizQuestionEditor
          quizId={editingQuizQuestions}
          questions={quizzes.find(q => q.id === editingQuizQuestions)?.questions || []}
          onQuestionsChange={(questions) => {
            const updatedQuizzes = quizzes.map(q => 
              q.id === editingQuizQuestions 
                ? { ...q, questions }
                : q
            );
            onQuizzesChange(updatedQuizzes);
          }}
          isOpen={!!editingQuizQuestions}
          onClose={() => setEditingQuizQuestions(null)}
        />
      )}
    </div>
  );
}
