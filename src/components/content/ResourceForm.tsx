"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Save,
  X,
  Tag,
  Calendar,
  Upload,
  FileText,
  Video,
  Image,
  File,
  Globe
} from "lucide-react";

interface ResourceFormProps {
  resource?: {
    id: string;
    title: string;
    description: string;
    category: string;
    type: "PDF" | "VIDEO" | "AUDIO" | "IMAGE" | "DOCUMENT" | "LINK";
    fileUrl?: string;
    fileSize?: number;
    tags: string[];
    status: "DRAFT" | "PUBLISHED" | "SCHEDULED" | "ARCHIVED";
    publishedAt?: string;
    scheduledAt?: string;
  } | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  className?: string;
}

export function ResourceForm({
  resource,
  onSubmit,
  onCancel,
  className
}: ResourceFormProps) {
  const [formData, setFormData] = useState({
    title: resource?.title || "",
    description: resource?.description || "",
    category: resource?.category || "GENERAL",
    type: resource?.type || "PDF",
    fileUrl: resource?.fileUrl || "",
    fileSize: resource?.fileSize || 0,
    tags: resource?.tags || [],
    status: resource?.status || "DRAFT",
    scheduledAt: resource?.scheduledAt || ""
  });

  const [newTag, setNewTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "PDF":
        return FileText;
      case "VIDEO":
        return Video;
      case "AUDIO":
        return File;
      case "IMAGE":
        return Image;
      case "DOCUMENT":
        return File;
      case "LINK":
        return Globe;
      default:
        return File;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "PDF":
        return "PDF";
      case "VIDEO":
        return "Video";
      case "AUDIO":
        return "Audio";
      case "IMAGE":
        return "Imagen";
      case "DOCUMENT":
        return "Documento";
      case "LINK":
        return "Enlace";
      default:
        return type;
    }
  };

  const TypeIcon = getTypeIcon(formData.type);

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Información Básica
            </CardTitle>
            <CardDescription>
              Título, descripción y tipo de recurso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Título del recurso"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Descripción *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Descripción del recurso"
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Categoría *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GENERAL">General</SelectItem>
                    <SelectItem value="EDUCATION">Educación</SelectItem>
                    <SelectItem value="JOBS">Empleo</SelectItem>
                    <SelectItem value="ENTREPRENEURSHIP">Emprendimiento</SelectItem>
                    <SelectItem value="TECHNOLOGY">Tecnología</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="type">Tipo de Recurso *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleInputChange("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PDF">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        PDF
                      </div>
                    </SelectItem>
                    <SelectItem value="VIDEO">
                      <div className="flex items-center">
                        <Video className="h-4 w-4 mr-2" />
                        Video
                      </div>
                    </SelectItem>
                    <SelectItem value="AUDIO">
                      <div className="flex items-center">
                        <File className="h-4 w-4 mr-2" />
                        Audio
                      </div>
                    </SelectItem>
                    <SelectItem value="IMAGE">
                      <div className="flex items-center">
                        <Image className="h-4 w-4 mr-2" />
                        Imagen
                      </div>
                    </SelectItem>
                    <SelectItem value="DOCUMENT">
                      <div className="flex items-center">
                        <File className="h-4 w-4 mr-2" />
                        Documento
                      </div>
                    </SelectItem>
                    <SelectItem value="LINK">
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-2" />
                        Enlace
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              Archivo
            </CardTitle>
            <CardDescription>
              Información del archivo o enlace del recurso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="fileUrl">URL del Archivo *</Label>
              <Input
                id="fileUrl"
                value={formData.fileUrl}
                onChange={(e) => handleInputChange("fileUrl", e.target.value)}
                placeholder="https://ejemplo.com/archivo.pdf"
                required
              />
            </div>

            {formData.type !== "LINK" && (
              <div>
                <Label htmlFor="fileSize">Tamaño del Archivo (bytes)</Label>
                <Input
                  id="fileSize"
                  type="number"
                  value={formData.fileSize}
                  onChange={(e) => handleInputChange("fileSize", parseInt(e.target.value) || 0)}
                  placeholder="1024000"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Tag className="h-5 w-5 mr-2" />
              Etiquetas
            </CardTitle>
            <CardDescription>
              Agrega etiquetas para categorizar el recurso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Agregar etiqueta"
              />
              <Button type="button" onClick={handleAddTag}>
                Agregar
              </Button>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 hover:bg-destructive hover:text-destructive-foreground rounded-full p-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Publication Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Configuración de Publicación
            </CardTitle>
            <CardDescription>
              Estado y programación de publicación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="status">Estado</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Borrador</SelectItem>
                  <SelectItem value="PUBLISHED">Publicado</SelectItem>
                  <SelectItem value="SCHEDULED">Programado</SelectItem>
                  <SelectItem value="ARCHIVED">Archivado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.status === "SCHEDULED" && (
              <div>
                <Label htmlFor="scheduledAt">Fecha de Publicación Programada</Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) => handleInputChange("scheduledAt", e.target.value)}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "Guardando..." : resource ? "Actualizar" : "Crear"}
          </Button>
        </div>
      </div>
    </form>
  );
}
