"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ExternalLink, 
  Eye,
  Heart,
  Calendar,
  User,
  Globe
} from "lucide-react";
import { EntrepreneurshipNews } from "@/hooks/useEntrepreneurshipNews";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface NewsCardProps {
  news: EntrepreneurshipNews;
  variant?: "default" | "featured" | "compact";
  onView?: (news: EntrepreneurshipNews) => void;
  onLike?: (newsId: string) => void;
  onShare?: (newsId: string) => void;
}

export function NewsCard({ 
  news, 
  variant = "default", 
  onView, 
  onLike, 
  onShare 
}: NewsCardProps) {
  const handleView = () => {
    if (onView) {
      onView(news);
    } else if (news.sourceUrl) {
      window.open(news.sourceUrl, "_blank");
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLike) {
      onLike(news.id);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShare) {
      onShare(news.id);
    }
  };

  if (variant === "compact") {
    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleView}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {news.imageUrl && (
              <div className="flex-shrink-0">
                <img
                  src={news.imageUrl}
                  alt={news.title}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                {news.title}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {news.summary}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary" className="text-xs">
                  {news.category}
                </Badge>
                {news.sourceName && (
                  <>
                    <span>•</span>
                    <span>{news.sourceName}</span>
                  </>
                )}
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
        {news.imageUrl && (
          <div className="aspect-video overflow-hidden rounded-t-lg">
            <img
              src={news.imageUrl}
              alt={news.title}
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
                  {news.category}
                </Badge>
              </div>
              <CardTitle className="text-lg line-clamp-2">
                {news.title}
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
            {news.summary}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{news.views}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                <span>{news.likes}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {formatDistanceToNow(
                    new Date(news.publishedAt || news.createdAt), 
                    { addSuffix: true, locale: es }
                  )}
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
                {news.category}
              </Badge>
              {news.sourceName && (
                <Badge variant="outline" className="text-xs">
                  {news.sourceName}
                </Badge>
              )}
            </div>
            <CardTitle className="text-base line-clamp-2">
              {news.title}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {news.summary}
        </p>
        
        {news.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {news.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
            {news.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{news.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{news.views}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              <span>{news.likes}</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{news.author.name}</span>
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
