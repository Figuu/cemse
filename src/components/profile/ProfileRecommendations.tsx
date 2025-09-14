"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  Star, 
  MapPin, 
  Briefcase, 
  Eye,
  MessageCircle,
  Heart,
  TrendingUp,
  Clock,
  Award
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { useSession } from "next-auth/react";

interface RecommendedProfile {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  title: string;
  location: string;
  experience: string;
  skills: string[];
  rating: number;
  views: number;
  isVerified: boolean;
  isAvailable: boolean;
  lastActive: string;
  matchScore: number;
  reason: string;
}

interface ProfileRecommendationsProps {
  className?: string;
}

export function ProfileRecommendations({ className }: ProfileRecommendationsProps) {
  const { data: session } = useSession();
  const [recommendations, setRecommendations] = useState<RecommendedProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/profiles/recommendations?userId=${session.user.id}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch recommendations");
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Activo ahora";
    if (diffInHours < 24) return `Activo hace ${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `Activo hace ${diffInDays}d`;
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-blue-600 bg-blue-100";
  };

  const getReasonIcon = (reason: string) => {
    switch (reason.toLowerCase()) {
      case "skills":
        return <Award className="h-4 w-4" />;
      case "location":
        return <MapPin className="h-4 w-4" />;
      case "experience":
        return <Briefcase className="h-4 w-4" />;
      case "trending":
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Recomendaciones para ti
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Recomendaciones para ti
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" onClick={fetchRecommendations}>
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Recomendaciones para ti
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay recomendaciones disponibles</h3>
            <p className="text-muted-foreground">
              Completa tu perfil para obtener recomendaciones personalizadas
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Recomendaciones para ti
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((profile) => (
          <div
            key={profile.id}
            className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <Avatar className="h-12 w-12">
              <AvatarImage src={profile.avatarUrl} alt={`${profile.firstName} ${profile.lastName}`} />
              <AvatarFallback>
                {getInitials(profile.firstName, profile.lastName)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-semibold truncate">
                  {profile.firstName} {profile.lastName}
                </h4>
                {profile.isVerified && (
                  <Badge variant="secondary" className="text-xs">
                    Verificado
                  </Badge>
                )}
                <Badge 
                  variant="outline" 
                  className={cn("text-xs", getMatchScoreColor(profile.matchScore))}
                >
                  {profile.matchScore}% match
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground truncate mb-1">
                {profile.title}
              </p>
              
              <div className="flex items-center space-x-3 text-xs text-muted-foreground mb-2">
                <div className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  {profile.location}
                </div>
                <div className="flex items-center">
                  <Briefcase className="h-3 w-3 mr-1" />
                  {profile.experience}
                </div>
                <div className="flex items-center">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                  {profile.rating}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex items-center text-xs text-muted-foreground">
                  {getReasonIcon(profile.reason)}
                  <span className="ml-1">Recomendado por: {profile.reason}</span>
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatLastActive(profile.lastActive)}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end space-y-2">
              <div className="text-right text-xs text-muted-foreground">
                {profile.views} vistas
              </div>
              <div className="flex space-x-1">
                <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                  <MessageCircle className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        
        <div className="pt-4 border-t">
          <Button variant="outline" className="w-full">
            Ver todas las recomendaciones
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

