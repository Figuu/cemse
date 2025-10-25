"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Globe, 
  Search, 
  Filter, 
  Plus,
  Eye,
  Calendar,
  User,
  BookOpen,
  TrendingUp,
  Edit,
  Trash2,
  EyeOff,
  X,
  Grid3X3,
  List
} from "lucide-react";
import { useNews } from "@/hooks/useNews";
import { NewsForm } from "@/components/news/NewsForm";
import { NewsDetailsModal } from "@/components/news/NewsDetailsModal";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";

export default function NewsPage() {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedMunicipality, setSelectedMunicipality] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingNews, setEditingNews] = useState<any>(null);
  const [selectedNews, setSelectedNews] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  // Role-based permissions
  const isYouth = session?.user?.role === "YOUTH";
  const isInstitution = session?.user?.role === "INSTITUTION";
  const isSuperAdmin = session?.user?.role === "SUPERADMIN";
  const isCompany = session?.user?.role === "COMPANIES";

  // Fetch municipality institutions for the filter (only for authorized users)
  const { data: municipalityInstitutions = [] } = useQuery({
    queryKey: ['municipality-institutions-news'],
    queryFn: async () => {
      const response = await fetch('/api/admin/institutions');
      if (!response.ok) throw new Error('Failed to fetch institutions');
      const institutions = await response.json();
      // Filter only municipality type institutions
      return institutions.filter((institution: any) => institution.institutionType === 'MUNICIPALITY');
    },
    enabled: isInstitution || isSuperAdmin // Only fetch for INSTITUTION and SUPERADMIN users
  });
  const canManageNews = isInstitution || isSuperAdmin || isCompany;

  // Fetch news data
  const { 
    news: newsArticles, 
    isLoading, 
    error, 
    createNews, 
    updateNews, 
    deleteNews, 
    publishNews, 
    unpublishNews 
  } = useNews({
    search: searchTerm || undefined,
    category: selectedCategory !== "all" ? selectedCategory : undefined,
    status: selectedStatus !== "all" ? selectedStatus : undefined,
    authorId: (isYouth || isSuperAdmin) ? undefined : session?.user?.id, // Youth and SuperAdmin see all, others see their own
  });


  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800";
      case "LOW":
        return "bg-green-100 text-green-800";
      case "URGENT":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAuthorTypeIcon = (authorType: string) => {
    switch (authorType) {
      case "INSTITUTION":
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      case "COMPANY":
        return <Globe className="h-4 w-4 text-green-500" />;
      case "ADMIN":
        return <TrendingUp className="h-4 w-4 text-purple-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-green-100 text-green-800";
      case "DRAFT":
        return "bg-yellow-100 text-yellow-800";
      case "ARCHIVED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleCreateNews = async (data: any) => {
    const result = await createNews(data);
    if (result) {
      setShowForm(false);
    }
  };

  const handleUpdateNews = async (data: any) => {
    if (!editingNews?.id) return;
    const result = await updateNews(editingNews.id, data);
    if (result) {
      setEditingNews(null);
      setShowForm(false);
    }
  };

  const handleDeleteNews = async (id: string) => {
    return await deleteNews(id);
  };

  const handlePublishNews = async (id: string) => {
    return await publishNews(id);
  };

  const handleUnpublishNews = async (id: string) => {
    return await unpublishNews(id);
  };

  const handleViewNews = (news: any) => {
    setSelectedNews(news);
    setShowDetailsModal(true);
  };

  const handleEditNews = (news: any) => {
    setEditingNews(news);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingNews(null);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedNews(null);
  };

  // Filter news by municipality (based on author's associated institution)
  const filteredNews = newsArticles.filter(news => {
    if (selectedMunicipality === "all") return true;
    return news.author?.profile?.institution?.name === selectedMunicipality;
  });

  const categories = [
    { id: "all", name: "Todos", count: filteredNews.length },
    { id: "Empleo", name: "Empleo", count: filteredNews.filter(n => n.category === "Empleo").length },
    { id: "Educación", name: "Educación", count: filteredNews.filter(n => n.category === "Educación").length },
    { id: "Emprendimiento", name: "Emprendimiento", count: filteredNews.filter(n => n.category === "Emprendimiento").length },
    { id: "Tecnología", name: "Tecnología", count: filteredNews.filter(n => n.category === "Tecnología").length },
    { id: "Política", name: "Política", count: filteredNews.filter(n => n.category === "Política").length },
    { id: "Salud", name: "Salud", count: filteredNews.filter(n => n.category === "Salud").length },
    { id: "Deportes", name: "Deportes", count: filteredNews.filter(n => n.category === "Deportes").length },
    { id: "Cultura", name: "Cultura", count: filteredNews.filter(n => n.category === "Cultura").length },
    { id: "Medio Ambiente", name: "Medio Ambiente", count: filteredNews.filter(n => n.category === "Medio Ambiente").length },
    { id: "Internacional", name: "Internacional", count: filteredNews.filter(n => n.category === "Internacional").length },
    { id: "Local", name: "Local", count: filteredNews.filter(n => n.category === "Local").length },
    { id: "Otros", name: "Otros", count: filteredNews.filter(n => n.category === "Otros").length }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <Button onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Noticias</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            {isYouth 
              ? "Mantente informado con las últimas noticias y actualizaciones"
              : "Gestiona y publica noticias para tu audiencia"
            }
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {/* View Mode Toggle - Only visible on desktop */}
          <div className="hidden sm:flex items-center bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-8 w-8 p-0"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          {canManageNews && (
            <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Crear Noticia
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-sm font-medium">Total Noticias</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-2xl font-bold">{newsArticles.length}</div>
            <p className="text-xs text-muted-foreground">
              {isYouth ? "Disponibles" : "Publicadas por ti"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-sm font-medium">Total Vistas</CardTitle>
            <Eye className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-2xl font-bold">
              {newsArticles.reduce((sum, n) => sum + n.viewCount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Vistas totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-sm font-medium">Destacadas</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-2xl font-bold">
              {newsArticles.filter(n => n.featured).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Artículos destacados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar noticias..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name} ({category.count})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedMunicipality} onValueChange={setSelectedMunicipality}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Municipio" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {municipalityInstitutions.map((institution: any) => (
                        <SelectItem key={institution.id} value={institution.name}>
                          {institution.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                  {canManageNews && (
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="PUBLISHED">Publicados</SelectItem>
                        <SelectItem value="DRAFT">Borradores</SelectItem>
                        <SelectItem value="ARCHIVED">Archivados</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {newsArticles.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Globe className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No hay noticias</h3>
                  <p className="text-muted-foreground mb-4">
                    {isYouth 
                      ? "No hay noticias disponibles en esta categoría"
                      : "No has creado ninguna noticia aún"
                    }
                  </p>
                  {canManageNews && (
                    <Button onClick={() => setShowForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Primera Noticia
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className={`grid gap-4 ${
                viewMode === "grid" 
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" 
                  : "grid-cols-1"
              }`}>
                {filteredNews.map((article) => (
                  <Card key={article.id} className="hover:shadow-md transition-shadow overflow-hidden">
                    <CardContent className="p-4">
                      {/* Article Image */}
                      <div className="w-full h-40 sm:h-32 bg-gray-200 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                        {article.imageUrl ? (
                          <img 
                            src={article.imageUrl} 
                            alt={article.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Globe className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      
                      {/* Badges */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {article.featured && (
                          <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                            Destacado
                          </Badge>
                        )}
                        <Badge className={`text-xs ${getPriorityColor(article.priority)}`}>
                          {article.priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {article.category}
                        </Badge>
                        {canManageNews && (
                          <Badge className={`text-xs ${getStatusColor(article.status)}`}>
                            {article.status === "PUBLISHED" ? "Publicado" : 
                             article.status === "DRAFT" ? "Borrador" : "Archivado"}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Title */}
                      <h3 className="font-semibold mb-2 text-base sm:text-lg line-clamp-2 leading-tight">
                        {article.title}
                      </h3>
                      
                      {/* Summary */}
                      <p className="text-gray-600 mb-3 text-sm line-clamp-2 leading-relaxed">
                        {article.summary}
                      </p>
                      
                      {/* Metadata */}
                      <div className="space-y-2 mb-3 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          {getAuthorTypeIcon(article.authorType)}
                          <span className="truncate">{article.authorName}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {article.publishedAt 
                              ? new Date(article.publishedAt).toLocaleDateString()
                              : "No publicado"
                            }
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="h-3 w-3" />
                          <span>{article.viewCount.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      {/* Tags */}
                      {article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {article.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {article.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{article.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewNews(article)}
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Leer
                        </Button>
                        {canManageNews && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditNews(article)}
                              className="flex-1"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Editar
                            </Button>
                            {article.status === "DRAFT" && (
                              <Button 
                                size="sm"
                                onClick={() => handlePublishNews(article.id)}
                                className="flex-1"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Publicar
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* News Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <NewsForm
              initialData={editingNews}
              onSubmit={editingNews ? handleUpdateNews : handleCreateNews}
              onCancel={handleCloseForm}
            />
          </div>
        </div>
      )}

      {/* News Details Modal */}
      {showDetailsModal && selectedNews && (
        <NewsDetailsModal
          news={selectedNews}
          onClose={handleCloseDetailsModal}
          onEdit={canManageNews ? handleEditNews : undefined}
          onDelete={canManageNews ? handleDeleteNews : undefined}
          onPublish={canManageNews ? handlePublishNews : undefined}
          onUnpublish={canManageNews ? handleUnpublishNews : undefined}
          canEdit={canManageNews}
          canDelete={canManageNews}
          canPublish={canManageNews}
        />
      )}
    </div>
  );
}
