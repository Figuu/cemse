"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Filter, 
  TrendingUp, 
  Sparkles, 
  Building2,
  MapPin,
  Star,
  Users,
  RefreshCw,
  Grid3X3,
  List,
  BarChart3
} from "lucide-react";
import { StartupFilters, StartupFilters as FilterType } from "@/components/startups/StartupFilters";

export default function DiscoverPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterType>({});
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState("trending");
  const [showFilters, setShowFilters] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const handleSearch = async () => {
    // TODO: Implement search functionality
    console.log("Searching for:", searchTerm);
  };

  const handleFiltersChange = (newFilters: FilterType) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({});
    setSearchTerm("");
  };

  const handleApplyFilters = async () => {
    // TODO: Implement filter application
    console.log("Applying filters:", filters);
  };

  const handleViewStartup = (startupId: string) => {
    router.push(`/startups/${startupId}`);
  };

  const handleFollow = (startupId: string) => {
    // TODO: Implement follow functionality
    console.log("Following startup:", startupId);
  };

  const handleBookmark = (startupId: string) => {
    // TODO: Implement bookmark functionality
    console.log("Bookmarking startup:", startupId);
  };

  const handleShare = (startupId: string) => {
    // TODO: Implement share functionality
    console.log("Sharing startup:", startupId);
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "IDEA": return "bg-blue-100 text-blue-800";
      case "STARTUP": return "bg-yellow-100 text-yellow-800";
      case "GROWING": return "bg-green-100 text-green-800";
      case "ESTABLISHED": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStageText = (stage: string) => {
    switch (stage) {
      case "IDEA": return "Idea";
      case "STARTUP": return "Startup";
      case "GROWING": return "Creciendo";
      case "ESTABLISHED": return "Establecida";
      default: return stage;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Descubre Startups</h1>
          <p className="text-muted-foreground">
            Explora startups innovadoras y encuentra oportunidades de colaboración
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
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

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar startups, fundadores, categorías..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Overview */}
      {analytics && !analyticsLoading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Total Startups</p>
                  <p className="text-2xl font-bold">{analytics.totalStartups}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Nuevas esta semana</p>
                  <p className="text-2xl font-bold">{analytics.recentActivity}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Categoría principal</p>
                  <p className="text-lg font-bold">{analytics.categoryStats[0]?.name || "N/A"}</p>
                  <p className="text-sm text-muted-foreground">
                    {analytics.categoryStats[0]?.count || 0} startups
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium">Etapa principal</p>
                  <p className="text-lg font-bold">{analytics.stageStats[0]?.name || "N/A"}</p>
                  <p className="text-sm text-muted-foreground">
                    {analytics.stageStats[0]?.count || 0} startups
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <StartupFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onReset={handleResetFilters}
          onApply={handleApplyFilters}
          isLoading={isLoading}
        />
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="trending" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Tendencia
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Análisis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trending" className="space-y-4">
          <Card>
            <CardContent className="text-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Startups en Tendencia</h3>
              <p className="text-muted-foreground">
                Las startups más populares y con mayor crecimiento
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Esta funcionalidad estará disponible próximamente
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Análisis de Startups
              </CardTitle>
              <CardDescription>
                Estadísticas detalladas sobre las startups en la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : analytics ? (
                <div className="space-y-6">
                  {/* Category Distribution */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Distribución por Categoría</h3>
                    <div className="space-y-2">
                      {analytics.categoryStats.slice(0, 5).map((category) => (
                        <div key={category.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span className="text-sm">{category.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full" 
                                style={{ 
                                  width: `${(category.count / analytics.categoryStats[0]?.count) * 100}%` 
                                }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{category.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stage Distribution */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Distribución por Etapa</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {analytics.stageStats.map((stage) => (
                        <div key={stage.value} className="text-center">
                          <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStageColor(stage.value)}`}>
                            {getStageText(stage.value)}
                          </div>
                          <div className="text-2xl font-bold mt-2">{stage.count}</div>
                          <div className="text-sm text-muted-foreground">startups</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Location Distribution */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Distribución por Ubicación</h3>
                    <div className="space-y-2">
                      {analytics.locationStats.slice(0, 5).map((location) => (
                        <div key={location.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{location.name}</span>
                          </div>
                          <Badge variant="secondary">{location.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay datos disponibles</h3>
                  <p className="text-muted-foreground">
                    Los análisis estarán disponibles cuando haya más startups registradas
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
