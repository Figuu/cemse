"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Globe, 
  Search, 
  Filter, 
  Plus,
  Eye,
  Calendar,
  User,
  Heart,
  MessageCircle,
  Share,
  BookOpen,
  TrendingUp,
  Edit,
  Trash2,
  EyeOff,
  X
} from "lucide-react";
import { useNews } from "@/hooks/useNews";
import { NewsForm } from "@/components/news/NewsForm";
import { NewsDetailsModal } from "@/components/news/NewsDetailsModal";
import { useSession } from "next-auth/react";

export default function NewsPage() {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingNews, setEditingNews] = useState<any>(null);
  const [selectedNews, setSelectedNews] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Role-based permissions
  const isYouth = session?.user?.role === "YOUTH";
  const isInstitution = session?.user?.role === "INSTITUTION";
  const isSuperAdmin = session?.user?.role === "SUPERADMIN";
  const isCompany = session?.user?.role === "COMPANIES";
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
    authorId: isYouth ? undefined : session?.user?.id, // Youth sees all, others see their own
  });

  const categories = [
    { id: "all", name: "Todos", count: newsArticles.length },
    { id: "Empleo", name: "Empleo", count: newsArticles.filter(n => n.category === "Empleo").length },
    { id: "Educación", name: "Educación", count: newsArticles.filter(n => n.category === "Educación").length },
    { id: "Emprendimiento", name: "Emprendimiento", count: newsArticles.filter(n => n.category === "Emprendimiento").length },
    { id: "Tecnología", name: "Tecnología", count: newsArticles.filter(n => n.category === "Tecnología").length },
    { id: "Política", name: "Política", count: newsArticles.filter(n => n.category === "Política").length },
    { id: "Salud", name: "Salud", count: newsArticles.filter(n => n.category === "Salud").length },
    { id: "Deportes", name: "Deportes", count: newsArticles.filter(n => n.category === "Deportes").length },
    { id: "Cultura", name: "Cultura", count: newsArticles.filter(n => n.category === "Cultura").length },
    { id: "Medio Ambiente", name: "Medio Ambiente", count: newsArticles.filter(n => n.category === "Medio Ambiente").length },
    { id: "Internacional", name: "Internacional", count: newsArticles.filter(n => n.category === "Internacional").length },
    { id: "Local", name: "Local", count: newsArticles.filter(n => n.category === "Local").length },
    { id: "Otros", name: "Otros", count: newsArticles.filter(n => n.category === "Otros").length }
  ];

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Noticias</h1>
          <p className="text-muted-foreground">
            {isYouth 
              ? "Mantente informado con las últimas noticias y actualizaciones"
              : "Gestiona y publica noticias para tu audiencia"
            }
          </p>
        </div>
        {canManageNews && (
          <div className="flex items-center space-x-2">
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Noticia
            </Button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Noticias</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newsArticles.length}</div>
            <p className="text-xs text-muted-foreground">
              {isYouth ? "Disponibles" : "Publicadas por ti"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vistas</CardTitle>
            <Eye className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {newsArticles.reduce((sum, n) => sum + n.viewCount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Vistas totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interacciones</CardTitle>
            <Heart className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {newsArticles.reduce((sum, n) => sum + n.likeCount + n.commentCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Likes y comentarios
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Destacadas</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
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
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {isYouth ? "Noticias y Artículos" : "Mis Noticias"}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar noticias..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              {canManageNews && (
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-40">
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
        </CardHeader>
        <CardContent>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-7">
              {categories.slice(0, 7).map((category) => (
                <TabsTrigger key={category.id} value={category.id}>
                  {category.name} ({category.count})
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-6">
              <div className="space-y-6">
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
                  newsArticles.map((article) => (
                    <Card key={article.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex space-x-4">
                          {/* Article Image */}
                          <div className="flex-shrink-0">
                            <div className="w-32 h-24 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
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
                          </div>
                          
                          {/* Article Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  {article.featured && (
                                    <Badge className="bg-yellow-100 text-yellow-800">
                                      Destacado
                                    </Badge>
                                  )}
                                  <Badge className={getPriorityColor(article.priority)}>
                                    {article.priority}
                                  </Badge>
                                  <Badge variant="outline">{article.category}</Badge>
                                  {canManageNews && (
                                    <Badge className={getStatusColor(article.status)}>
                                      {article.status === "PUBLISHED" ? "Publicado" : 
                                       article.status === "DRAFT" ? "Borrador" : "Archivado"}
                                    </Badge>
                                  )}
                                </div>
                                
                                <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                                  {article.title}
                                </h3>
                                
                                <p className="text-gray-600 mb-4 line-clamp-2">
                                  {article.summary}
                                </p>
                                
                                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                                  <div className="flex items-center space-x-1">
                                    {getAuthorTypeIcon(article.authorType)}
                                    <span>{article.authorName}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>
                                      {article.publishedAt 
                                        ? new Date(article.publishedAt).toLocaleDateString()
                                        : "No publicado"
                                      }
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Eye className="h-4 w-4" />
                                    <span>{article.viewCount.toLocaleString()}</span>
                                  </div>
                                </div>
                                
                                <div className="flex flex-wrap gap-1 mb-4">
                                  {article.tags.slice(0, 4).map((tag) => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {article.tags.length > 4 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{article.tags.length - 4}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              {/* Article Actions */}
                              <div className="flex flex-col space-y-2 ml-4">
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <div className="flex items-center space-x-1">
                                    <Heart className="h-4 w-4" />
                                    <span>{article.likeCount}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <MessageCircle className="h-4 w-4" />
                                    <span>{article.commentCount}</span>
                                  </div>
                                </div>
                                
                                <div className="flex space-x-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleViewNews(article)}
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
                                      >
                                        <Edit className="h-4 w-4 mr-1" />
                                        Editar
                                      </Button>
                                      {article.status === "DRAFT" && (
                                        <Button 
                                          size="sm"
                                          onClick={() => handlePublishNews(article.id)}
                                        >
                                          <Eye className="h-4 w-4 mr-1" />
                                          Publicar
                                        </Button>
                                      )}
                                      {article.status === "PUBLISHED" && (
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                          onClick={() => handleUnpublishNews(article.id)}
                                        >
                                          <EyeOff className="h-4 w-4 mr-1" />
                                          Despublicar
                                        </Button>
                                      )}
                                    </>
                                  )}
                                  {!isYouth && (
                                    <Button variant="outline" size="sm">
                                      <Share className="h-4 w-4 mr-1" />
                                      Compartir
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
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
