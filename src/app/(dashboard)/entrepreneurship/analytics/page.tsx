"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Eye, 
  Heart, 
  MessageCircle, 
  Share2,
  ArrowLeft,
  BarChart3,
  Target,
  Award
} from "lucide-react";
import { useEntrepreneurshipPosts } from "@/hooks/useEntrepreneurshipPosts";
import { PostEngagementService } from "@/lib/postEngagementService";
import { EnhancedPostCard } from "@/components/entrepreneurship/EnhancedPostCard";
import Link from "next/link";

export default function PostAnalyticsPage() {

  // Mock current user - in real app, this would come from auth context
  const currentUserId = "user-1";

  // Fetch user's posts
  const { posts, isLoading } = useEntrepreneurshipPosts({
    authorId: currentUserId,
    limit: 50,
  });

  // Calculate analytics
  const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0);
  const totalLikes = posts.reduce((sum, post) => sum + post.likes, 0);
  const totalComments = posts.reduce((sum, post) => sum + post.comments, 0);
  const totalShares = posts.reduce((sum, post) => sum + post.shares, 0);
  const totalEngagement = totalLikes + totalComments + totalShares;
  const averageEngagementRate = totalViews > 0 ? (totalEngagement / totalViews) * 100 : 0;

  // Get top performing posts
  const topPosts = [...posts].sort((a, b) => {
    const aEngagement = a.likes + a.comments + a.shares;
    const bEngagement = b.likes + b.comments + b.shares;
    return bEngagement - aEngagement;
  }).slice(0, 5);

  // Get engagement level distribution
  const engagementLevels = posts.reduce((acc, post) => {
    const engagementRate = PostEngagementService.calculateEngagementRate(
      post.views || 0,
      post.likes,
      post.comments,
      post.shares
    );
    const level = PostEngagementService.getEngagementLevel(engagementRate);
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get post type performance
  const postTypePerformance = posts.reduce((acc, post) => {
    if (!acc[post.type]) {
      acc[post.type] = { count: 0, totalEngagement: 0, totalViews: 0 };
    }
    acc[post.type].count++;
    acc[post.type].totalEngagement += post.likes + post.comments + post.shares;
    acc[post.type].totalViews += post.views || 0;
    return acc;
  }, {} as Record<string, { count: number; totalEngagement: number; totalViews: number }>);

  const getEngagementLevelColor = (level: string) => {
    switch (level) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'high': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEngagementLevelLabel = (level: string) => {
    switch (level) {
      case 'excellent': return 'Excelente';
      case 'high': return 'Alto';
      case 'medium': return 'Medio';
      case 'low': return 'Bajo';
      default: return 'Desconocido';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/entrepreneurship">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            Analytics de Posts
          </h1>
          <p className="text-muted-foreground">
            Analiza el rendimiento de tus publicaciones y optimiza tu contenido
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Total Vistas</span>
            </div>
            <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">
              {posts.length} publicaciones
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">Total Likes</span>
            </div>
            <p className="text-2xl font-bold">{totalLikes.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">
              {totalViews > 0 ? ((totalLikes / totalViews) * 100).toFixed(1) : 0}% de vistas
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Total Comentarios</span>
            </div>
            <p className="text-2xl font-bold">{totalComments.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">
              {totalViews > 0 ? ((totalComments / totalViews) * 100).toFixed(1) : 0}% de vistas
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Share2 className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Total Compartidos</span>
            </div>
            <p className="text-2xl font-bold">{totalShares.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">
              {totalViews > 0 ? ((totalShares / totalViews) * 100).toFixed(1) : 0}% de vistas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Tasa de Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                {averageEngagementRate.toFixed(1)}%
              </div>
              <div className="w-full bg-muted rounded-full h-2 mb-4">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(averageEngagementRate, 100)}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Promedio de interacciones por vista
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Distribución de Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(engagementLevels).map(([level, count]) => (
                <div key={level} className="flex items-center justify-between">
                  <Badge className={`${getEngagementLevelColor(level)}`}>
                    {getEngagementLevelLabel(level)}
                  </Badge>
                  <span className="text-sm font-medium">{count} posts</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Post Type Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Rendimiento por Tipo de Post
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(postTypePerformance).map(([type, data]) => {
              const avgEngagement = data.count > 0 ? data.totalEngagement / data.count : 0;
              const avgViews = data.count > 0 ? data.totalViews / data.count : 0;
              const engagementRate = avgViews > 0 ? (avgEngagement / avgViews) * 100 : 0;
              
              return (
                <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium capitalize">{type.toLowerCase()}</h4>
                    <p className="text-sm text-muted-foreground">
                      {data.count} posts • {avgViews.toFixed(0)} vistas promedio
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{avgEngagement.toFixed(0)}</p>
                    <p className="text-sm text-muted-foreground">
                      {engagementRate.toFixed(1)}% engagement
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Posts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Posts con Mejor Rendimiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-muted rounded-full"></div>
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-muted rounded w-32"></div>
                          <div className="h-3 bg-muted rounded w-24"></div>
                        </div>
                        <div className="h-8 bg-muted rounded w-20"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : topPosts.length > 0 ? (
              topPosts.map((post, index) => (
                <div key={post.id} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-muted-foreground">
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <EnhancedPostCard
                      post={post}
                      currentUserId={currentUserId}
                      variant="compact"
                      showAnalytics={true}
                    />
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">
                      {post.likes + post.comments + post.shares}
                    </p>
                    <p className="text-sm text-muted-foreground">interacciones</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay posts para analizar</h3>
                <p className="text-muted-foreground">
                  Crea tu primera publicación para ver analytics
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
