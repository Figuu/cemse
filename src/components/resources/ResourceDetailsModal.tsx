"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Edit, Trash2, Eye, EyeOff, Calendar, User, Tag, ExternalLink, FileText, Video, Image, File, Globe } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ResourceDetailsModalProps {
  resource: any;
  onClose: () => void;
  onEdit?: (resource: any) => void;
  onDelete?: (id: string) => Promise<boolean>;
  onPublish?: (id: string) => Promise<boolean>;
  onUnpublish?: (id: string) => Promise<boolean>;
  canEdit: boolean;
  canDelete: boolean;
  canPublish: boolean;
}

export function ResourceDetailsModal({
  resource,
  onClose,
  onEdit,
  onDelete,
  onPublish,
  onUnpublish,
  canEdit,
  canDelete,
  canPublish,
}: ResourceDetailsModalProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "PDF":
      case "DOC":
      case "PPT":
      case "XLS":
        return <FileText className="h-5 w-5 text-red-500" />;
      case "Video":
        return <Video className="h-5 w-5 text-blue-500" />;
      case "Image":
        return <Image className="h-5 w-5 text-green-500" />;
      case "ZIP":
        return <File className="h-5 w-5 text-purple-500" />;
      case "URL":
        return <Globe className="h-5 w-5 text-orange-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED": return "bg-green-100 text-green-800";
      case "DRAFT": return "bg-yellow-100 text-yellow-800";
      case "ARCHIVED": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PUBLISHED": return "Publicado";
      case "DRAFT": return "Borrador";
      case "ARCHIVED": return "Archivado";
      default: return status;
    }
  };

  const handleDelete = async () => {
    if (onDelete && confirm("¿Estás seguro de que quieres eliminar este recurso?")) {
      const success = await onDelete(resource.id);
      if (success) onClose();
    }
  };

  const handlePublish = async () => {
    if (onPublish && confirm("¿Estás seguro de que quieres publicar este recurso?")) {
      const success = await onPublish(resource.id);
      if (success) onClose();
    }
  };

  const handleUnpublish = async () => {
    if (onUnpublish && confirm("¿Estás seguro de que quieres despublicar este recurso?")) {
      const success = await onUnpublish(resource.id);
      if (success) onClose();
    }
  };

  const handleDownload = () => {
    if (resource.downloadUrl) {
      window.open(resource.downloadUrl, '_blank');
    } else if (resource.externalUrl) {
      window.open(resource.externalUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getTypeIcon(resource.type)}
              <div>
                <CardTitle className="text-2xl">{resource.title}</CardTitle>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="outline">{resource.category}</Badge>
                  <Badge className={getStatusColor(resource.status)}>
                    {getStatusLabel(resource.status)}
                  </Badge>
                  {resource.isPublic && (
                    <Badge variant="secondary">Público</Badge>
                  )}
                  {resource.isEntrepreneurshipRelated && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      Emprendimiento
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Descripción</h3>
            <p className="text-muted-foreground">{resource.description}</p>
          </div>

          {/* Thumbnail */}
          {resource.thumbnail && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Vista Previa</h3>
              <img 
                src={resource.thumbnail} 
                alt={resource.title}
                className="w-full h-64 object-cover rounded-lg border"
              />
            </div>
          )}

          {/* Resource Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Información del Recurso</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {resource.createdBy?.firstName} {resource.createdBy?.lastName}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {format(new Date(resource.publishedDate || resource.createdAt), "PPP", { locale: es })}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Detalles Técnicos</h3>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium">Tipo:</span>
                  <div className="flex items-center space-x-2 mt-1">
                    {getTypeIcon(resource.type)}
                    <span className="text-sm">{resource.type}</span>
                  </div>
                </div>
                
                <div>
                  <span className="text-sm font-medium">Formato:</span>
                  <span className="text-sm text-muted-foreground ml-2">{resource.format}</span>
                </div>
                
                <div>
                  <span className="text-sm font-medium">Estado:</span>
                  <Badge className={`ml-2 ${getStatusColor(resource.status)}`}>
                    {getStatusLabel(resource.status)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          {resource.tags && resource.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Etiquetas</h3>
              <div className="flex flex-wrap gap-2">
                {resource.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Download/View Link */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Acceso al Recurso</h3>
            <div className="flex items-center space-x-2">
              {resource.downloadUrl ? (
                <Button onClick={handleDownload}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Descargar Archivo
                </Button>
              ) : resource.externalUrl ? (
                <Button onClick={handleDownload} variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir Enlace
                </Button>
              ) : (
                <p className="text-muted-foreground">No hay archivo disponible</p>
              )}
            </div>
          </div>

          {/* Actions */}
          {(canEdit || canDelete || canPublish) && (
            <div className="flex justify-end space-x-2 pt-6 border-t">
              {canEdit && onEdit && (
                <Button variant="outline" onClick={() => onEdit(resource)}>
                  <Edit className="h-4 w-4 mr-2" /> Editar
                </Button>
              )}
              {canPublish && resource.status === "DRAFT" && onPublish && (
                <Button onClick={handlePublish}>
                  <Eye className="h-4 w-4 mr-2" /> Publicar
                </Button>
              )}
              {canPublish && resource.status === "PUBLISHED" && onUnpublish && (
                <Button variant="outline" onClick={handleUnpublish}>
                  <EyeOff className="h-4 w-4 mr-2" /> Despublicar
                </Button>
              )}
              {canDelete && onDelete && (
                <Button variant="destructive" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
