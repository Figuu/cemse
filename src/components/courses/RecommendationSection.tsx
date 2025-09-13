"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, 
  TrendingUp, 
  Users, 
  Target, 
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List
} from "lucide-react";
import { RecommendationCard } from "./RecommendationCard";
import { 
  usePersonalizedRecommendations,
  usePopularRecommendations,
  useTrendingRecommendations,
  useSkillBasedRecommendations,
  CourseRecommendation
} from "@/hooks/useCourseRecommendations";

interface RecommendationSectionProps {
  title?: string;
  description?: string;
  showTabs?: boolean;
  defaultTab?: "personalized" | "popular" | "trending" | "skills";
  limit?: number;
  variant?: "default" | "compact" | "detailed";
  showViewAll?: boolean;
  onViewAll?: () => void;
  onEnroll?: (courseId: string) => void;
  onView?: (courseId: string) => void;
  onBookmark?: (courseId: string) => void;
  bookmarkedCourses?: string[];
  className?: string;
}

export function RecommendationSection({
  title = "Recomendaciones para ti",
  description = "Cursos seleccionados especialmente para ti basados en tus intereses y progreso",
  showTabs = true,
  defaultTab = "personalized",
  limit = 6,
  variant = "default",
  showViewAll = true,
  onViewAll,
  onEnroll,
  onView,
  onBookmark,
  bookmarkedCourses = [],
  className = "",
}: RecommendationSectionProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;

  // Fetch recommendations based on active tab
  const {
    recommendations: personalizedRecs,
    isLoading: personalizedLoading,
    error: personalizedError,
    refetch: refetchPersonalized,
  } = usePersonalizedRecommendations(limit);

  const {
    recommendations: popularRecs,
    isLoading: popularLoading,
    error: popularError,
    refetch: refetchPopular,
  } = usePopularRecommendations(limit);

  const {
    recommendations: trendingRecs,
    isLoading: trendingLoading,
    error: trendingError,
    refetch: refetchTrending,
  } = useTrendingRecommendations(limit);

  const {
    recommendations: skillRecs,
    isLoading: skillLoading,
    error: skillError,
    refetch: refetchSkill,
  } = useSkillBasedRecommendations(limit);

  const getCurrentRecommendations = () => {
    switch (activeTab) {
      case "personalized":
        return {
          recommendations: personalizedRecs,
          isLoading: personalizedLoading,
          error: personalizedError,
          refetch: refetchPersonalized,
        };
      case "popular":
        return {
          recommendations: popularRecs,
          isLoading: popularLoading,
          error: popularError,
          refetch: refetchPopular,
        };
      case "trending":
        return {
          recommendations: trendingRecs,
          isLoading: trendingLoading,
          error: trendingError,
          refetch: refetchTrending,
        };
      case "skills":
        return {
          recommendations: skillRecs,
          isLoading: skillLoading,
          error: skillError,
          refetch: refetchSkill,
        };
      default:
        return {
          recommendations: personalizedRecs,
          isLoading: personalizedLoading,
          error: personalizedError,
          refetch: refetchPersonalized,
        };
    }
  };

  const { recommendations, isLoading, error, refetch } = getCurrentRecommendations();

  // Pagination
  const totalPages = Math.ceil(recommendations.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRecommendations = recommendations.slice(startIndex, endIndex);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as any);
    setCurrentPage(0);
  };

  const handleRefresh = () => {
    refetch();
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case "personalized": return <Sparkles className="h-4 w-4" />;
      case "popular": return <Users className="h-4 w-4" />;
      case "trending": return <TrendingUp className="h-4 w-4" />;
      case "skills": return <Target className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case "personalized": return "Para ti";
      case "popular": return "Populares";
      case "trending": return "Tendencia";
      case "skills": return "Habilidades";
      default: return "Para ti";
    }
  };

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <div className="text-red-500 mb-4">
            <RefreshCw className="h-8 w-8 mx-auto mb-2" />
            <p className="font-medium">Error al cargar recomendaciones</p>
            <p className="text-sm text-gray-500">{error}</p>
          </div>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                {title}
              </CardTitle>
              <CardDescription className="mt-1">
                {description}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
              <div className="flex items-center gap-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {showTabs && (
            <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="personalized" className="flex items-center gap-2">
                  {getTabIcon("personalized")}
                  {getTabLabel("personalized")}
                </TabsTrigger>
                <TabsTrigger value="popular" className="flex items-center gap-2">
                  {getTabIcon("popular")}
                  {getTabLabel("popular")}
                </TabsTrigger>
                <TabsTrigger value="trending" className="flex items-center gap-2">
                  {getTabIcon("trending")}
                  {getTabLabel("trending")}
                </TabsTrigger>
                <TabsTrigger value="skills" className="flex items-center gap-2">
                  {getTabIcon("skills")}
                  {getTabLabel("skills")}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="h-32 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : recommendations.length === 0 ? (
            <div className="text-center py-8">
              <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay recomendaciones disponibles
              </h3>
              <p className="text-gray-500 mb-4">
                Completa tu perfil para obtener recomendaciones personalizadas
              </p>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
            </div>
          ) : (
            <>
              {/* Recommendations Grid/List */}
              <div className={
                viewMode === "grid" 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  : "space-y-4"
              }>
                {paginatedRecommendations.map((recommendation) => (
                  <RecommendationCard
                    key={recommendation.id}
                    recommendation={recommendation}
                    variant={viewMode === "list" ? "compact" : variant}
                    onEnroll={onEnroll}
                    onView={onView}
                    onBookmark={onBookmark}
                    isBookmarked={bookmarkedCourses.includes(recommendation.id)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-500">
                    Mostrando {startIndex + 1}-{Math.min(endIndex, recommendations.length)} de {recommendations.length} recomendaciones
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }).map((_, index) => (
                        <Button
                          key={index}
                          variant={currentPage === index ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(index)}
                          className="w-8 h-8 p-0"
                        >
                          {index + 1}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages - 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* View All Button */}
              {showViewAll && onViewAll && (
                <div className="text-center mt-6">
                  <Button onClick={onViewAll} variant="outline">
                    Ver todas las recomendaciones
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
