"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Globe,
  Plus,
  Edit,
  Trash2,
  EyeOff,
  X,
  Star
} from "lucide-react";
import { useResources } from "@/hooks/useResources";
import { ResourceForm } from "@/components/resources/ResourceForm";
import { ResourceDetailsModal } from "@/components/resources/ResourceDetailsModal";

export default function ResourcesPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState<any>(null);
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Role-based permissions
  const isYouth = session?.user?.role === "YOUTH";
  const isInstitution = session?.user?.role === "INSTITUTION";
  const isSuperAdmin = session?.user?.role === "SUPERADMIN";
  const isCompany = session?.user?.role === "COMPANIES";
  const canManageResources = isInstitution || isSuperAdmin || isCompany;

  // Use resources hook
  const { 
    resources, 
    isLoading, 
    error, 
    createResource, 
    updateResource, 
    deleteResource, 
    publishResource, 
    unpublishResource 
  } = useResources({
    search: searchTerm || undefined,
    category: selectedCategory !== "all" ? selectedCategory : undefined,
    type: selectedType !== "all" ? selectedType : undefined,
    status: selectedStatus !== "all" ? selectedStatus : undefined,
    authorId: isYouth ? undefined : session?.user?.id, // Youth sees all, others see their own
  });

  // Show loading while session is loading
  if (sessionStatus === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const categories = [
    { id: "all", name: "Todos", count: resources.length },
    { id: "Tecnología", name: "Tecnología", count: resources.filter(r => r.category === "Tecnología").length },
    { id: "Marketing", name: "Marketing", count: resources.filter(r => r.category === "Marketing").length },
    { id: "Empleo", name: "Empleo", count: resources.filter(r => r.category === "Empleo").length },
    { id: "Emprendimiento", name: "Emprendimiento", count: resources.filter(r => r.category === "Emprendimiento").length },
    { id: "Educación", name: "Educación", count: resources.filter(r => r.category === "Educación").length },
    { id: "Salud", name: "Salud", count: resources.filter(r => r.category === "Salud").length },
    { id: "Finanzas", name: "Finanzas", count: resources.filter(r => r.category === "Finanzas").length },
    { id: "Recursos Humanos", name: "Recursos Humanos", count: resources.filter(r => r.category === "Recursos Humanos").length },
    { id: "Otros", name: "Otros", count: resources.filter(r => r.category === "Otros").length }
  ];

  const types = [
    { id: "all", name: "Todos", count: resources.length },
    { id: "PDF", name: "PDF", count: resources.filter(r => r.type === "PDF").length },
    { id: "Video", name: "Video", count: resources.filter(r => r.type === "Video").length },
    { id: "Image", name: "Imagen", count: resources.filter(r => r.type === "Image").length },
    { id: "ZIP", name: "ZIP", count: resources.filter(r => r.type === "ZIP").length },
    { id: "DOC", name: "Documento", count: resources.filter(r => r.type === "DOC").length },
    { id: "URL", name: "Enlace", count: resources.filter(r => r.type === "URL").length }
  ];

  const statuses = [
    { id: "all", name: "Todos", count: resources.length },
    { id: "PUBLISHED", name: "Publicados", count: resources.filter(r => r.status === "PUBLISHED").length },
    { id: "DRAFT", name: "Borradores", count: resources.filter(r => r.status === "DRAFT").length },
    { id: "ARCHIVED", name: "Archivados", count: resources.filter(r => r.status === "ARCHIVED").length }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "PDF":
      case "DOC":
      case "PPT":
      case "XLS":
        return <FileText className="h-5 w-5 text-red-500" />;
      case "Video":
        return <Video className="h-5 w-5 text-blue-500" />;
      case "ZIP":
        return <File className="h-5 w-5 text-purple-500" />;
      case "Image":
        return <Image className="h-5 w-5 text-green-500" />;
      case "URL":
        return <Globe className="h-5 w-5 text-orange-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED": return "bg-green-100 text-green-800";
      case "DRAFT": return "bg-yellow-100 text-yellow-800";
      case "ARCHIVED": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PUBLISHED": return "Publicado";
      case "DRAFT": return "Borrador";
      case "ARCHIVED": return "Archivado";
      default: return status;
    }
  };

  // Event handlers
  const handleCreateResource = async (data: any) => {
    const success = await createResource(data);
    if (success) {
      setShowForm(false);
      setEditingResource(null);
    }
  };

  const handleUpdateResource = async (data: any) => {
    const success = await updateResource(editingResource.id, data);
    if (success) {
      setShowForm(false);
      setEditingResource(null);
    }
  };

  const handleDeleteResource = async (id: string) => {
    return await deleteResource(id);
  };

  const handlePublishResource = async (id: string) => {
    return await publishResource(id);
  };

  const handleUnpublishResource = async (id: string) => {
    return await unpublishResource(id);
  };

  const handleViewResource = (resource: any) => {
    setSelectedResource(resource);
    setShowDetailsModal(true);
  };

  const handleEditResource = (resource: any) => {
    setEditingResource(resource);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingResource(null);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedResource(null);
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
          <p className="text-red-600 mb-2">Error al cargar recursos</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recursos</h1>
          <p className="text-muted-foreground">
            {isYouth 
              ? "Explora nuestra biblioteca de recursos educativos y materiales de apoyo"
              : "Gestiona tus recursos educativos y materiales de apoyo"
            }
          </p>
        </div>
        {canManageResources && (
          <div className="flex items-center space-x-2">
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Recurso
            </Button>
          </div>
        )}
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
              {isYouth ? "Disponibles" : "En tu biblioteca"}
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
              {isYouth ? "Descargas realizadas" : "De tus recursos"}
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
            <CardTitle className="text-sm font-medium">Publicados</CardTitle>
            <Eye className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {resources.filter(r => r.status === "PUBLISHED").length}
            </div>
            <p className="text-xs text-muted-foreground">
              {isYouth ? "Disponibles" : "En tu biblioteca"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {isYouth ? "Biblioteca de Recursos" : "Mis Recursos"}
            </CardTitle>
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
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filter Controls */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Label>Categoría:</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name} ({category.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Label>Tipo:</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name} ({type.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {canManageResources && (
                <div className="flex items-center space-x-2">
                  <Label>Estado:</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status.id} value={status.id}>
                          {status.name} ({status.count})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Resources Grid */}
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="grid w-full grid-cols-5">
                {categories.slice(0, 5).map((category) => (
                  <TabsTrigger key={category.id} value={category.id}>
                    {category.name} ({category.count})
                  </TabsTrigger>
                ))}
              </TabsList>

            <TabsContent value={selectedCategory} className="mt-6">
              {resources.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">
                    {isYouth ? "No hay recursos disponibles" : "No tienes recursos creados"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {isYouth 
                      ? "Los recursos aparecerán aquí cuando estén disponibles"
                      : "Crea tu primer recurso para comenzar"
                    }
                  </p>
                  {canManageResources && (
                    <Button onClick={() => setShowForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Primer Recurso
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {resources.map((resource) => (
                    <Card key={resource.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(resource.type)}
                            <Badge variant="outline">{resource.category}</Badge>
                            {canManageResources && (
                              <Badge className={getStatusColor(resource.status)}>
                                {getStatusLabel(resource.status)}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <Download className="h-4 w-4" />
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
                              <span>{resource.createdBy?.firstName} {resource.createdBy?.lastName}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(resource.publishedDate || resource.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          {resource.tags && resource.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {resource.tags.slice(0, 3).map((tag: string) => (
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
                          )}
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm text-muted-foreground">
                                {resource.rating}/5
                              </span>
                            </div>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewResource(resource)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Ver
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => {
                                  if (resource.downloadUrl) {
                                    window.open(resource.downloadUrl, '_blank');
                                  } else if (resource.externalUrl) {
                                    window.open(resource.externalUrl, '_blank');
                                  }
                                }}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Descargar
                              </Button>
                            </div>
                          </div>

                          {canManageResources && (
                            <div className="flex justify-end space-x-2 pt-2 border-t">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditResource(resource)}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Editar
                              </Button>
                              {resource.status === "DRAFT" && (
                                <Button 
                                  size="sm"
                                  onClick={() => handlePublishResource(resource.id)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Publicar
                                </Button>
                              )}
                              {resource.status === "PUBLISHED" && (
                                <Button 
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUnpublishResource(resource.id)}
                                >
                                  <EyeOff className="h-4 w-4 mr-1" />
                                  Despublicar
                                </Button>
                              )}
                              <Button 
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteResource(resource.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Eliminar
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Resource Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <ResourceForm
              initialData={editingResource}
              onSubmit={editingResource ? handleUpdateResource : handleCreateResource}
              onCancel={handleCloseForm}
            />
          </div>
        </div>
      )}

      {/* Resource Details Modal */}
      {showDetailsModal && selectedResource && (
        <ResourceDetailsModal
          resource={selectedResource}
          onClose={handleCloseDetailsModal}
          onEdit={canManageResources ? handleEditResource : undefined}
          onDelete={canManageResources ? handleDeleteResource : undefined}
          onPublish={canManageResources ? handlePublishResource : undefined}
          onUnpublish={canManageResources ? handleUnpublishResource : undefined}
          canEdit={canManageResources}
          canDelete={canManageResources}
          canPublish={canManageResources}
        />
      )}
    </div>
  );
}
