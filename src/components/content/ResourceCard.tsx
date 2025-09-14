"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  BookOpen, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar,
  User,
  Tag,
  Download,
  Heart,
  MessageCircle,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Video,
  Image,
  File,
  Globe
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface ResourceCardProps {
  resource: {
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
    createdAt: string;
    updatedAt: string;
    author: {
      id: string;
      profile: {
        firstName: string;
        lastName: string;
      };
    };
    _count: {
      downloads: number;
      likes: number;
      comments: number;
    };
  };
  onEdit?: (resource: any) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
  className?: string;
}

export function ResourceCard({
  resource,
  onEdit,
  onDelete,
  onView,
  className
}: ResourceCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "DRAFT":
        return <Edit className="h-4 w-4 text-yellow-600" />;
      case "SCHEDULED":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "ARCHIVED":
        return <XCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-green-100 text-green-800";
      case "DRAFT":
        return "bg-yellow-100 text-yellow-800";
      case "SCHEDULED":
        return "bg-blue-100 text-blue-800";
      case "ARCHIVED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "Publicado";
      case "DRAFT":
        return "Borrador";
      case "SCHEDULED":
        return "Programado";
      case "ARCHIVED":
        return "Archivado";
      default:
        return status;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "GENERAL":
        return "General";
      case "EDUCATION":
        return "Educación";
      case "JOBS":
        return "Empleo";
      case "ENTREPRENEURSHIP":
        return "Emprendimiento";
      case "TECHNOLOGY":
        return "Tecnología";
      default:
        return category;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "GENERAL":
        return "bg-gray-100 text-gray-800";
      case "EDUCATION":
        return "bg-blue-100 text-blue-800";
      case "JOBS":
        return "bg-green-100 text-green-800";
      case "ENTREPRENEURSHIP":
        return "bg-purple-100 text-purple-800";
      case "TECHNOLOGY":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case "PDF":
        return "bg-red-100 text-red-800";
      case "VIDEO":
        return "bg-purple-100 text-purple-800";
      case "AUDIO":
        return "bg-blue-100 text-blue-800";
      case "IMAGE":
        return "bg-green-100 text-green-800";
      case "DOCUMENT":
        return "bg-gray-100 text-gray-800";
      case "LINK":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  };

  const TypeIcon = getTypeIcon(resource.type);

  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={resource.fileUrl} />
              <AvatarFallback>
                <TypeIcon className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-lg line-clamp-2">{resource.title}</CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge className={`${getStatusColor(resource.status)}`}>
                  {getStatusIcon(resource.status)}
                  <span className="ml-1">{getStatusLabel(resource.status)}</span>
                </Badge>
                <Badge className={`${getCategoryColor(resource.category)}`}>
                  {getCategoryLabel(resource.category)}
                </Badge>
                <Badge className={`${getTypeColor(resource.type)}`}>
                  {getTypeLabel(resource.type)}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(resource)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(resource.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {resource.description}
        </p>
        
        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {resource.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
            {resource.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{resource.tags.length - 3} más
              </Badge>
            )}
          </div>
        )}

        {resource.fileSize && (
          <div className="text-xs text-muted-foreground mb-4">
            Tamaño: {formatFileSize(resource.fileSize)}
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 text-center mb-4">
          <div>
            <div className="text-lg font-bold text-blue-600">{resource._count.downloads}</div>
            <div className="text-xs text-muted-foreground">Descargas</div>
          </div>
          <div>
            <div className="text-lg font-bold text-red-600">{resource._count.likes}</div>
            <div className="text-xs text-muted-foreground">Me gusta</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">{resource._count.comments}</div>
            <div className="text-xs text-muted-foreground">Comentarios</div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
          <div className="flex items-center space-x-1">
            <User className="h-3 w-3" />
            <span>{resource.author.profile.firstName} {resource.author.profile.lastName}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>
              {resource.status === "PUBLISHED" && resource.publishedAt
                ? `Publicado ${formatDistanceToNow(new Date(resource.publishedAt), { addSuffix: true, locale: es })}`
                : resource.status === "SCHEDULED" && resource.scheduledAt
                ? `Programado para ${formatDistanceToNow(new Date(resource.scheduledAt), { addSuffix: true, locale: es })}`
                : `Creado ${formatDistanceToNow(new Date(resource.createdAt), { addSuffix: true, locale: es })}`
              }
            </span>
          </div>
        </div>

        <div className="flex space-x-2">
          {onView && (
            <Button variant="outline" size="sm" className="flex-1" onClick={() => onView(resource.id)}>
              <Eye className="h-4 w-4 mr-2" />
              Ver
            </Button>
          )}
          {resource.fileUrl && (
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4 mr-2" />
                Descargar
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
