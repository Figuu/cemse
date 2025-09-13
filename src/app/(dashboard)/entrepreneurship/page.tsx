"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Plus, 
  TrendingUp, 
  BookOpen, 
  Newspaper, 
  Calculator,
  Users,
  Lightbulb,
  ArrowRight,
  Star
} from "lucide-react";
import { ResourceCard } from "@/components/entrepreneurship/ResourceCard";
import { NewsCard } from "@/components/entrepreneurship/NewsCard";
import { 
  useEntrepreneurshipResources, 
  useFeaturedResources,
  ResourceType 
} from "@/hooks/useEntrepreneurshipResources";
import { 
  useEntrepreneurshipNews, 
  useLatestNews 
} from "@/hooks/useEntrepreneurshipNews";

const resourceCategories = [
  "Finanzas",
  "Marketing",
  "Tecnología",
  "Legal",
  "Operaciones",
  "Recursos Humanos",
  "Estrategia",
  "Otros"
];

const newsCategories = [
  "Tecnología",
  "Finanzas",
  "Startups",
  "Innovación",
  "Política",
  "Mercado",
  "Otros"
];

const resourceTypes: { value: ResourceType; label: string }[] = [
  { value: "ARTICLE", label: "Artículos" },
  { value: "VIDEO", label: "Videos" },
  { value: "PODCAST", label: "Podcasts" },
  { value: "TOOL", label: "Herramientas" },
  { value: "TEMPLATE", label: "Plantillas" },
  { value: "GUIDE", label: "Guías" },
  { value: "CASE_STUDY", label: "Casos de Estudio" },
];

export default function EntrepreneurshipPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResourceCategory, setSelectedResourceCategory] = useState("all");
  const [selectedNewsCategory, setSelectedNewsCategory] = useState("all");
  const [selectedResourceType, setSelectedResourceType] = useState<ResourceType | "all">("all");

  // Fetch data
  const { resources, isLoading: resourcesLoading } = useEntrepreneurshipResources({
    search: searchTerm || undefined,
    category: selectedResourceCategory !== "all" ? selectedResourceCategory : undefined,
    type: selectedResourceType !== "all" ? selectedResourceType : undefined,
    limit: 12,
  });

  const { news, isLoading: newsLoading } = useEntrepreneurshipNews({
    search: searchTerm || undefined,
    category: selectedNewsCategory !== "all" ? selectedNewsCategory : undefined,
    published: true,
    limit: 12,
  });

  const { resources: featuredResources, isLoading: featuredLoading } = useFeaturedResources();
  const { news: latestNews, isLoading: latestLoading } = useLatestNews();

  const handleResourceView = (resource: any) => {
    if (resource.url) {
      window.open(resource.url, "_blank");
    }
  };

  const handleNewsView = (news: any) => {
    if (news.sourceUrl) {
      window.open(news.sourceUrl, "_blank");
    }
  };

  const handleResourceLike = (resourceId: string) => {
    // TODO: Implement like functionality
    console.log("Liking resource:", resourceId);
  };

  const handleNewsLike = (newsId: string) => {
    // TODO: Implement like functionality
    console.log("Liking news:", newsId);
  };

  const handleResourceShare = (resourceId: string) => {
    // TODO: Implement share functionality
    console.log("Sharing resource:", resourceId);
  };

  const handleNewsShare = (newsId: string) => {
    // TODO: Implement share functionality
    console.log("Sharing news:", newsId);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Lightbulb className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Centro de Emprendimiento</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Recursos, noticias y herramientas para jóvenes emprendedores. 
          Conecta, aprende y haz crecer tu proyecto empresarial.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Plan de Negocios</h3>
            <p className="text-sm text-muted-foreground">Crea tu plan paso a paso</p>
          </CardContent>
        </Card>
        <Link href="/entrepreneurship/calculator">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Calculator className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Calculadora Financiera</h3>
              <p className="text-sm text-muted-foreground">Calcula costos y proyecciones</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/entrepreneurship/network">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Red de Emprendedores</h3>
              <p className="text-sm text-muted-foreground">Conecta con otros jóvenes</p>
            </CardContent>
          </Card>
        </Link>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Mi Startup</h3>
            <p className="text-sm text-muted-foreground">Gestiona tu proyecto</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar recursos y noticias..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="resources" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="resources" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Recursos
          </TabsTrigger>
          <TabsTrigger value="news" className="flex items-center gap-2">
            <Newspaper className="h-4 w-4" />
            Noticias
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resources" className="space-y-6">
          {/* Featured Resources */}
          {featuredResources.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <h2 className="text-2xl font-bold">Recursos Destacados</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredResources.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    variant="featured"
                    onView={handleResourceView}
                    onLike={handleResourceLike}
                    onShare={handleResourceShare}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Resource Categories */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Categorías de Recursos</h2>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedResourceCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedResourceCategory("all")}
              >
                Todas
              </Button>
              {resourceCategories.map((category) => (
                <Button
                  key={category}
                  variant={selectedResourceCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedResourceCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Resource Types */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Tipos de Recursos</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedResourceType === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedResourceType("all")}
              >
                Todos
              </Button>
              {resourceTypes.map((type) => (
                <Button
                  key={type.value}
                  variant={selectedResourceType === type.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedResourceType(type.value)}
                >
                  {type.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Resources Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Recursos {selectedResourceCategory !== "all" && `- ${selectedResourceCategory}`}
                {selectedResourceType !== "all" && ` - ${resourceTypes.find(t => t.value === selectedResourceType)?.label}`}
              </h3>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Agregar Recurso
              </Button>
            </div>
            
            {resourcesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 bg-muted rounded"></div>
                        <div className="h-3 bg-muted rounded w-5/6"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : resources.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resources.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    onView={handleResourceView}
                    onLike={handleResourceLike}
                    onShare={handleResourceShare}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No se encontraron recursos</h3>
                  <p className="text-muted-foreground mb-4">
                    No hay recursos disponibles con los filtros seleccionados.
                  </p>
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Primer Recurso
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="news" className="space-y-6">
          {/* Latest News */}
          {latestNews.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold">Últimas Noticias</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {latestNews.map((news) => (
                  <NewsCard
                    key={news.id}
                    news={news}
                    variant="featured"
                    onView={handleNewsView}
                    onLike={handleNewsLike}
                    onShare={handleNewsShare}
                  />
                ))}
              </div>
            </div>
          )}

          {/* News Categories */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Categorías de Noticias</h2>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedNewsCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedNewsCategory("all")}
              >
                Todas
              </Button>
              {newsCategories.map((category) => (
                <Button
                  key={category}
                  variant={selectedNewsCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedNewsCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* News Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Noticias {selectedNewsCategory !== "all" && `- ${selectedNewsCategory}`}
              </h3>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Agregar Noticia
              </Button>
            </div>
            
            {newsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 bg-muted rounded"></div>
                        <div className="h-3 bg-muted rounded w-5/6"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : news.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {news.map((newsItem) => (
                  <NewsCard
                    key={newsItem.id}
                    news={newsItem}
                    onView={handleNewsView}
                    onLike={handleNewsLike}
                    onShare={handleNewsShare}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Newspaper className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No se encontraron noticias</h3>
                  <p className="text-muted-foreground mb-4">
                    No hay noticias disponibles con los filtros seleccionados.
                  </p>
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Primera Noticia
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}