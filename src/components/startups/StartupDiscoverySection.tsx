"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, 
  TrendingUp, 
  Building2,
  RefreshCw,
  Grid3X3,
  List,
  Filter,
  Search
} from "lucide-react";
import { StartupCard } from "./StartupCard";
import { StartupFilters, StartupFilters as FilterType } from "./StartupFilters";
import { Startup } from "@/hooks/useStartups";
import { 
  useTrendingStartups,
  useRecommendedStartups,
  useDiscoveryAnalytics
} from "@/hooks/useStartupDiscovery";

interface StartupDiscoverySectionProps {
  title?: string;
  description?: string;
  showTabs?: boolean;
  defaultTab?: "trending" | "recommendations" | "all";
  limit?: number;
  onView?: (startupId: string) => void;
  onFollow?: (startupId: string) => void;
  onBookmark?: (startupId: string) => void;
  onShare?: (startupId: string) => void;
  className?: string;
}

export function StartupDiscoverySection({
  title = "Descubre Startups",
  description = "Encuentra startups innovadoras que coincidan con tus intereses",
  showTabs = true,
  defaultTab = "trending",
  limit = 12,
  onView,
  onFollow,
  onBookmark,
  onShare,
  className = "",
}: StartupDiscoverySectionProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filters, setFilters] = useState<FilterType>({});
  const [showFilters, setShowFilters] = useState(false);

  // Fetch data based on active tab
  const {
    trendingStartups,
    isLoading: trendingLoading,
    error: trendingError,
    refetch: refetchTrending,
  } = useTrendingStartups(limit);

  const {
    recommendedStartups,
    isLoading: recommendationsLoading,
    error: recommendationsError,
    refetch: refetchRecommendations,
  } = useRecommendedStartups(limit);

  const {
    analytics,
    isLoading: analyticsLoading,
  } = useDiscoveryAnalytics();

  const getCurrentData = () => {
    switch (activeTab) {
      case "trending":
        return {
          startups: trendingStartups,
          isLoading: trendingLoading,
          error: trendingError,
          refetch: refetchTrending,
        };
      case "recommendations":
        return {
          startups: recommendedStartups,
          isLoading: recommendationsLoading,
          error: recommendationsError,
          refetch: refetchRecommendations,
        };
      default:
        return {
          startups: [...trendingStartups, ...recommendedStartups].slice(0, limit),
          isLoading: trendingLoading || recommendationsLoading,
          error: trendingError || recommendationsError,
          refetch: () => {
            refetchTrending();
            refetchRecommendations();
          },
        };
    }
  };

  const { startups, isLoading, error, refetch } = getCurrentData();

  const handleFiltersChange = (newFilters: FilterType) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({});
  };

  const handleApplyFilters = () => {
    // TODO: Implement filter application
    console.log("Applying filters:", filters);
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case "trending": return <TrendingUp className="h-4 w-4" />;
      case "recommendations": return <Sparkles className="h-4 w-4" />;
      case "all": return <Building2 className="h-4 w-4" />;
      default: return <Building2 className="h-4 w-4" />;
    }
  };

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case "trending": return "Tendencia";
      case "recommendations": return "Recomendadas";
      case "all": return "Todas";
      default: return "Todas";
    }
  };

  const getTabCount = (tab: string) => {
    switch (tab) {
      case "trending": return trendingStartups.length;
      case "recommendations": return recommendedStartups.length;
      case "all": return trendingStartups.length + recommendedStartups.length;
      default: return 0;
    }
  };

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
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={refetch}
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
          {/* Analytics Overview */}
          {analytics && !analyticsLoading && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{analytics.totalStartups}</div>
                <div className="text-sm text-muted-foreground">Total Startups</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{analytics.recentActivity}</div>
                <div className="text-sm text-muted-foreground">Nuevas esta semana</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {analytics.categoryStats[0]?.count || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  {analytics.categoryStats[0]?.name || "Categoría principal"}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {analytics.stageStats[0]?.count || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  {analytics.stageStats[0]?.name || "Etapa principal"}
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          {showFilters && (
            <div className="mb-6">
              <StartupFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onReset={handleResetFilters}
                onApply={handleApplyFilters}
                isLoading={isLoading}
              />
            </div>
          )}

          {/* Tabs */}
          {showTabs && (
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "trending" | "recommendations" | "all")} className="mb-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="trending" className="flex items-center gap-2">
                  {getTabIcon("trending")}
                  {getTabLabel("trending")}
                  <Badge variant="secondary">{getTabCount("trending")}</Badge>
                </TabsTrigger>
                <TabsTrigger value="recommendations" className="flex items-center gap-2">
                  {getTabIcon("recommendations")}
                  {getTabLabel("recommendations")}
                  <Badge variant="secondary">{getTabCount("recommendations")}</Badge>
                </TabsTrigger>
                <TabsTrigger value="all" className="flex items-center gap-2">
                  {getTabIcon("all")}
                  {getTabLabel("all")}
                  <Badge variant="secondary">{getTabCount("all")}</Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          {/* Content */}
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="h-32 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-500 mb-4">
                <Search className="h-8 w-8 mx-auto mb-2" />
                <p className="font-medium">Error al cargar startups</p>
                <p className="text-sm text-gray-500">{error}</p>
              </div>
              <Button onClick={refetch} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
            </div>
          ) : startups.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No se encontraron startups</h3>
              <p className="text-muted-foreground mb-4">
                Intenta ajustar tus filtros o explora otras categorías
              </p>
              <Button onClick={refetch} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
            </div>
          ) : (
            <div className={
              viewMode === "grid" 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                : "space-y-4"
            }>
              {startups.map((startup) => (
                <StartupCard
                  key={startup.id}
                  startup={startup as unknown as Startup}
                  variant={viewMode === "list" ? "compact" : "default"}
                  onView={onView}
                  onFollow={onFollow}
                  onBookmark={onBookmark}
                  onShare={onShare}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
