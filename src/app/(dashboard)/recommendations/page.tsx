"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Sparkles, 
  Search, 
  Filter, 
  RefreshCw,
  TrendingUp,
  Users,
  Target,
  BookOpen,
  Star,
  Clock
} from "lucide-react";
import { RecommendationSection } from "@/components/courses/RecommendationSection";
import { RecommendationCard } from "@/components/courses/RecommendationCard";
import { 
  usePersonalizedRecommendations,
  usePopularRecommendations,
  useTrendingRecommendations,
  useSkillBasedRecommendations,
  CourseRecommendation
} from "@/hooks/useCourseRecommendations";
import { useRouter } from "next/navigation";

export default function RecommendationsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("score");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState("personalized");

  // Fetch all types of recommendations
  const {
    recommendations: personalizedRecs,
    isLoading: personalizedLoading,
    error: personalizedError,
    refetch: refetchPersonalized,
  } = usePersonalizedRecommendations(20);

  const {
    recommendations: popularRecs,
    isLoading: popularLoading,
    error: popularError,
    refetch: refetchPopular,
  } = usePopularRecommendations(20);

  const {
    recommendations: trendingRecs,
    isLoading: trendingLoading,
    error: trendingError,
    refetch: refetchTrending,
  } = useTrendingRecommendations(20);

  const {
    recommendations: skillRecs,
    isLoading: skillLoading,
    error: skillError,
    refetch: refetchSkill,
  } = useSkillBasedRecommendations(20);

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

  // Filter and sort recommendations
  const filteredRecommendations = recommendations.filter(rec => {
    const matchesSearch = searchTerm === "" || 
      rec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLevel = selectedLevel === "all" || rec.level === selectedLevel;
    const matchesCategory = selectedCategory === "all" || rec.category === selectedCategory;
    
    return matchesSearch && matchesLevel && matchesCategory;
  });

  const sortedRecommendations = [...filteredRecommendations].sort((a, b) => {
    switch (sortBy) {
      case "score":
        return b.recommendationScore - a.recommendationScore;
      case "rating":
        return b.rating - a.rating;
      case "students":
        return b.stats.totalStudents - a.stats.totalStudents;
      case "duration":
        return a.duration - b.duration;
      case "title":
        return a.title.localeCompare(b.title);
      default:
        return b.recommendationScore - a.recommendationScore;
    }
  });

  const handleEnroll = async (courseId: string) => {
    // TODO: Implement enrollment logic
    console.log("Enrolling in course:", courseId);
  };

  const handleView = (courseId: string) => {
    router.push(`/courses/${courseId}`);
  };

  const handleBookmark = (courseId: string) => {
    // TODO: Implement bookmark logic
    console.log("Bookmarking course:", courseId);
  };

  const handleRefresh = () => {
    refetch();
  };

  const getTabStats = () => {
    const stats = {
      personalized: { count: personalizedRecs.length, loading: personalizedLoading },
      popular: { count: popularRecs.length, loading: popularLoading },
      trending: { count: trendingRecs.length, loading: trendingLoading },
      skills: { count: skillRecs.length, loading: skillLoading },
    };
    return stats[activeTab as keyof typeof stats];
  };

  const tabStats = getTabStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recomendaciones</h1>
          <p className="text-muted-foreground">
            Descubre cursos personalizados basados en tus intereses y progreso
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Personalizadas</p>
                <p className="text-2xl font-bold">{personalizedRecs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Populares</p>
                <p className="text-2xl font-bold">{popularRecs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Tendencia</p>
                <p className="text-2xl font-bold">{trendingRecs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Habilidades</p>
                <p className="text-2xl font-bold">{skillRecs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar en recomendaciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Nivel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="BEGINNER">Principiante</SelectItem>
                  <SelectItem value="INTERMEDIATE">Intermedio</SelectItem>
                  <SelectItem value="ADVANCED">Avanzado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="TECHNOLOGY">Tecnología</SelectItem>
                  <SelectItem value="BUSINESS">Negocios</SelectItem>
                  <SelectItem value="DESIGN">Diseño</SelectItem>
                  <SelectItem value="MARKETING">Marketing</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score">Relevancia</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="students">Estudiantes</SelectItem>
                  <SelectItem value="duration">Duración</SelectItem>
                  <SelectItem value="title">Título</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personalized" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Para ti
            {tabStats.loading && <RefreshCw className="h-3 w-3 animate-spin" />}
          </TabsTrigger>
          <TabsTrigger value="popular" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Populares
            {tabStats.loading && <RefreshCw className="h-3 w-3 animate-spin" />}
          </TabsTrigger>
          <TabsTrigger value="trending" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Tendencia
            {tabStats.loading && <RefreshCw className="h-3 w-3 animate-spin" />}
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Habilidades
            {tabStats.loading && <RefreshCw className="h-3 w-3 animate-spin" />}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personalized" className="space-y-4">
          <RecommendationSection
            title="Recomendaciones personalizadas"
            description="Cursos seleccionados especialmente para ti basados en tu perfil y progreso"
            showTabs={false}
            limit={20}
            variant={viewMode === "list" ? "compact" : "default"}
            onEnroll={handleEnroll}
            onView={handleView}
            onBookmark={handleBookmark}
          />
        </TabsContent>

        <TabsContent value="popular" className="space-y-4">
          <RecommendationSection
            title="Cursos populares"
            description="Los cursos más populares entre todos los estudiantes"
            showTabs={false}
            limit={20}
            variant={viewMode === "list" ? "compact" : "default"}
            onEnroll={handleEnroll}
            onView={handleView}
            onBookmark={handleBookmark}
          />
        </TabsContent>

        <TabsContent value="trending" className="space-y-4">
          <RecommendationSection
            title="Tendencias"
            description="Cursos con mayor crecimiento en inscripciones recientes"
            showTabs={false}
            limit={20}
            variant={viewMode === "list" ? "compact" : "default"}
            onEnroll={handleEnroll}
            onView={handleView}
            onBookmark={handleBookmark}
          />
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          <RecommendationSection
            title="Basados en habilidades"
            description="Cursos que coinciden con las habilidades de tu perfil"
            showTabs={false}
            limit={20}
            variant={viewMode === "list" ? "compact" : "default"}
            onEnroll={handleEnroll}
            onView={handleView}
            onBookmark={handleBookmark}
          />
        </TabsContent>
      </Tabs>

      {/* Results Summary */}
      {!isLoading && filteredRecommendations.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Mostrando {filteredRecommendations.length} de {recommendations.length} recomendaciones
                {searchTerm && ` para "${searchTerm}"`}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <BookOpen className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <Clock className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
