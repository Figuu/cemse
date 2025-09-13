"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Eye, 
  TrendingUp, 
  TrendingDown,
  Users,
  Clock,
  Target
} from "lucide-react";
import { EntrepreneurshipPost } from "@/hooks/useEntrepreneurshipPosts";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface PostAnalyticsProps {
  post: EntrepreneurshipPost;
  showDetailed?: boolean;
  showComparison?: boolean;
  previousPost?: EntrepreneurshipPost;
}

export function PostAnalytics({ 
  post, 
  showDetailed = false,
  showComparison = false,
  previousPost 
}: PostAnalyticsProps) {
  const totalEngagement = post.likes + post.comments + post.shares;
  const engagementRate = ((totalEngagement / Math.max(post.views || 1, 1)) * 100);
  const timeSincePosted = formatDistanceToNow(new Date(post.createdAt), { 
    addSuffix: true, 
    locale: es 
  });

  const getEngagementLevel = () => {
    if (engagementRate >= 10) return { level: "Excelente", color: "bg-green-100 text-green-800" };
    if (engagementRate >= 5) return { level: "Bueno", color: "bg-blue-100 text-blue-800" };
    if (engagementRate >= 2) return { level: "Regular", color: "bg-yellow-100 text-yellow-800" };
    return { level: "Bajo", color: "bg-red-100 text-red-800" };
  };

  const engagementLevel = getEngagementLevel();

  const getComparisonData = () => {
    if (!previousPost || !showComparison) return null;

    const currentEngagement = totalEngagement;
    const previousEngagement = previousPost.likes + previousPost.comments + previousPost.shares;
    const engagementChange = ((currentEngagement - previousEngagement) / Math.max(previousEngagement, 1)) * 100;

    return {
      engagementChange,
      isPositive: engagementChange > 0,
      changeText: engagementChange > 0 ? `+${engagementChange.toFixed(1)}%` : `${engagementChange.toFixed(1)}%`
    };
  };

  const comparison = getComparisonData();

  if (!showDetailed) {
    return (
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Eye className="h-4 w-4" />
          <span>{post.views || 0}</span>
        </div>
        <div className="flex items-center gap-1">
          <Heart className="h-4 w-4" />
          <span>{post.likes}</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageCircle className="h-4 w-4" />
          <span>{post.comments}</span>
        </div>
        <div className="flex items-center gap-1">
          <Share2 className="h-4 w-4" />
          <span>{post.shares}</span>
        </div>
        <Badge variant="outline" className={`text-xs ${engagementLevel.color}`}>
          {engagementLevel.level}
        </Badge>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Análisis de Engagement
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Engagement Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Eye className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Vistas</span>
            </div>
            <p className="text-2xl font-bold">{post.views || 0}</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Heart className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">Likes</span>
            </div>
            <p className="text-2xl font-bold">{post.likes}</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <MessageCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Comentarios</span>
            </div>
            <p className="text-2xl font-bold">{post.comments}</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Share2 className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Compartidos</span>
            </div>
            <p className="text-2xl font-bold">{post.shares}</p>
          </div>
        </div>

        {/* Engagement Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Tasa de Engagement</span>
            <Badge className={`${engagementLevel.color}`}>
              {engagementLevel.level}
            </Badge>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(engagementRate, 100)}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {engagementRate.toFixed(1)}% de las personas que vieron el post interactuaron
          </p>
        </div>

        {/* Comparison */}
        {comparison && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Comparación con post anterior</span>
              <div className="flex items-center gap-1">
                {comparison.isPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span className={`text-sm font-medium ${comparison.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {comparison.changeText}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Post Performance */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Rendimiento del Post</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Tiempo desde publicación</span>
              <span>{timeSincePosted}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total de interacciones</span>
              <span className="font-medium">{totalEngagement}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Promedio de interacciones por hora</span>
              <span>{((totalEngagement / Math.max((Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60), 1))).toFixed(1)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Estado</span>
              <div className="flex items-center gap-1">
                {post.isPinned && (
                  <Badge variant="secondary" className="text-xs">
                    Destacado
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  {post.type}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Recomendaciones</h4>
          <div className="space-y-1">
            {engagementRate < 2 && (
              <p className="text-xs text-muted-foreground">
                💡 Considera agregar más hashtags o hacer preguntas para aumentar la interacción
              </p>
            )}
            {post.comments === 0 && (
              <p className="text-xs text-muted-foreground">
                💡 Haz una pregunta o pide opiniones para generar comentarios
              </p>
            )}
            {post.shares === 0 && (
              <p className="text-xs text-muted-foreground">
                💡 Comparte contenido valioso o inspirador para aumentar las comparticiones
              </p>
            )}
            {engagementRate >= 10 && (
              <p className="text-xs text-muted-foreground">
                🎉 ¡Excelente engagement! Considera crear contenido similar
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
