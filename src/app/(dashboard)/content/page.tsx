"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Filter, 
  Plus, 
  FileText, 
  BookOpen
} from "lucide-react";
import { NewsCard } from "@/components/content/NewsCard";
import { ResourceCard } from "@/components/content/ResourceCard";
import { NewsForm } from "@/components/content/NewsForm";
import { ResourceForm } from "@/components/content/ResourceForm";

interface News {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  featuredImage?: string;
  status: "DRAFT" | "PUBLISHED" | "SCHEDULED" | "ARCHIVED";
  publishedAt?: string;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  _count: {
    views: number;
    likes: number;
    comments: number;
  };
}

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  type: "PDF" | "VIDEO" | "AUDIO" | "IMAGE" | "DOCUMENT" | "LINK";
  fileUrl?: string;
  fileSize?: number;
  tags: string[];
  status: "DRAFT" | "PUBLISHED" | "SCHEDULED" | "ARCHIVED";
  publishedAt?: string;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  _count: {
    downloads: number;
    likes: number;
    comments: number;
  };
}

export default function ContentManagementPage() {
  const [news, setNews] = useState<News[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showNewsForm, setShowNewsForm] = useState(false);
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const [newsResponse, resourcesResponse] = await Promise.all([
        fetch("/api/news"),
        fetch("/api/resources")
      ]);

      if (newsResponse.ok) {
        const newsData = await newsResponse.json();
        setNews(newsData.news || []);
      }

      if (resourcesResponse.ok) {
        const resourcesData = await resourcesResponse.json();
        setResources(resourcesData.resources || []);
      }
    } catch (error) {
      console.error("Error fetching content:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNews = async (newsData: Record<string, unknown>) => {
    try {
      const response = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newsData)
      });

      if (response.ok) {
        await fetchContent();
        setShowNewsForm(false);
      }
    } catch (error) {
      console.error("Error creating news:", error);
    }
  };

  const handleUpdateNews = async (id: string, newsData: Record<string, unknown>) => {
    try {
      const response = await fetch(`/api/news/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newsData)
      });

      if (response.ok) {
        await fetchContent();
        setEditingNews(null);
      }
    } catch (error) {
      console.error("Error updating news:", error);
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta noticia?")) return;

    try {
      const response = await fetch(`/api/news/${id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        await fetchContent();
      }
    } catch (error) {
      console.error("Error deleting news:", error);
    }
  };

  const handleCreateResource = async (resourceData: Record<string, unknown>) => {
    try {
      const response = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resourceData)
      });

      if (response.ok) {
        await fetchContent();
        setShowResourceForm(false);
      }
    } catch (error) {
      console.error("Error creating resource:", error);
    }
  };

  const handleUpdateResource = async (id: string, resourceData: Record<string, unknown>) => {
    try {
      const response = await fetch(`/api/resources/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resourceData)
      });

      if (response.ok) {
        await fetchContent();
        setEditingResource(null);
      }
    } catch (error) {
      console.error("Error updating resource:", error);
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este recurso?")) return;

    try {
      const response = await fetch(`/api/resources/${id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        await fetchContent();
      }
    } catch (error) {
      console.error("Error deleting resource:", error);
    }
  };


  const filteredNews = news.filter(item => {
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const filteredResources = resources.filter(item => {
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestión de Contenido</h1>
            <p className="text-muted-foreground mt-2">
              Administra noticias, recursos y contenido del sistema
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar contenido..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Estado</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="PUBLISHED">Publicado</SelectItem>
                  <SelectItem value="DRAFT">Borrador</SelectItem>
                  <SelectItem value="SCHEDULED">Programado</SelectItem>
                  <SelectItem value="ARCHIVED">Archivado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Categoría</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  <SelectItem value="GENERAL">General</SelectItem>
                  <SelectItem value="EDUCATION">Educación</SelectItem>
                  <SelectItem value="JOBS">Empleo</SelectItem>
                  <SelectItem value="ENTREPRENEURSHIP">Emprendimiento</SelectItem>
                  <SelectItem value="TECHNOLOGY">Tecnología</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setCategoryFilter("all");
              }}>
                <Filter className="h-4 w-4 mr-2" />
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="news" className="space-y-6">
        <TabsList>
          <TabsTrigger value="news" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Noticias ({filteredNews.length})
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center">
            <BookOpen className="h-4 w-4 mr-2" />
            Recursos ({filteredResources.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="news" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Noticias</h2>
            <Button onClick={() => setShowNewsForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Noticia
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.map((item) => (
              <NewsCard
                key={item.id}
                news={item}
                onEdit={setEditingNews}
                onDelete={handleDeleteNews}
                onView={(id) => console.log("View news:", id)}
              />
            ))}
          </div>

          {filteredNews.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No se encontraron noticias</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || statusFilter !== "all" || categoryFilter !== "all"
                    ? "Intenta ajustar los filtros de búsqueda"
                    : "Comienza creando tu primera noticia"
                  }
                </p>
                <Button onClick={() => setShowNewsForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Noticia
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Recursos</h2>
            <Button onClick={() => setShowResourceForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Recurso
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((item) => (
              <ResourceCard
                key={item.id}
                resource={item}
                onEdit={setEditingResource}
                onDelete={handleDeleteResource}
                onView={(id) => console.log("View resource:", id)}
              />
            ))}
          </div>

          {filteredResources.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No se encontraron recursos</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || statusFilter !== "all" || categoryFilter !== "all"
                    ? "Intenta ajustar los filtros de búsqueda"
                    : "Comienza creando tu primer recurso"
                  }
                </p>
                <Button onClick={() => setShowResourceForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Recurso
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* News Form Modal */}
      {(showNewsForm || editingNews) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {editingNews ? "Editar Noticia" : "Nueva Noticia"}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowNewsForm(false);
                    setEditingNews(null);
                  }}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <NewsForm
                news={editingNews}
                onSubmit={editingNews ? 
                  (data) => handleUpdateNews(editingNews.id, data) :
                  handleCreateNews
                }
                onCancel={() => {
                  setShowNewsForm(false);
                  setEditingNews(null);
                }}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Resource Form Modal */}
      {(showResourceForm || editingResource) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {editingResource ? "Editar Recurso" : "Nuevo Recurso"}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowResourceForm(false);
                    setEditingResource(null);
                  }}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ResourceForm
                resource={editingResource}
                onSubmit={editingResource ? 
                  (data) => handleUpdateResource(editingResource.id, data) :
                  handleCreateResource
                }
                onCancel={() => {
                  setShowResourceForm(false);
                  setEditingResource(null);
                }}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
