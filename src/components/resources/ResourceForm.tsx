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
import { X, Plus, Save, Eye, EyeOff, Upload, FileText, Video, Image, File, Globe } from "lucide-react";
import { useFileUpload } from "@/hooks/useFileUpload";

interface ResourceFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const RESOURCE_TYPES = [
  { value: "PDF", label: "PDF", icon: FileText },
  { value: "Video", label: "Video", icon: Video },
  { value: "Image", label: "Imagen", icon: Image },
  { value: "ZIP", label: "Archivo ZIP", icon: File },
  { value: "DOC", label: "Documento", icon: FileText },
  { value: "PPT", label: "Presentación", icon: FileText },
  { value: "XLS", label: "Hoja de Cálculo", icon: FileText },
  { value: "URL", label: "Enlace Externo", icon: Globe },
];

const CATEGORIES = [
  "Tecnología",
  "Marketing",
  "Empleo",
  "Emprendimiento",
  "Educación",
  "Salud",
  "Finanzas",
  "Recursos Humanos",
  "Otros"
];

export function ResourceForm({ initialData, onSubmit, onCancel, isLoading = false }: ResourceFormProps) {
  const { uploadFile, isUploading: isFileUploading, progress: uploadProgress, error: uploadError, reset: resetUpload } = useFileUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    category: initialData?.category || "",
    type: initialData?.type || "",
    format: initialData?.format || "",
    downloadUrl: initialData?.downloadUrl || "",
    externalUrl: initialData?.externalUrl || "",
    thumbnail: initialData?.thumbnail || "",
    tags: initialData?.tags || [],
    status: initialData?.status || "DRAFT",
    isPublic: initialData?.isPublic !== undefined ? initialData.isPublic : true,
    isEntrepreneurshipRelated: initialData?.isEntrepreneurshipRelated || false,
  });

  const [newTag, setNewTag] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

  const handleFileUpload = async (file: File) => {
    try {
      setUploadingFile(true);
      resetUpload();
      const url = await uploadFile(file);
      setFormData(prev => ({ ...prev, downloadUrl: url }));
    } catch (error) {
      console.error('File upload error:', error);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleTypeChange = (type: string) => {
    setFormData(prev => ({ 
      ...prev, 
      type,
      format: type // Set format same as type
    }));
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        category: initialData.category || "",
        type: initialData.type || "",
        format: initialData.format || "",
        downloadUrl: initialData.downloadUrl || "",
        externalUrl: initialData.externalUrl || "",
        thumbnail: initialData.thumbnail || "",
        tags: initialData.tags || [],
        status: initialData.status || "DRAFT",
        isPublic: initialData.isPublic !== undefined ? initialData.isPublic : true,
        isEntrepreneurshipRelated: initialData.isEntrepreneurshipRelated || false,
      });
    }
  }, [initialData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Editar Recurso" : "Crear Nuevo Recurso"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información Básica</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Título del recurso"
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
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
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
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Archivo *</Label>
                <Select value={formData.type} onValueChange={handleTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {RESOURCE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center space-x-2">
                          <type.icon className="h-4 w-4" />
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Borrador</SelectItem>
                    <SelectItem value="PUBLISHED">Publicado</SelectItem>
                    <SelectItem value="ARCHIVED">Archivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Archivo</h3>

            {formData.type === "URL" ? (
              <div className="space-y-2">
                <Label htmlFor="externalUrl">URL Externa *</Label>
                <Input
                  id="externalUrl"
                  value={formData.externalUrl}
                  onChange={(e) => handleInputChange("externalUrl", e.target.value)}
                  placeholder="https://ejemplo.com/recurso"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Subir Archivo</Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.downloadUrl}
                    onChange={(e) => handleInputChange("downloadUrl", e.target.value)}
                    placeholder="URL del archivo o sube un archivo"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingFile}
                  >
                    {uploadingFile ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Subir
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov"
                  />
                </div>
                {uploadingFile && (
                  <div className="space-y-2">
                    <Progress value={uploadProgress} className="w-full" />
                    <p className="text-sm text-muted-foreground">Subiendo archivo...</p>
                  </div>
                )}
                {formData.downloadUrl && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-600">Archivo subido exitosamente</p>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="thumbnail">Miniatura (URL)</Label>
              <Input
                id="thumbnail"
                value={formData.thumbnail}
                onChange={(e) => handleInputChange("thumbnail", e.target.value)}
                placeholder="URL de la imagen de vista previa"
              />
            </div>

            {uploadError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">Error al subir archivo: {uploadError}</p>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Etiquetas</h3>
            
            <div className="space-y-2">
              <Label htmlFor="tags">Agregar Etiquetas</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Escribir etiqueta"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Configuración</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isPublic">Público</Label>
                  <p className="text-sm text-muted-foreground">
                    Permitir que otros usuarios vean este recurso
                  </p>
                </div>
                <Switch
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => handleInputChange("isPublic", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isEntrepreneurshipRelated">Relacionado con Emprendimiento</Label>
                  <p className="text-sm text-muted-foreground">
                    Marcar si este recurso está relacionado con emprendimiento
                  </p>
                </div>
                <Switch
                  id="isEntrepreneurshipRelated"
                  checked={formData.isEntrepreneurshipRelated}
                  onCheckedChange={(checked) => handleInputChange("isEntrepreneurshipRelated", checked)}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-6">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {initialData ? "Actualizar" : "Crear"} Recurso
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
