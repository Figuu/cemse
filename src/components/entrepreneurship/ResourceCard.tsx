"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ExternalLink, 
  FileText, 
  Play, 
  Headphones, 
  Wrench, 
  BookOpen, 
  BarChart3,
  Eye,
  Heart,
  Calendar,
  CheckSquare,
  Video,
  GraduationCap
} from "lucide-react";
import { EntrepreneurshipResource, ResourceType } from "@/hooks/useEntrepreneurshipResources";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface ResourceCardProps {
  resource: EntrepreneurshipResource;
  variant?: "default" | "featured" | "compact";
  onView?: (resource: EntrepreneurshipResource) => void;
  onLike?: (resourceId: string) => void;
  onShare?: (resourceId: string) => void;
}

const resourceTypeIcons: Record<ResourceType, any> = {
  ARTICLE: FileText,
  VIDEO: Play,
  AUDIO: Headphones,
  DOCUMENT: FileText,
  TOOL: Wrench,
  TEMPLATE: BookOpen,
  GUIDE: BookOpen,
  CHECKLIST: CheckSquare,
  WEBINAR: Video,
  COURSE: GraduationCap,
};

const resourceTypeLabels: Record<ResourceType, string> = {
  ARTICLE: "Artículo",
  VIDEO: "Video",
  AUDIO: "Audio",
  DOCUMENT: "Documento",
  TOOL: "Herramienta",
  TEMPLATE: "Plantilla",
  GUIDE: "Guía",
  CHECKLIST: "Lista de Verificación",
  WEBINAR: "Webinar",
  COURSE: "Curso",
};

export function ResourceCard({ 
  resource, 
  variant = "default", 
  onView, 
  onLike, 
  onShare 
}: ResourceCardProps) {
  const IconComponent = resourceTypeIcons[resource.type];
  const typeLabel = resourceTypeLabels[resource.type];

  const handleView = () => {
    if (onView) {
      onView(resource);
    } else if (resource.url) {
      window.open(resource.url, "_blank");
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLike) {
      onLike(resource.id);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShare) {
      onShare(resource.id);
    }
  };

  if (variant === "compact") {
    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleView}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <IconComponent className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                {resource.title}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {resource.description}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary" className="text-xs">
                  {typeLabel}
                </Badge>
                <span>•</span>
                <span>{resource.category}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === "featured") {
    return (
      <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={handleView}>
        {resource.imageUrl && (
          <div className="aspect-video overflow-hidden rounded-t-lg">
            <img
              src={resource.imageUrl}
              alt={resource.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="default" className="text-xs">
                  Destacado
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {typeLabel}
                </Badge>
              </div>
              <CardTitle className="text-lg line-clamp-2">
                {resource.title}
              </CardTitle>
            </div>
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <IconComponent className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
            {resource.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{resource.views}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                <span>{resource.likes}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {formatDistanceToNow(new Date(resource.createdAt), { 
                    addSuffix: true, 
                    locale: es 
                  })}
                </span>
              </div>
            </div>
            <Button size="sm" variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={handleView}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                {typeLabel}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {resource.category}
              </Badge>
            </div>
            <CardTitle className="text-base line-clamp-2">
              {resource.title}
            </CardTitle>
          </div>
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <IconComponent className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {resource.description}
        </p>
        
        {resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {resource.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
            {resource.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{resource.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{resource.views}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              <span>{resource.likes}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleLike}
              className="h-8 w-8 p-0"
            >
              <Heart className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleShare}
              className="h-8 w-8 p-0"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
