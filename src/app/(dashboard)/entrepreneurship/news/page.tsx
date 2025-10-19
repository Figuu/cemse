"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useEntrepreneurshipNews, useLatestNews } from "@/hooks/useEntrepreneurshipNews";
import { 
  Search, 
  Filter, 
  Plus,
  Globe,
  Eye,
  Heart,
  Calendar,
  ArrowLeft,
  Share2,
  Bookmark,
  TrendingUp,
  Users,
  Lightbulb
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function EntrepreneurshipNewsPage() {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState("all");

  const isYouth = session?.user?.role === "YOUTH";
  const isAdmin = session?.user?.role === "SUPERADMIN" || session?.user?.role === "INSTITUTION";

  // Fetch news
  const {
    news,
    isLoading,
    error,
    refetch
  } = useEntrepreneurshipNews({
    search: searchTerm || undefined,
    category: selectedCategory !== "all" ? selectedCategory : undefined,
  });

  // Filter news by category for tabs
  const allNews = news;
  const startupNews = news.filter(article => article.category === "Startups");
  const fundingNews = news.filter(article => article.category === "Financiamiento");
  const technologyNews = news.filter(article => article.category === "Tecnología");
  const businessNews = news.filter(article => article.category === "Negocios");

  const handleViewArticle = (articleId: string) => {
    // TODO: Implement article viewing
    console.log('Viewing article:', articleId);
  };

  const handleLikeArticle = (articleId: string) => {
    // TODO: Implement article liking
    console.log('Liking article:', articleId);
  };

  const handleShareArticle = (articleId: string) => {
    // TODO: Implement article sharing
    console.log('Sharing article:', articleId);
  };

  const handleBookmarkArticle = (articleId: string) => {
    // TODO: Implement article bookmarking
    console.log('Bookmarking article:', articleId);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Noticias de Emprendimiento</h1>
            <p className="text-muted-foreground">Mantente informado sobre las últimas tendencias y oportunidades</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Noticias de Emprendimiento</h1>
            <p className="text-muted-foreground">Mantente informado sobre las últimas tendencias y oportunidades</p>
          </div>
        </div>
        <Card className="p-6">
          <div className="flex items-center space-x-2 text-destructive">
            <Globe className="h-5 w-5" />
            <p>Error al cargar las noticias: {error?.message || 'Error desconocido'}</p>
          </div>
          <Button onClick={() => refetch()} className="mt-4">
            Reintentar
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={["YOUTH", "COMPANIES", "INSTITUTION", "SUPERADMIN"]}>
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div className="flex items-center space-x-4">
            <Link href="/entrepreneurship">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground sm:text-2xl">Noticias de Emprendimiento</h1>
              <p className="text-sm text-muted-foreground sm:text-base">
                Mantente informado sobre las últimas tendencias y oportunidades
              </p>
            </div>
          </div>
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
            {!isYouth && (
              <Link href="/entrepreneurship/news/create">
                <Button size="sm" className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Crear Noticia</span>
                  <span className="sm:hidden">Crear</span>
                </Button>
              </Link>
            )}
            <div className="flex items-center border rounded-lg">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Globe className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <TrendingUp className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar noticias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtros:</span>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                <SelectItem value="Startups">Startups</SelectItem>
                <SelectItem value="Financiamiento">Financiamiento</SelectItem>
                <SelectItem value="Tecnología">Tecnología</SelectItem>
                <SelectItem value="Negocios">Negocios</SelectItem>
                <SelectItem value="Innovación">Innovación</SelectItem>
                <SelectItem value="Mercado">Mercado</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Limpiar Filtros
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">Todas ({allNews.length})</TabsTrigger>
            <TabsTrigger value="startups">Startups ({startupNews.length})</TabsTrigger>
            <TabsTrigger value="funding">Financiamiento ({fundingNews.length})</TabsTrigger>
            <TabsTrigger value="technology">Tecnología ({technologyNews.length})</TabsTrigger>
            <TabsTrigger value="business">Negocios ({businessNews.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {allNews.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Globe className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron noticias</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Intenta ajustar tus filtros de búsqueda
                  </p>
                  <Button onClick={clearFilters} className="mt-4">
                    Limpiar Filtros
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className={cn(
                "gap-4",
                viewMode === "grid" 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" 
                  : "space-y-4"
              )}>
                {allNews.map((article) => (
                  <Card key={article.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="h-48 bg-muted rounded-t-lg flex items-center justify-center overflow-hidden">
                        {article.imageUrl ? (
                          <img 
                            src={article.imageUrl} 
                            alt={article.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Globe className="h-12 w-12 text-muted-foreground" />
                        )}
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {article.category}
                          </Badge>
                        </div>
                        <h3 className="font-semibold line-clamp-2">{article.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {article.summary}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1">
                              <Eye className="h-3 w-3" />
                              <span>{article.views}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Heart className="h-3 w-3" />
                              <span>{article.likes}</span>
                            </div>
                          </div>
                          <span>{new Date(article.publishedAt || article.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewArticle(article.id)}
                            className="flex-1"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Leer
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleBookmarkArticle(article.id)}
                          >
                            <Bookmark className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleShareArticle(article.id)}
                          >
                            <Share2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="startups" className="space-y-4">
            {startupNews.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Lightbulb className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay noticias de startups</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No se encontraron noticias de startups con los filtros actuales
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className={cn(
                "gap-4",
                viewMode === "grid" 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" 
                  : "space-y-4"
              )}>
                {startupNews.map((article) => (
                  <Card key={article.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="h-48 bg-muted rounded-t-lg flex items-center justify-center overflow-hidden">
                        {article.imageUrl ? (
                          <img 
                            src={article.imageUrl} 
                            alt={article.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Globe className="h-12 w-12 text-muted-foreground" />
                        )}
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {article.category}
                          </Badge>
                        </div>
                        <h3 className="font-semibold line-clamp-2">{article.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {article.summary}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1">
                              <Eye className="h-3 w-3" />
                              <span>{article.views}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Heart className="h-3 w-3" />
                              <span>{article.likes}</span>
                            </div>
                          </div>
                          <span>{new Date(article.publishedAt || article.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewArticle(article.id)}
                            className="flex-1"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Leer
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleBookmarkArticle(article.id)}
                          >
                            <Bookmark className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleShareArticle(article.id)}
                          >
                            <Share2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="funding" className="space-y-4">
            {fundingNews.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay noticias de financiamiento</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No se encontraron noticias de financiamiento con los filtros actuales
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className={cn(
                "gap-4",
                viewMode === "grid" 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" 
                  : "space-y-4"
              )}>
                {fundingNews.map((article) => (
                  <Card key={article.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="h-48 bg-muted rounded-t-lg flex items-center justify-center overflow-hidden">
                        {article.imageUrl ? (
                          <img 
                            src={article.imageUrl} 
                            alt={article.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Globe className="h-12 w-12 text-muted-foreground" />
                        )}
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {article.category}
                          </Badge>
                        </div>
                        <h3 className="font-semibold line-clamp-2">{article.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {article.summary}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1">
                              <Eye className="h-3 w-3" />
                              <span>{article.views}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Heart className="h-3 w-3" />
                              <span>{article.likes}</span>
                            </div>
                          </div>
                          <span>{new Date(article.publishedAt || article.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewArticle(article.id)}
                            className="flex-1"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Leer
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleBookmarkArticle(article.id)}
                          >
                            <Bookmark className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleShareArticle(article.id)}
                          >
                            <Share2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="technology" className="space-y-4">
            {technologyNews.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Globe className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay noticias de tecnología</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No se encontraron noticias de tecnología con los filtros actuales
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className={cn(
                "gap-4",
                viewMode === "grid" 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" 
                  : "space-y-4"
              )}>
                {technologyNews.map((article) => (
                  <Card key={article.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="h-48 bg-muted rounded-t-lg flex items-center justify-center overflow-hidden">
                        {article.imageUrl ? (
                          <img 
                            src={article.imageUrl} 
                            alt={article.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Globe className="h-12 w-12 text-muted-foreground" />
                        )}
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {article.category}
                          </Badge>
                        </div>
                        <h3 className="font-semibold line-clamp-2">{article.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {article.summary}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1">
                              <Eye className="h-3 w-3" />
                              <span>{article.views}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Heart className="h-3 w-3" />
                              <span>{article.likes}</span>
                            </div>
                          </div>
                          <span>{new Date(article.publishedAt || article.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewArticle(article.id)}
                            className="flex-1"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Leer
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleBookmarkArticle(article.id)}
                          >
                            <Bookmark className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleShareArticle(article.id)}
                          >
                            <Share2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="business" className="space-y-4">
            {businessNews.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay noticias de negocios</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No se encontraron noticias de negocios con los filtros actuales
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className={cn(
                "gap-4",
                viewMode === "grid" 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" 
                  : "space-y-4"
              )}>
                {businessNews.map((article) => (
                  <Card key={article.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="h-48 bg-muted rounded-t-lg flex items-center justify-center overflow-hidden">
                        {article.imageUrl ? (
                          <img 
                            src={article.imageUrl} 
                            alt={article.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Globe className="h-12 w-12 text-muted-foreground" />
                        )}
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {article.category}
                          </Badge>
                        </div>
                        <h3 className="font-semibold line-clamp-2">{article.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {article.summary}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1">
                              <Eye className="h-3 w-3" />
                              <span>{article.views}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Heart className="h-3 w-3" />
                              <span>{article.likes}</span>
                            </div>
                          </div>
                          <span>{new Date(article.publishedAt || article.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewArticle(article.id)}
                            className="flex-1"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Leer
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleBookmarkArticle(article.id)}
                          >
                            <Bookmark className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleShareArticle(article.id)}
                          >
                            <Share2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </RoleGuard>
  );
}
