"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  TrendingUp
} from "lucide-react";

export default function NewsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Mock data - in real app, this would come from API
  const newsArticles = [
    {
      id: "1",
      title: "Nuevas Oportunidades de Empleo en el Sector Tecnológico",
      summary: "El sector tecnológico en Colombia está experimentando un crecimiento sin precedentes, creando miles de nuevas oportunidades de empleo para jóvenes profesionales.",
      content: "El sector tecnológico en Colombia está experimentando un crecimiento sin precedentes...",
      author: "Instituto CEMSE",
      authorType: "INSTITUTION",
      category: "Empleo",
      status: "PUBLISHED",
      priority: "HIGH",
      featured: true,
      tags: ["tecnología", "empleo", "oportunidades", "jóvenes"],
      publishedAt: "2024-02-15",
      viewCount: 1250,
      likeCount: 89,
      commentCount: 23,
      imageUrl: "/news/tech-jobs.jpg"
    },
    {
      id: "2",
      title: "Curso Gratuito de Marketing Digital para Emprendedores",
      summary: "Aprende las estrategias más efectivas de marketing digital para hacer crecer tu negocio en el mundo digital.",
      content: "El marketing digital se ha convertido en una herramienta esencial...",
      author: "María González",
      authorType: "INSTRUCTOR",
      category: "Educación",
      status: "PUBLISHED",
      priority: "MEDIUM",
      featured: false,
      tags: ["marketing", "digital", "emprendimiento", "curso"],
      publishedAt: "2024-02-12",
      viewCount: 890,
      likeCount: 67,
      commentCount: 15,
      imageUrl: "/news/marketing-course.jpg"
    },
    {
      id: "3",
      title: "Jóvenes Emprendedores Destacan en Competencia Nacional",
      summary: "Cinco jóvenes emprendedores de nuestra región han sido reconocidos en la competencia nacional de emprendimiento juvenil.",
      content: "La competencia nacional de emprendimiento juvenil ha concluido...",
      author: "Carlos Rodríguez",
      authorType: "YOUTH",
      category: "Emprendimiento",
      status: "PUBLISHED",
      priority: "HIGH",
      featured: true,
      tags: ["emprendimiento", "jóvenes", "competencia", "reconocimiento"],
      publishedAt: "2024-02-10",
      viewCount: 2100,
      likeCount: 156,
      commentCount: 42,
      imageUrl: "/news/entrepreneurs.jpg"
    },
    {
      id: "4",
      title: "Nuevas Políticas de Apoyo a la Educación Superior",
      summary: "El gobierno ha anunciado nuevas políticas para apoyar el acceso a la educación superior de jóvenes de bajos recursos.",
      content: "El Ministerio de Educación ha presentado un nuevo paquete de políticas...",
      author: "Instituto CEMSE",
      authorType: "INSTITUTION",
      category: "Política",
      status: "PUBLISHED",
      priority: "MEDIUM",
      featured: false,
      tags: ["educación", "política", "gobierno", "acceso"],
      publishedAt: "2024-02-08",
      viewCount: 750,
      likeCount: 45,
      commentCount: 12,
      imageUrl: "/news/education-policy.jpg"
    }
  ];

  const categories = [
    { id: "all", name: "Todos", count: newsArticles.length },
    { id: "Empleo", name: "Empleo", count: newsArticles.filter(n => n.category === "Empleo").length },
    { id: "Educación", name: "Educación", count: newsArticles.filter(n => n.category === "Educación").length },
    { id: "Emprendimiento", name: "Emprendimiento", count: newsArticles.filter(n => n.category === "Emprendimiento").length },
    { id: "Política", name: "Política", count: newsArticles.filter(n => n.category === "Política").length }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800";
      case "LOW":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAuthorTypeIcon = (authorType: string) => {
    switch (authorType) {
      case "INSTITUTION":
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      case "INSTRUCTOR":
        return <User className="h-4 w-4 text-green-500" />;
      case "YOUTH":
        return <TrendingUp className="h-4 w-4 text-purple-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredArticles = newsArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Noticias</h1>
          <p className="text-muted-foreground">
            Mantente informado con las últimas noticias y actualizaciones
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Crear Noticia
          </Button>
        </div>
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
              +2 esta semana
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
              +12% vs mes anterior
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
            <CardTitle>Noticias y Artículos</CardTitle>
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
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-5">
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id}>
                  {category.name} ({category.count})
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-6">
              <div className="space-y-6">
                {filteredArticles.map((article) => (
                  <Card key={article.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex space-x-4">
                        {/* Article Image */}
                        <div className="flex-shrink-0">
                          <div className="w-32 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Globe className="h-8 w-8 text-gray-400" />
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
                                  <span>{article.author}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
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
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4 mr-1" />
                                  Leer
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Share className="h-4 w-4 mr-1" />
                                  Compartir
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
