"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Search, 
  Filter, 
  Upload,
  Download,
  Eye,
  Calendar,
  User,
  Tag,
  Video,
  Image,
  File,
  Globe
} from "lucide-react";

export default function ResourcesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Mock data - in real app, this would come from API
  const resources = [
    {
      id: "1",
      title: "Guía de Desarrollo Web",
      description: "Guía completa para aprender desarrollo web desde cero",
      type: "PDF",
      category: "Tecnología",
      author: "Instituto CEMSE",
      uploadDate: "2024-01-15",
      downloads: 245,
      size: "2.5 MB",
      tags: ["web", "desarrollo", "frontend", "backend"],
      thumbnail: "/resources/web-guide.jpg"
    },
    {
      id: "2",
      title: "Curso de Marketing Digital",
      description: "Video curso sobre estrategias de marketing digital",
      type: "Video",
      category: "Marketing",
      author: "María González",
      uploadDate: "2024-02-10",
      downloads: 189,
      size: "150 MB",
      tags: ["marketing", "digital", "estrategia", "social media"],
      thumbnail: "/resources/marketing-course.jpg"
    },
    {
      id: "3",
      title: "Plantillas de CV Profesionales",
      description: "Colección de plantillas de CV para diferentes industrias",
      type: "ZIP",
      category: "Empleo",
      author: "Equipo CEMSE",
      uploadDate: "2024-01-20",
      downloads: 312,
      size: "5.2 MB",
      tags: ["cv", "plantillas", "empleo", "profesional"],
      thumbnail: "/resources/cv-templates.jpg"
    },
    {
      id: "4",
      title: "Manual de Emprendimiento",
      description: "Guía paso a paso para crear y gestionar un negocio",
      type: "PDF",
      category: "Emprendimiento",
      author: "Carlos Rodríguez",
      uploadDate: "2024-02-05",
      downloads: 156,
      size: "3.8 MB",
      tags: ["emprendimiento", "negocio", "gestión", "startup"],
      thumbnail: "/resources/entrepreneurship-manual.jpg"
    }
  ];

  const categories = [
    { id: "all", name: "Todos", count: resources.length },
    { id: "Tecnología", name: "Tecnología", count: resources.filter(r => r.category === "Tecnología").length },
    { id: "Marketing", name: "Marketing", count: resources.filter(r => r.category === "Marketing").length },
    { id: "Empleo", name: "Empleo", count: resources.filter(r => r.category === "Empleo").length },
    { id: "Emprendimiento", name: "Emprendimiento", count: resources.filter(r => r.category === "Emprendimiento").length }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "PDF":
        return <FileText className="h-5 w-5 text-red-500" />;
      case "Video":
        return <Video className="h-5 w-5 text-blue-500" />;
      case "ZIP":
        return <File className="h-5 w-5 text-purple-500" />;
      case "Image":
        return <Image className="h-5 w-5 text-green-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recursos</h1>
          <p className="text-muted-foreground">
            Biblioteca de recursos educativos y materiales de apoyo
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Subir Recurso
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recursos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resources.length}</div>
            <p className="text-xs text-muted-foreground">
              +3 este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Descargas Totales</CardTitle>
            <Download className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {resources.reduce((sum, r) => sum + r.downloads, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              +15% vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorías</CardTitle>
            <Tag className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length - 1}</div>
            <p className="text-xs text-muted-foreground">
              Diferentes temas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tamaño Total</CardTitle>
            <Globe className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">161.5 MB</div>
            <p className="text-xs text-muted-foreground">
              Almacenamiento usado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Biblioteca de Recursos</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar recursos..."
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map((resource) => (
                  <Card key={resource.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(resource.type)}
                          <Badge variant="outline">{resource.category}</Badge>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Eye className="h-4 w-4" />
                          <span>{resource.downloads}</span>
                        </div>
                      </div>
                      <CardTitle className="text-lg">{resource.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {resource.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>{resource.author}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(resource.uploadDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {resource.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {resource.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{resource.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {resource.size}
                          </span>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              Ver
                            </Button>
                            <Button size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              Descargar
                            </Button>
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
