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
  FileText, 
  Save,
  X,
  Tag,
  Calendar,
  Image,
  Eye
} from "lucide-react";

interface NewsFormProps {
  news?: {
    id: string;
    title: string;
    content: string;
    excerpt: string;
    category: string;
    tags: string[];
    featuredImage?: string;
    status: "DRAFT" | "PUBLISHED" | "SCHEDULED" | "ARCHIVED";
    publishedAt?: string;
    scheduledAt?: string;
  } | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  className?: string;
}

export function NewsForm({
  news,
  onSubmit,
  onCancel,
  className
}: NewsFormProps) {
  const [formData, setFormData] = useState({
    title: news?.title || "",
    content: news?.content || "",
    excerpt: news?.excerpt || "",
    category: news?.category || "GENERAL",
    tags: news?.tags || [],
    featuredImage: news?.featuredImage || "",
    status: news?.status || "DRAFT",
    scheduledAt: news?.scheduledAt || ""
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

  const generateExcerpt = () => {
    if (formData.content && !formData.excerpt) {
      const excerpt = formData.content.substring(0, 200);
      setFormData(prev => ({
        ...prev,
        excerpt: excerpt + (excerpt.length < formData.content.length ? "..." : "")
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Información Básica
            </CardTitle>
            <CardDescription>
              Título, contenido y categoría de la noticia
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Título de la noticia"
                required
              />
            </div>

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
              <Label htmlFor="content">Contenido *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleInputChange("content", e.target.value)}
                placeholder="Escribe el contenido de la noticia aquí..."
                rows={8}
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="excerpt">Resumen</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateExcerpt}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Generar automáticamente
                </Button>
              </div>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => handleInputChange("excerpt", e.target.value)}
                placeholder="Resumen de la noticia (se genera automáticamente si se deja vacío)"
                rows={3}
              />
            </div>
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
              Agrega etiquetas para categorizar la noticia
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

        {/* Media and Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Image className="h-5 w-5 mr-2" />
              Media y Configuración
            </CardTitle>
            <CardDescription>
              Imagen destacada y configuración de publicación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="featuredImage">URL de Imagen Destacada</Label>
              <Input
                id="featuredImage"
                value={formData.featuredImage}
                onChange={(e) => handleInputChange("featuredImage", e.target.value)}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>

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
            {isSubmitting ? "Guardando..." : news ? "Actualizar" : "Crear"}
          </Button>
        </div>
      </div>
    </form>
  );
}
