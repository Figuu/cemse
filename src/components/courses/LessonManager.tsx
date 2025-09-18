"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus,
  Edit,
  Trash2,
  GripVertical,
  Play,
  Clock,
  Eye,
  EyeOff,
  FileText,
  Video,
  Headphones,
  Image,
  BookOpen
} from "lucide-react";
import { LessonFileUpload } from "./LessonFileUpload";
import { LessonResources } from "./LessonResources";
import { LessonQuizzes } from "./LessonQuizzes";

interface CourseLesson {
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
  moduleId?: string;
  module?: {
    id: string;
    title: string;
    orderIndex: number;
  };
}

interface LessonManagerProps {
  courseId: string;
  moduleId: string;
  lessons: CourseLesson[];
  onLessonsChange: (lessons: CourseLesson[]) => void;
  selectedLessonId?: string | null;
  onClose?: () => void;
}

export function LessonManager({ courseId, moduleId, lessons, onLessonsChange, selectedLessonId, onClose }: LessonManagerProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<CourseLesson | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    contentType: "TEXT",
    videoUrl: "",
    audioUrl: "",
    duration: 0,
    isRequired: true,
    isPreview: false,
  });

  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [isFileUploading, setIsFileUploading] = useState(false);
  const [lessonResources, setLessonResources] = useState<Record<string, any[]>>({});
  const [lessonQuizzes, setLessonQuizzes] = useState<Record<string, any[]>>({});

  // Handle selectedLessonId prop
  useEffect(() => {
    if (selectedLessonId) {
      const lesson = lessons.find(l => l.id === selectedLessonId);
      if (lesson) {
        openEditModal(lesson);
      }
    } else if (selectedLessonId === null) {
      // Open create modal
      setIsCreateModalOpen(true);
      setIsEditModalOpen(false);
    }
  }, [selectedLessonId, lessons]);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      content: "",
      contentType: "TEXT",
      videoUrl: "",
      audioUrl: "",
      duration: 0,
      isRequired: true,
      isPreview: false,
    });
    setUploadedFileUrl(null);
  };

  const handleFileUpload = async (file: File): Promise<string> => {
    console.log("handleFileUpload called with file:", file.name, file.type);
    setIsFileUploading(true);
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("contentType", file.type);

      console.log("Uploading file to /api/upload...");
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Upload failed:", errorData);
        throw new Error(errorData.error || "Failed to upload file");
      }

      const data = await response.json();
      const url = data.url;
      
      console.log("Upload successful, setting uploadedFileUrl to:", url);
      
      // Set the uploaded file URL in state
      setUploadedFileUrl(url);
      
      return url;
    } catch (error) {
      console.error("Error in handleFileUpload:", error);
      throw error;
    } finally {
      setIsFileUploading(false);
    }
  };

  const handleCreateLesson = async () => {
    if (isFileUploading) {
      setError("Por favor espera a que termine la subida del archivo");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Determine the appropriate URL field based on content type
      let videoUrl = null;
      let audioUrl = null;

      if (formData.contentType === "VIDEO") {
        videoUrl = uploadedFileUrl || formData.videoUrl || null;
      } else if (formData.contentType === "AUDIO") {
        audioUrl = uploadedFileUrl || formData.audioUrl || null;
      }

      console.log("Creating lesson with:", {
        contentType: formData.contentType,
        uploadedFileUrl,
        videoUrl,
        audioUrl,
        formDataVideoUrl: formData.videoUrl,
        formDataAudioUrl: formData.audioUrl,
        isFileUploading,
        formData
      });

      const requestBody = {
        ...formData,
        videoUrl,
        audioUrl,
      };

      console.log("Sending lesson creation request with body:", requestBody);

      const response = await fetch(`/api/courses/${courseId}/modules/${moduleId}/lessons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create lesson");
      }

      const data = await response.json();
      console.log("Lesson creation response:", data);
      onLessonsChange([...lessons, data.lesson]);
      setIsCreateModalOpen(false);
      resetForm();
      onClose?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create lesson");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditLesson = async () => {
    if (!editingLesson) return;

    if (isFileUploading) {
      setError("Por favor espera a que termine la subida del archivo");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Determine the appropriate URL field based on content type
      let videoUrl = null;
      let audioUrl = null;

      if (formData.contentType === "VIDEO") {
        videoUrl = uploadedFileUrl || formData.videoUrl || null;
      } else if (formData.contentType === "AUDIO") {
        audioUrl = uploadedFileUrl || formData.audioUrl || null;
      }

      console.log("Updating lesson with:", {
        contentType: formData.contentType,
        uploadedFileUrl,
        videoUrl,
        audioUrl,
        formDataVideoUrl: formData.videoUrl,
        formDataAudioUrl: formData.audioUrl
      });

      const response = await fetch(`/api/courses/${courseId}/modules/${moduleId}/lessons/${editingLesson.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          videoUrl,
          audioUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update lesson");
      }

      const data = await response.json();
      onLessonsChange(lessons.map(l => l.id === editingLesson.id ? data.lesson : l));
      setIsEditModalOpen(false);
      setEditingLesson(null);
      resetForm();
      onClose?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update lesson");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta lección?")) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete lesson");
      }

      onLessonsChange(lessons.filter(l => l.id !== lessonId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete lesson");
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (lesson: CourseLesson) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      description: lesson.description || "",
      content: lesson.content,
      contentType: lesson.contentType,
      videoUrl: lesson.videoUrl || "",
      audioUrl: lesson.audioUrl || "",
      duration: lesson.duration || 0,
      isRequired: lesson.isRequired,
      isPreview: lesson.isPreview,
    });
    // Set the current file URL for display
    if (lesson.contentType === "VIDEO" && lesson.videoUrl) {
      setUploadedFileUrl(lesson.videoUrl);
    } else if (lesson.contentType === "AUDIO" && lesson.audioUrl) {
      setUploadedFileUrl(lesson.audioUrl);
    } else {
      setUploadedFileUrl(null);
    }
    setIsEditModalOpen(true);
  };

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType) {
      case "VIDEO":
        return <Video className="h-4 w-4" />;
      case "AUDIO":
        return <Headphones className="h-4 w-4" />;
      case "IMAGE":
        return <Image className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getContentTypeLabel = (contentType: string) => {
    switch (contentType) {
      case "VIDEO":
        return "Video";
      case "AUDIO":
        return "Audio";
      case "IMAGE":
        return "Imagen";
      case "TEXT":
        return "Texto";
      default:
        return contentType;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Lecciones del Módulo</h3>
          <p className="text-sm text-muted-foreground">
            Gestiona las lecciones de este módulo
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Lección
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nueva Lección</DialogTitle>
              <DialogDescription>
                Agrega una nueva lección al módulo
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título de la Lección</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ingresa el título de la lección"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe el contenido de esta lección"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contentType">Tipo de Contenido</Label>
                  <Select
                    value={formData.contentType}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, contentType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TEXT">Texto</SelectItem>
                      <SelectItem value="VIDEO">Video</SelectItem>
                      <SelectItem value="AUDIO">Audio</SelectItem>
                      <SelectItem value="IMAGE">Imagen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="duration">Duración (minutos)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
              </div>

              {(formData.contentType === "VIDEO" || formData.contentType === "AUDIO" || formData.contentType === "IMAGE") && (
                <div>
                  <Label>Subir Archivo {getContentTypeLabel(formData.contentType)}</Label>
                  <LessonFileUpload
                    contentType={formData.contentType as "VIDEO" | "AUDIO" | "IMAGE" | "TEXT"}
                    onUpload={handleFileUpload}
                    onRemove={() => setUploadedFileUrl(null)}
                    currentUrl={uploadedFileUrl || undefined}
                  />
                </div>
              )}

              {(formData.contentType === "VIDEO" || formData.contentType === "AUDIO") && (
                <div>
                  <Label htmlFor="urlInput">O ingresar URL manualmente</Label>
                  <Input
                    id="urlInput"
                    value={formData.contentType === "VIDEO" ? formData.videoUrl : formData.audioUrl}
                    onChange={(e) => {
                      if (formData.contentType === "VIDEO") {
                        setFormData(prev => ({ ...prev, videoUrl: e.target.value }));
                      } else {
                        setFormData(prev => ({ ...prev, audioUrl: e.target.value }));
                      }
                    }}
                    placeholder={formData.contentType === "VIDEO" ? "https://example.com/video.mp4" : "https://example.com/audio.mp3"}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="content">Contenido</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Contenido de la lección (texto, instrucciones, etc.)"
                  rows={6}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isRequired"
                    checked={formData.isRequired}
                    onChange={(e) => setFormData(prev => ({ ...prev, isRequired: e.target.checked }))}
                  />
                  <Label htmlFor="isRequired">Lección Requerida</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPreview"
                    checked={formData.isPreview}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPreview: e.target.checked }))}
                  />
                  <Label htmlFor="isPreview">Vista Previa</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsCreateModalOpen(false);
                onClose?.();
              }}>
                Cancelar
              </Button>
              <Button onClick={handleCreateLesson} disabled={isLoading || isFileUploading}>
                {isFileUploading ? "Subiendo archivo..." : isLoading ? "Creando..." : "Crear Lección"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {isFileUploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <p className="text-sm text-blue-600">
              Subiendo archivo... Por favor espera hasta que se complete
            </p>
          </div>
        </div>
      )}

      {lessons.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay lecciones</h3>
            <p className="text-muted-foreground mb-4">
              Agrega lecciones para crear el contenido de este módulo
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primera Lección
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {lessons.map((lesson, index) => (
            <Card key={lesson.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                    <div className="flex items-center space-x-2">
                      {getContentTypeIcon(lesson.contentType)}
                      <div>
                        <h4 className="font-semibold">{lesson.title}</h4>
                        {lesson.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {lesson.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 mr-1" />
                            {lesson.duration || 0} min
                          </div>
                          <Badge variant="outline">
                            {getContentTypeLabel(lesson.contentType)}
                          </Badge>
                          {lesson.module && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              <BookOpen className="h-3 w-3 mr-1" />
                              {lesson.module.title}
                            </Badge>
                          )}
                          {lesson.isRequired && (
                            <Badge variant="secondary">Requerida</Badge>
                          )}
                          {lesson.isPreview && (
                            <Badge variant="default">Vista Previa</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(lesson)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteLesson(lesson.id)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Resources and Quizzes Sections */}
                <div className="mt-6 space-y-6">
                  <LessonResources
                    lessonId={lesson.id}
                    resources={lessonResources[lesson.id] || []}
                    onResourcesChange={(resources) => 
                      setLessonResources(prev => ({ ...prev, [lesson.id]: resources }))
                    }
                  />
                  
                  <LessonQuizzes
                    lessonId={lesson.id}
                    courseId={courseId}
                    quizzes={lessonQuizzes[lesson.id] || []}
                    onQuizzesChange={(quizzes) => 
                      setLessonQuizzes(prev => ({ ...prev, [lesson.id]: quizzes }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Lección</DialogTitle>
            <DialogDescription>
              Modifica la información de la lección
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Título de la Lección</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ingresa el título de la lección"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-description">Descripción</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe el contenido de esta lección"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-contentType">Tipo de Contenido</Label>
                <Select
                  value={formData.contentType}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, contentType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TEXT">Texto</SelectItem>
                    <SelectItem value="VIDEO">Video</SelectItem>
                    <SelectItem value="AUDIO">Audio</SelectItem>
                    <SelectItem value="IMAGE">Imagen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-duration">Duración (minutos)</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
            </div>

            {(formData.contentType === "VIDEO" || formData.contentType === "AUDIO" || formData.contentType === "IMAGE") && (
              <div>
                <Label>Subir Archivo {getContentTypeLabel(formData.contentType)}</Label>
                <LessonFileUpload
                  contentType={formData.contentType as "VIDEO" | "AUDIO" | "IMAGE" | "TEXT"}
                  onUpload={handleFileUpload}
                  onRemove={() => setUploadedFileUrl(null)}
                  currentUrl={uploadedFileUrl || undefined}
                />
              </div>
            )}

            {(formData.contentType === "VIDEO" || formData.contentType === "AUDIO") && (
              <div>
                <Label htmlFor="edit-urlInput">O ingresar URL manualmente</Label>
                <Input
                  id="edit-urlInput"
                  value={formData.contentType === "VIDEO" ? formData.videoUrl : formData.audioUrl}
                  onChange={(e) => {
                    if (formData.contentType === "VIDEO") {
                      setFormData(prev => ({ ...prev, videoUrl: e.target.value }));
                    } else {
                      setFormData(prev => ({ ...prev, audioUrl: e.target.value }));
                    }
                  }}
                  placeholder={formData.contentType === "VIDEO" ? "https://example.com/video.mp4" : "https://example.com/audio.mp3"}
                />
              </div>
            )}

            <div>
              <Label htmlFor="edit-content">Contenido</Label>
              <Textarea
                id="edit-content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Contenido de la lección (texto, instrucciones, etc.)"
                rows={6}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-isRequired"
                  checked={formData.isRequired}
                  onChange={(e) => setFormData(prev => ({ ...prev, isRequired: e.target.checked }))}
                />
                <Label htmlFor="edit-isRequired">Lección Requerida</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-isPreview"
                  checked={formData.isPreview}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPreview: e.target.checked }))}
                />
                <Label htmlFor="edit-isPreview">Vista Previa</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditModalOpen(false);
              onClose?.();
            }}>
              Cancelar
            </Button>
            <Button onClick={handleEditLesson} disabled={isLoading || isFileUploading}>
              {isFileUploading ? "Subiendo archivo..." : isLoading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
