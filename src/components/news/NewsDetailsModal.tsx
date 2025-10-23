"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  X, 
  Eye, 
  Calendar, 
  User, 
  Globe,
  Edit,
  Trash2,
  EyeOff,
  BookOpen,
  TrendingUp
} from "lucide-react";

interface NewsDetailsModalProps {
  news: {
    id: string;
    title: string;
    content: string;
    summary: string;
    imageUrl?: string;
    videoUrl?: string;
    authorName: string;
    authorType: "COMPANY" | "INSTITUTION" | "ADMIN";
    authorLogo?: string;
    status: "PUBLISHED" | "DRAFT" | "ARCHIVED";
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    featured: boolean;
    tags: string[];
    category: string;
    publishedAt?: string;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    targetAudience: string[];
    region?: string;
    isEntrepreneurshipRelated: boolean;
    createdAt: string;
    updatedAt: string;
    author?: {
      id: string;
      email: string;
      profile?: {
        firstName?: string;
        lastName?: string;
      };
    };
  };
  onClose: () => void;
  onEdit?: (news: any) => void;
  onDelete?: (id: string) => void;
  onPublish?: (id: string) => void;
  onUnpublish?: (id: string) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  canPublish?: boolean;
}

export function NewsDetailsModal({
  news,
  onClose,
  onEdit,
  onDelete,
  onPublish,
  onUnpublish,
  canEdit = false,
  canDelete = false,
  canPublish = false,
}: NewsDetailsModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800";
      case "LOW":
        return "bg-green-100 text-green-800";
      case "URGENT":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAuthorTypeIcon = (authorType: string) => {
    switch (authorType) {
      case "INSTITUTION":
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      case "COMPANY":
        return <Globe className="h-4 w-4 text-green-500" />;
      case "ADMIN":
        return <TrendingUp className="h-4 w-4 text-purple-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-green-100 text-green-800";
      case "DRAFT":
        return "bg-yellow-100 text-yellow-800";
      case "ARCHIVED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    setIsDeleting(true);
    try {
      await onDelete(news.id);
      onClose();
    } catch (error) {
      console.error("Error deleting news:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={news.authorLogo} />
                <AvatarFallback>
                  {getAuthorTypeIcon(news.authorType)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl">{news.title}</CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    {getAuthorTypeIcon(news.authorType)}
                    <span>{news.authorName}</span>
                  </div>
                  <Badge className={getStatusColor(news.status)}>
                    {news.status === "PUBLISHED" ? "Publicado" : 
                     news.status === "DRAFT" ? "Borrador" : "Archivado"}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {canEdit && onEdit && (
                <Button variant="outline" size="sm" onClick={() => onEdit(news)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
              )}
              {canPublish && onPublish && news.status === "DRAFT" && (
                <Button size="sm" onClick={() => onPublish(news.id)}>
                  <Eye className="h-4 w-4 mr-1" />
                  Publicar
                </Button>
              )}
              {canPublish && onUnpublish && news.status === "PUBLISHED" && (
                <Button variant="outline" size="sm" onClick={() => onUnpublish(news.id)}>
                  <EyeOff className="h-4 w-4 mr-1" />
                  Despublicar
                </Button>
              )}
              {canDelete && onDelete && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  {isDeleting ? "Eliminando..." : "Eliminar"}
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Image */}
          {news.imageUrl && (
            <div className="w-full h-64 bg-gray-200 rounded-lg overflow-hidden">
              <img 
                src={news.imageUrl} 
                alt={news.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Video */}
          {news.videoUrl && (
            <div className="w-full">
              <video 
                src={news.videoUrl} 
                controls 
                className="w-full rounded-lg"
              >
                Tu navegador no soporta el elemento video.
              </video>
            </div>
          )}

          {/* Summary */}
          {news.summary && (
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Resumen</h3>
              <p className="text-muted-foreground">{news.summary}</p>
            </div>
          )}

          {/* Content */}
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap">{news.content}</div>
          </div>

          {/* Tags */}
          {news.tags.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Etiquetas</h3>
              <div className="flex flex-wrap gap-2">
                {news.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Target Audience */}
          {news.targetAudience.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Audiencia Objetivo</h3>
              <div className="flex flex-wrap gap-2">
                {news.targetAudience.map((audience) => (
                  <Badge key={audience} variant="outline">
                    {audience}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Publicado:</span>
                <span>{news.publishedAt ? formatDate(news.publishedAt) : "No publicado"}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Vistas:</span>
                <span>{news.viewCount.toLocaleString()}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <span className="font-medium">Categoría:</span>
                <Badge variant="outline">{news.category}</Badge>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <span className="font-medium">Prioridad:</span>
                <Badge className={getPriorityColor(news.priority)}>
                  {news.priority}
                </Badge>
              </div>
              {news.featured && (
                <div className="flex items-center space-x-2 text-sm">
                  <Badge className="bg-yellow-100 text-yellow-800">
                    Destacado
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center space-x-4 pt-4 border-t">
            {/* Botones de acción removidos */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
