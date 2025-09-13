"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  MapPin, 
  Users, 
  DollarSign,
  Calendar,
  Globe,
  Heart,
  MessageCircle,
  Eye,
  Share2,
  MoreVertical
} from "lucide-react";
import { Startup } from "@/hooks/useStartups";

interface StartupCardProps {
  startup: Startup;
  onView?: (startupId: string) => void;
  onFollow?: (startupId: string) => void;
  onBookmark?: (startupId: string) => void;
  onShare?: (startupId: string) => void;
  isFollowing?: boolean;
  isBookmarked?: boolean;
  variant?: "default" | "compact" | "detailed";
  showActions?: boolean;
}

export function StartupCard({
  startup,
  onView,
  onFollow,
  onBookmark,
  onShare,
  isFollowing = false,
  isBookmarked = false,
  variant = "default",
  showActions = true,
}: StartupCardProps) {
  const [isFollowingState, setIsFollowingState] = useState(isFollowing);
  const [isBookmarkedState, setIsBookmarkedState] = useState(isBookmarked);

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "IDEA":
        return "bg-blue-100 text-blue-800";
      case "STARTUP":
        return "bg-yellow-100 text-yellow-800";
      case "GROWING":
        return "bg-green-100 text-green-800";
      case "ESTABLISHED":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStageText = (stage: string) => {
    switch (stage) {
      case "IDEA":
        return "Idea";
      case "STARTUP":
        return "Startup";
      case "GROWING":
        return "Creciendo";
      case "ESTABLISHED":
        return "Establecida";
      default:
        return stage;
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount || amount === 0) return "Sin financiamiento";
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No especificada";
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
    });
  };

  const handleFollow = () => {
    if (onFollow) {
      onFollow(startup.id);
      setIsFollowingState(!isFollowingState);
    }
  };

  const handleBookmark = () => {
    if (onBookmark) {
      onBookmark(startup.id);
      setIsBookmarkedState(!isBookmarkedState);
    }
  };

  if (variant === "compact") {
    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onView?.(startup.id)}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                {startup.logo ? (
                  <img src={startup.logo} alt={startup.name} className="w-8 h-8 rounded" />
                ) : (
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">{startup.name}</h3>
                <p className="text-xs text-muted-foreground truncate">{startup.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={`text-xs ${getStageColor(startup.businessStage)}`}>
                    {getStageText(startup.businessStage)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{startup.category}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <div className="text-xs text-muted-foreground">
                {startup.viewsCount} vistas
              </div>
              {showActions && (
                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onView?.(startup.id); }}>
                  <Eye className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === "detailed") {
    return (
      <Card className="hover:shadow-lg transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                {startup.logo ? (
                  <img src={startup.logo} alt={startup.name} className="w-12 h-12 rounded" />
                ) : (
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-xl">{startup.name}</CardTitle>
                <CardDescription className="text-sm">
                  por {startup.owner.firstName} {startup.owner.lastName}
                </CardDescription>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={getStageColor(startup.businessStage)}>
                    {getStageText(startup.businessStage)}
                  </Badge>
                  <Badge variant="outline">{startup.category}</Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBookmark}
                className={isBookmarkedState ? "text-red-500" : ""}
              >
                <Heart className={`h-4 w-4 ${isBookmarkedState ? "fill-current" : ""}`} />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onShare?.(startup.id)}>
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-3">
            {startup.description}
          </p>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">Ubicación</span>
              </div>
              <div className="font-semibold text-sm">{startup.municipality}</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                <Users className="h-4 w-4" />
                <span className="text-sm">Equipo</span>
              </div>
              <div className="font-semibold text-sm">{startup.employees || "N/A"}</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm">Ingresos</span>
              </div>
              <div className="font-semibold text-sm">{formatCurrency(startup.annualRevenue)}</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Fundada</span>
              </div>
              <div className="font-semibold text-sm">{formatDate(startup.founded)}</div>
            </div>
          </div>

          {/* Social Media Links */}
          {startup.socialMedia && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Redes:</span>
              {startup.website && (
                <Button variant="outline" size="sm" asChild>
                  <a href={startup.website} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-3 w-3 mr-1" />
                    Web
                  </a>
                </Button>
              )}
              {startup.socialMedia.linkedin && (
                <Button variant="outline" size="sm" asChild>
                  <a href={startup.socialMedia.linkedin} target="_blank" rel="noopener noreferrer">
                    LinkedIn
                  </a>
                </Button>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {startup.viewsCount} vistas
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                {startup.reviewsCount} reseñas
              </div>
            </div>
            {startup.rating && (
              <div className="flex items-center gap-1">
                <span className="font-semibold">{startup.rating.toFixed(1)}</span>
                <span>★</span>
              </div>
            )}
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex gap-2">
              <Button 
                onClick={() => onView?.(startup.id)} 
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver Detalles
              </Button>
              <Button 
                variant={isFollowingState ? "outline" : "default"}
                onClick={handleFollow}
                className="flex-1"
              >
                {isFollowingState ? "Siguiendo" : "Seguir"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
              {startup.logo ? (
                <img src={startup.logo} alt={startup.name} className="w-8 h-8 rounded" />
              ) : (
                <Building2 className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg line-clamp-1">{startup.name}</CardTitle>
              <CardDescription className="text-sm">
                por {startup.owner.firstName} {startup.owner.lastName}
              </CardDescription>
            </div>
          </div>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmark}
              className={isBookmarkedState ? "text-red-500" : ""}
            >
              <Heart className={`h-4 w-4 ${isBookmarkedState ? "fill-current" : ""}`} />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onShare?.(startup.id)}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {startup.description}
        </p>
        
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              {startup.municipality}
            </div>
            <Badge className={getStageColor(startup.businessStage)}>
              {getStageText(startup.businessStage)}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Industria: {startup.category}</span>
            <span>Equipo: {startup.employees || "N/A"}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Ingresos: {formatCurrency(startup.annualRevenue)}</span>
            <span>Fundada: {formatDate(startup.founded)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              {startup.viewsCount} vistas
            </div>
            <div className="flex items-center">
              <MessageCircle className="h-4 w-4 mr-1" />
              {startup.reviewsCount} reseñas
            </div>
          </div>
        </div>

        {showActions && (
          <div className="flex space-x-2">
            <Button size="sm" className="flex-1" onClick={() => onView?.(startup.id)}>
              <Eye className="h-4 w-4 mr-2" />
              Ver Detalles
            </Button>
            <Button 
              size="sm" 
              variant={isFollowingState ? "outline" : "default"}
              onClick={handleFollow}
              className="flex-1"
            >
              {isFollowingState ? "Siguiendo" : "Seguir"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
