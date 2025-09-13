"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Star, 
  Users, 
  BookOpen, 
  Clock, 
  TrendingUp, 
  Download,
  Eye,
  Bookmark,
  BookmarkCheck
} from "lucide-react";
import { CourseRecommendation } from "@/hooks/useCourseRecommendations";
import { useRouter } from "next/navigation";

interface RecommendationCardProps {
  recommendation: CourseRecommendation;
  onEnroll?: (courseId: string) => void;
  onView?: (courseId: string) => void;
  onBookmark?: (courseId: string) => void;
  isBookmarked?: boolean;
  showActions?: boolean;
  variant?: "default" | "compact" | "detailed";
}

export function RecommendationCard({
  recommendation,
  onEnroll,
  onView,
  onBookmark,
  isBookmarked = false,
  showActions = true,
  variant = "default",
}: RecommendationCardProps) {
  const router = useRouter();
  const [isEnrolling, setIsEnrolling] = useState(false);

  const handleEnroll = async () => {
    if (!onEnroll) return;
    
    setIsEnrolling(true);
    try {
      await onEnroll(recommendation.id);
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleView = () => {
    if (onView) {
      onView(recommendation.id);
    } else {
      router.push(`/courses/${recommendation.id}`);
    }
  };

  const handleBookmark = () => {
    if (onBookmark) {
      onBookmark(recommendation.id);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "BEGINNER": return "bg-green-100 text-green-800";
      case "INTERMEDIATE": return "bg-yellow-100 text-yellow-800";
      case "ADVANCED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRecommendationIcon = (reason: string) => {
    if (reason.includes("habilidades")) return "🎯";
    if (reason.includes("popular")) return "🔥";
    if (reason.includes("similar")) return "🔗";
    if (reason.includes("tendencia")) return "📈";
    if (reason.includes("estudiantes")) return "👥";
    return "✨";
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  if (variant === "compact") {
    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleView}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{getRecommendationIcon(recommendation.recommendationReason)}</span>
                <h3 className="font-semibold text-sm truncate">{recommendation.title}</h3>
                <Badge className={`text-xs ${getLevelColor(recommendation.level)}`}>
                  {recommendation.level}
                </Badge>
              </div>
              <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                {recommendation.description}
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {recommendation.stats.totalStudents}
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  {recommendation.stats.totalModules}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  {recommendation.rating.toFixed(1)}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className={`text-xs font-semibold ${getScoreColor(recommendation.recommendationScore)}`}>
                {Math.round(recommendation.recommendationScore)}%
              </div>
              {showActions && (
                <Button size="sm" variant="outline" onClick={handleView}>
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
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{getRecommendationIcon(recommendation.recommendationReason)}</span>
                <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                <Badge className={getLevelColor(recommendation.level)}>
                  {recommendation.level}
                </Badge>
              </div>
              <CardDescription className="text-sm">
                {recommendation.description}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className={`text-right ${getScoreColor(recommendation.recommendationScore)}`}>
                <div className="text-2xl font-bold">
                  {Math.round(recommendation.recommendationScore)}%
                </div>
                <div className="text-xs text-gray-500">Recomendación</div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Recommendation Reason */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>¿Por qué te recomendamos este curso?</strong><br />
              {recommendation.recommendationReason}
            </p>
          </div>

          {/* Course Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                <Users className="h-4 w-4" />
                <span className="text-sm">Estudiantes</span>
              </div>
              <div className="font-semibold">{recommendation.stats.totalStudents}</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                <BookOpen className="h-4 w-4" />
                <span className="text-sm">Módulos</span>
              </div>
              <div className="font-semibold">{recommendation.stats.totalModules}</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Duración</span>
              </div>
              <div className="font-semibold">{recommendation.duration}h</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                <Star className="h-4 w-4" />
                <span className="text-sm">Rating</span>
              </div>
              <div className="font-semibold">{recommendation.rating.toFixed(1)}</div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {recommendation.tags.slice(0, 5).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {recommendation.tags.length > 5 && (
              <Badge variant="outline" className="text-xs">
                +{recommendation.tags.length - 5} más
              </Badge>
            )}
          </div>

          {/* Instructor Info */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Instructor:</span>
            <span className="font-medium">{recommendation.instructor.name}</span>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex gap-2 pt-2">
              <Button 
                onClick={handleEnroll} 
                disabled={isEnrolling}
                className="flex-1"
              >
                {isEnrolling ? "Inscribiéndose..." : "Inscribirse"}
              </Button>
              <Button variant="outline" onClick={handleView}>
                <Eye className="h-4 w-4 mr-2" />
                Ver Detalles
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleBookmark}
              >
                {isBookmarked ? (
                  <BookmarkCheck className="h-4 w-4" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{getRecommendationIcon(recommendation.recommendationReason)}</span>
              <CardTitle className="text-base truncate">{recommendation.title}</CardTitle>
            </div>
            <CardDescription className="text-sm line-clamp-2">
              {recommendation.description}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getLevelColor(recommendation.level)}>
              {recommendation.level}
            </Badge>
            <div className={`text-right ${getScoreColor(recommendation.recommendationScore)}`}>
              <div className="text-lg font-bold">
                {Math.round(recommendation.recommendationScore)}%
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Recommendation Reason */}
        <div className="bg-gray-50 p-2 rounded text-xs text-gray-700">
          {recommendation.recommendationReason}
        </div>

        {/* Course Stats */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {recommendation.stats.totalStudents}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              {recommendation.stats.totalModules}
            </span>
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4" />
              {recommendation.rating.toFixed(1)}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            {recommendation.duration}h
          </span>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={handleEnroll} 
              disabled={isEnrolling}
              className="flex-1"
            >
              {isEnrolling ? "Inscribiéndose..." : "Inscribirse"}
            </Button>
            <Button size="sm" variant="outline" onClick={handleView}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleBookmark}
            >
              {isBookmarked ? (
                <BookmarkCheck className="h-4 w-4" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
