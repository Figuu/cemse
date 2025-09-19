"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { X, Plus, Save, Eye, EyeOff, Upload, Image, Video, File } from "lucide-react";
import { useFileUpload } from "@/hooks/useFileUpload";

interface NewsFormProps {
  initialData?: {
    id?: string;
    title: string;
    content: string;
    summary?: string;
    category: string;
    tags: string[];
    imageUrl?: string;
    videoUrl?: string;
    status: "PUBLISHED" | "DRAFT" | "ARCHIVED";
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    featured: boolean;
    targetAudience: string[];
    region?: string;
    isEntrepreneurshipRelated: boolean;
  };
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const categories = [
  "Empleo",
  "Educación", 
  "Emprendimiento",
  "Tecnología",
  "Política",
  "Salud",
  "Deportes",
  "Cultura",
  "Medio Ambiente",
  "Internacional",
  "Local",
  "Otros"
];

const targetAudiences = [
  "Jóvenes",
  "Estudiantes",
  "Emprendedores",
  "Profesionales",
  "Empresarios",
  "Instituciones",
  "Público General"
];

export function NewsForm({ initialData, onSubmit, onCancel, isLoading = false }: NewsFormProps) {
  const { uploadFile, isUploading: isFileUploading, progress: uploadProgress, error: uploadError, reset: resetUpload } = useFileUpload();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    content: initialData?.content || "",
    summary: initialData?.summary || "",
    category: initialData?.category || "",
    tags: initialData?.tags || [],
    imageUrl: initialData?.imageUrl || "",
    videoUrl: initialData?.videoUrl || "",
    status: initialData?.status || "DRAFT",
    priority: initialData?.priority || "MEDIUM",
    featured: initialData?.featured || false,
    targetAudience: initialData?.targetAudience || [],
    region: initialData?.region || "",
    isEntrepreneurshipRelated: initialData?.isEntrepreneurshipRelated || false,
  });

  const [newTag, setNewTag] = useState("");
  const [newAudience, setNewAudience] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddAudience = () => {
    if (newAudience.trim() && !formData.targetAudience.includes(newAudience.trim())) {
      setFormData(prev => ({
        ...prev,
        targetAudience: [...prev.targetAudience, newAudience.trim()]
      }));
      setNewAudience("");
    }
  };

  const handleRemoveAudience = (audienceToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      targetAudience: prev.targetAudience.filter(audience => audience !== audienceToRemove)
    }));
  };

  const handleFileUpload = async (file: File, type: 'image' | 'video') => {
    try {
      if (type === 'image') {
        setUploadingImage(true);
      } else {
        setUploadingVideo(true);
      }
      
      resetUpload();
      const url = await uploadFile(file, "news");
      
      if (type === 'image') {
        setFormData(prev => ({ ...prev, imageUrl: url }));
      } else {
        setFormData(prev => ({ ...prev, videoUrl: url }));
      }
    } catch (error) {
      console.error('File upload error:', error);
    } finally {
      if (type === 'image') {
        setUploadingImage(false);
      } else {
        setUploadingVideo(false);
      }
    }
  };

  const handleImageFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate image file
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      handleFileUpload(file, 'image');
    }
  };

  const handleVideoFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate video file
      if (!file.type.startsWith('video/')) {
        alert('Please select a video file');
        return;
      }
      handleFileUpload(file, 'video');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Auto-generate summary if not provided
  useEffect(() => {
    if (!formData.summary && formData.content) {
      const summary = formData.content.substring(0, 200).trim();
      if (summary.length > 0) {
        setFormData(prev => ({
          ...prev,
          summary: summary + (formData.content.length > 200 ? "..." : "")
        }));
      }
    }
  }, [formData.content, formData.summary]);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {initialData?.id ? "Editar Noticia" : "Crear Nueva Noticia"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Título de la noticia"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoría *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Resumen</Label>
            <Textarea
              id="summary"
              value={formData.summary}
              onChange={(e) => handleInputChange("summary", e.target.value)}
              placeholder="Resumen breve de la noticia (se genera automáticamente si se deja vacío)"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Contenido *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleInputChange("content", e.target.value)}
              placeholder="Contenido completo de la noticia"
              rows={8}
              required
            />
          </div>

          {/* Media */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Medios</h3>
            
            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Imagen</Label>
              <div className="flex gap-2">
                <Input
                  value={formData.imageUrl}
                  onChange={(e) => handleInputChange("imageUrl", e.target.value)}
                  placeholder="URL de imagen o sube un archivo"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Subir
                </Button>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileSelect}
                  className="hidden"
                />
              </div>
              {uploadingImage && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-sm text-muted-foreground">Subiendo imagen...</p>
                </div>
              )}
              {formData.imageUrl && (
                <div className="mt-2">
                  <img 
                    src={formData.imageUrl} 
                    alt="Preview" 
                    className="w-32 h-24 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>

            {/* Video Upload */}
            <div className="space-y-2">
              <Label>Video</Label>
              <div className="flex gap-2">
                <Input
                  value={formData.videoUrl}
                  onChange={(e) => handleInputChange("videoUrl", e.target.value)}
                  placeholder="URL de video o sube un archivo"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => videoInputRef.current?.click()}
                  disabled={uploadingVideo}
                >
                  {uploadingVideo ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Subir
                </Button>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoFileSelect}
                  className="hidden"
                />
              </div>
              {uploadingVideo && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-sm text-muted-foreground">Subiendo video...</p>
                </div>
              )}
              {formData.videoUrl && (
                <div className="mt-2">
                  <video 
                    src={formData.videoUrl} 
                    controls 
                    className="w-64 h-36 rounded-lg border"
                  >
                    Tu navegador no soporta el elemento video.
                  </video>
                </div>
              )}
            </div>

            {uploadError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">Error al subir archivo: {uploadError}</p>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Etiquetas</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Agregar etiqueta"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
              />
              <Button type="button" onClick={handleAddTag} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Target Audience */}
          <div className="space-y-2">
            <Label>Audiencia Objetivo</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.targetAudience.map((audience) => (
                <Badge key={audience} variant="outline" className="flex items-center gap-1">
                  {audience}
                  <button
                    type="button"
                    onClick={() => handleRemoveAudience(audience)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Select value={newAudience} onValueChange={setNewAudience}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar audiencia" />
                </SelectTrigger>
                <SelectContent>
                  {targetAudiences.map((audience) => (
                    <SelectItem key={audience} value={audience}>
                      {audience}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" onClick={handleAddAudience} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Borrador</SelectItem>
                  <SelectItem value="PUBLISHED">Publicado</SelectItem>
                  <SelectItem value="ARCHIVED">Archivado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridad</Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Baja</SelectItem>
                  <SelectItem value="MEDIUM">Media</SelectItem>
                  <SelectItem value="HIGH">Alta</SelectItem>
                  <SelectItem value="URGENT">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">Región</Label>
              <Input
                id="region"
                value={formData.region}
                onChange={(e) => handleInputChange("region", e.target.value)}
                placeholder="Cochabamba, Bolivia"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => handleInputChange("featured", checked)}
              />
              <Label htmlFor="featured">Destacado</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isEntrepreneurshipRelated"
                checked={formData.isEntrepreneurshipRelated}
                onCheckedChange={(checked) => handleInputChange("isEntrepreneurshipRelated", checked)}
              />
              <Label htmlFor="isEntrepreneurshipRelated">Relacionado con Emprendimiento</Label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <>
                  {formData.status === "PUBLISHED" ? <Eye className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  {formData.status === "PUBLISHED" ? "Publicar" : "Guardar"}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
