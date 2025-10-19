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
import { useEntrepreneurshipResources, EntrepreneurshipResource } from "@/hooks/useEntrepreneurshipResources";
import { ResourceCard } from "@/components/entrepreneurship/ResourceCard";
import { 
  Search, 
  Filter, 
  Plus,
  BookOpen,
  FileText,
  Video,
  Link as LinkIcon,
  Download,
  Eye,
  Heart,
  Share2,
  Grid3X3,
  List
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function EntrepreneurshipResourcesPage() {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState("all");

  const isYouth = session?.user?.role === "YOUTH";
  const isAdmin = session?.user?.role === "SUPERADMIN" || session?.user?.role === "INSTITUTION";

  // Fetch resources
  const {
    resources,
    pagination,
    isLoading,
    error,
    refetch
  } = useEntrepreneurshipResources({
    search: searchTerm || undefined,
    type: selectedType !== "all" ? selectedType as any : undefined,
    category: selectedCategory !== "all" ? selectedCategory : undefined,
  });

  // Filter resources by type for tabs
  const allResources = resources;
  const articles = resources.filter(resource => resource.type === "ARTICLE");
  const videos = resources.filter(resource => resource.type === "VIDEO");
  const tools = resources.filter(resource => resource.type === "TOOL");
  const templates = resources.filter(resource => resource.type === "TEMPLATE");

  const handleViewResource = (resource: EntrepreneurshipResource) => {
    // TODO: Implement resource viewing
    console.log('Viewing resource:', resource.id);
  };

  const handleLikeResource = (resourceId: string) => {
    // TODO: Implement resource liking
    console.log('Liking resource:', resourceId);
  };

  const handleShareResource = (resourceId: string) => {
    // TODO: Implement resource sharing
    console.log('Sharing resource:', resourceId);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedType("all");
    setSelectedCategory("all");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Recursos para Emprendedores</h1>
            <p className="text-muted-foreground">Herramientas, plantillas y guías para desarrollar tu negocio</p>
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
            <h1 className="text-2xl font-bold text-foreground">Recursos para Emprendedores</h1>
            <p className="text-muted-foreground">Herramientas, plantillas y guías para desarrollar tu negocio</p>
          </div>
        </div>
        <Card className="p-6">
          <div className="flex items-center space-x-2 text-destructive">
            <BookOpen className="h-5 w-5" />
            <p>Error al cargar los recursos: {error?.message || 'Error desconocido'}</p>
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
          <div>
            <h1 className="text-xl font-bold text-foreground sm:text-2xl">Recursos para Emprendedores</h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              Herramientas, plantillas y guías para desarrollar tu negocio
            </p>
          </div>
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
            {!isYouth && (
              <Link href="/entrepreneurship/resources/create">
                <Button size="sm" className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Crear Recurso</span>
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
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
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
              placeholder="Buscar recursos..."
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
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Tipo de recurso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="ARTICLE">Artículos</SelectItem>
                <SelectItem value="VIDEO">Videos</SelectItem>
                <SelectItem value="TOOL">Herramientas</SelectItem>
                <SelectItem value="TEMPLATE">Plantillas</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                <SelectItem value="BUSINESS_PLANNING">Planificación de Negocio</SelectItem>
                <SelectItem value="MARKETING">Marketing</SelectItem>
                <SelectItem value="FINANCE">Finanzas</SelectItem>
                <SelectItem value="LEGAL">Legal</SelectItem>
                <SelectItem value="TECHNOLOGY">Tecnología</SelectItem>
                <SelectItem value="SALES">Ventas</SelectItem>
                <SelectItem value="OPERATIONS">Operaciones</SelectItem>
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
            <TabsTrigger value="all">Todos ({allResources.length})</TabsTrigger>
            <TabsTrigger value="articles">Artículos ({articles.length})</TabsTrigger>
            <TabsTrigger value="videos">Videos ({videos.length})</TabsTrigger>
            <TabsTrigger value="tools">Herramientas ({tools.length})</TabsTrigger>
            <TabsTrigger value="templates">Plantillas ({templates.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {allResources.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron recursos</h3>
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
                {allResources.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    variant={viewMode === "grid" ? "default" : "compact"}
                    onView={handleViewResource}
                    onLike={handleLikeResource}
                    onShare={handleShareResource}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="articles" className="space-y-4">
            {articles.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay artículos disponibles</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No se encontraron artículos con los filtros actuales
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
                {articles.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    variant={viewMode === "grid" ? "default" : "compact"}
                    onView={handleViewResource}
                    onLike={handleLikeResource}
                    onShare={handleShareResource}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="videos" className="space-y-4">
            {videos.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Video className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay videos disponibles</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No se encontraron videos con los filtros actuales
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
                {videos.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    variant={viewMode === "grid" ? "default" : "compact"}
                    onView={handleViewResource}
                    onLike={handleLikeResource}
                    onShare={handleShareResource}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tools" className="space-y-4">
            {tools.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Download className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay herramientas disponibles</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No se encontraron herramientas con los filtros actuales
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
                {tools.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    variant={viewMode === "grid" ? "default" : "compact"}
                    onView={handleViewResource}
                    onLike={handleLikeResource}
                    onShare={handleShareResource}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            {templates.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay plantillas disponibles</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No se encontraron plantillas con los filtros actuales
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
                {templates.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    variant={viewMode === "grid" ? "default" : "compact"}
                    onView={handleViewResource}
                    onLike={handleLikeResource}
                    onShare={handleShareResource}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => {
                // TODO: Implement pagination
              }}
            >
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {pagination.page} de {pagination.pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === pagination.pages}
              onClick={() => {
                // TODO: Implement pagination
              }}
            >
              Siguiente
            </Button>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
