"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  FileText, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar,
  User,
  Tag,
  Heart,
  MessageCircle,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface NewsCardProps {
  news: {
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
      views: number;
      likes: number;
      comments: number;
    };
  };
  onEdit?: (news: any) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
  className?: string;
}

export function NewsCard({
  news,
  onEdit,
  onDelete,
  onView,
  className
}: NewsCardProps) {
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

  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={news.featuredImage} />
              <AvatarFallback>
                <FileText className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-lg line-clamp-2">{news.title}</CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge className={`${getStatusColor(news.status)}`}>
                  {getStatusIcon(news.status)}
                  <span className="ml-1">{getStatusLabel(news.status)}</span>
                </Badge>
                <Badge className={`${getCategoryColor(news.category)}`}>
                  {getCategoryLabel(news.category)}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(news)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(news.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {news.excerpt}
        </p>
        
        {news.tags && news.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {news.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
            {news.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{news.tags.length - 3} más
              </Badge>
            )}
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 text-center mb-4">
          <div>
            <div className="text-lg font-bold text-blue-600">{news._count.views}</div>
            <div className="text-xs text-muted-foreground">Vistas</div>
          </div>
          <div>
            <div className="text-lg font-bold text-red-600">{news._count.likes}</div>
            <div className="text-xs text-muted-foreground">Me gusta</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">{news._count.comments}</div>
            <div className="text-xs text-muted-foreground">Comentarios</div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
          <div className="flex items-center space-x-1">
            <User className="h-3 w-3" />
            <span>{news.author.profile.firstName} {news.author.profile.lastName}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>
              {news.status === "PUBLISHED" && news.publishedAt
                ? `Publicado ${formatDistanceToNow(new Date(news.publishedAt), { addSuffix: true, locale: es })}`
                : news.status === "SCHEDULED" && news.scheduledAt
                ? `Programado para ${formatDistanceToNow(new Date(news.scheduledAt), { addSuffix: true, locale: es })}`
                : `Creado ${formatDistanceToNow(new Date(news.createdAt), { addSuffix: true, locale: es })}`
              }
            </span>
          </div>
        </div>

        <div className="flex space-x-2">
          {onView && (
            <Button variant="outline" size="sm" className="flex-1" onClick={() => onView(news.id)}>
              <Eye className="h-4 w-4 mr-2" />
              Ver
            </Button>
          )}
          {onEdit && (
            <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(news)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
