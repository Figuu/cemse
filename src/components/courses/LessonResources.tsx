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
  File,
  Download,
  Eye,
  Link,
  FileText,
  Image,
  Video,
  Headphones
} from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";

interface LessonResource {
  id: string;
  title: string;
  description: string;
  type: "file" | "url" | "text";
  fileUrl?: string;
  url?: string;
  content?: string;
  fileSize?: number;
  mimeType?: string;
}

interface LessonResourcesProps {
  lessonId: string;
  resources: LessonResource[];
  onResourcesChange: (resources: LessonResource[]) => void;
}

export function LessonResources({ lessonId, resources, onResourcesChange }: LessonResourcesProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<LessonResource | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "file" as "file" | "url" | "text",
    url: "",
    content: "",
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "file",
      url: "",
      content: "",
    });
  };

  const handleFileUpload = async (files: File[]): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("contentType", file.type);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to upload file");
        }

        const data = await response.json();
        
        const newResource: LessonResource = {
          id: Math.random().toString(36).substr(2, 9),
          title: file.name,
          description: "",
          type: "file",
          fileUrl: data.url,
          fileSize: file.size,
          mimeType: file.type,
        };

        onResourcesChange([...resources, newResource]);
      }

      setIsCreateModalOpen(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload files");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateResource = () => {
    if (!formData.title) return;

    const newResource: LessonResource = {
      id: Math.random().toString(36).substr(2, 9),
      title: formData.title,
      description: formData.description,
      type: formData.type,
      url: formData.type === "url" ? formData.url : undefined,
      content: formData.type === "text" ? formData.content : undefined,
    };

    onResourcesChange([...resources, newResource]);
    setIsCreateModalOpen(false);
    resetForm();
  };

  const handleEditResource = () => {
    if (!editingResource) return;

    const updatedResources = resources.map(r => 
      r.id === editingResource.id ? editingResource : r
    );
    onResourcesChange(updatedResources);
    setIsEditModalOpen(false);
    setEditingResource(null);
    resetForm();
  };

  const handleDeleteResource = (resourceId: string) => {
    onResourcesChange(resources.filter(r => r.id !== resourceId));
  };

  const openEditModal = (resource: LessonResource) => {
    setEditingResource(resource);
    setFormData({
      title: resource.title,
      description: resource.description,
      type: resource.type,
      url: resource.url || "",
      content: resource.content || "",
    });
    setIsEditModalOpen(true);
  };

  const getResourceIcon = (resource: LessonResource) => {
    if (resource.type === "file") {
      if (resource.mimeType?.startsWith("video/")) {
        return <Video className="h-4 w-4" />;
      } else if (resource.mimeType?.startsWith("audio/")) {
        return <Headphones className="h-4 w-4" />;
      } else if (resource.mimeType?.startsWith("image/")) {
        return <Image className="h-4 w-4" />;
      } else {
        return <FileText className="h-4 w-4" />;
      }
    } else if (resource.type === "url") {
      return <Link className="h-4 w-4" />;
    } else {
      return <FileText className="h-4 w-4" />;
    }
  };

  const getResourceTypeLabel = (type: string) => {
    switch (type) {
      case "file":
        return "Archivo";
      case "url":
        return "Enlace";
      case "text":
        return "Texto";
      default:
        return type;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold">Recursos de la Lección</h4>
          <p className="text-sm text-muted-foreground">
            Agrega archivos, enlaces y contenido adicional
          </p>
        </div>
        <div className="flex space-x-2">
          <FileUpload
            onUpload={handleFileUpload}
            accept={{
              "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
              "video/*": [".mp4", ".avi", ".mov", ".wmv"],
              "audio/*": [".mp3", ".wav", ".ogg", ".m4a"],
              "application/pdf": [".pdf"],
              "application/msword": [".doc"],
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
              "text/*": [".txt", ".md", ".html"],
            }}
            maxFiles={5}
            maxSize={100 * 1024 * 1024} // 100MB
            className="w-auto"
          />
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Recurso
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar Recurso</DialogTitle>
                <DialogDescription>
                  Agrega un enlace o contenido de texto
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Título del recurso"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descripción del recurso"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="type">Tipo de Recurso</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="url">Enlace</SelectItem>
                      <SelectItem value="text">Texto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.type === "url" && (
                  <div>
                    <Label htmlFor="url">URL</Label>
                    <Input
                      id="url"
                      value={formData.url}
                      onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                      placeholder="https://example.com"
                    />
                  </div>
                )}

                {formData.type === "text" && (
                  <div>
                    <Label htmlFor="content">Contenido</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Contenido del recurso"
                      rows={6}
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateResource} disabled={!formData.title}>
                  Agregar Recurso
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {resources.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <File className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay recursos</h3>
            <p className="text-muted-foreground">
              Agrega archivos, enlaces o contenido adicional a esta lección
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {resources.map((resource) => (
            <Card key={resource.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getResourceIcon(resource)}
                    <div className="flex-1">
                      <h5 className="font-medium">{resource.title}</h5>
                      {resource.description && (
                        <p className="text-sm text-muted-foreground">
                          {resource.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline">
                          {getResourceTypeLabel(resource.type)}
                        </Badge>
                        {resource.fileSize && (
                          <span className="text-xs text-muted-foreground">
                            {formatFileSize(resource.fileSize)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {resource.fileUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(resource.fileUrl, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    {resource.url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(resource.url, '_blank')}
                      >
                        <Link className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(resource)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteResource(resource.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Recurso</DialogTitle>
            <DialogDescription>
              Modifica la información del recurso
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Título</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Título del recurso"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-description">Descripción</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción del recurso"
                rows={3}
              />
            </div>

            {formData.type === "url" && (
              <div>
                <Label htmlFor="edit-url">URL</Label>
                <Input
                  id="edit-url"
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://example.com"
                />
              </div>
            )}

            {formData.type === "text" && (
              <div>
                <Label htmlFor="edit-content">Contenido</Label>
                <Textarea
                  id="edit-content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Contenido del recurso"
                  rows={6}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditResource} disabled={!formData.title}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
