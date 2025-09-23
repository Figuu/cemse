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
} from "lucide-react";
import { useResources } from "@/hooks/useResources";
import { ResourceForm } from "@/components/resources/ResourceForm";
import { ResourceDetailsModal } from "@/components/resources/ResourceDetailsModal";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useQuery } from "@tanstack/react-query";

function ResourcesPageContent() {
  const { data: session, status: sessionStatus } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedMunicipality, setSelectedMunicipality] = useState("all");
  const [showForm, setShowForm] = useState(false);

  // Fetch municipality institutions for the filter
  const { data: municipalityInstitutions = [] } = useQuery({
    queryKey: ['municipality-institutions-resources'],
    queryFn: async () => {
      const response = await fetch('/api/admin/institutions');
      if (!response.ok) throw new Error('Failed to fetch institutions');
      const institutions = await response.json();
      // Filter only municipality type institutions
      return institutions.filter((institution: any) => institution.institutionType === 'MUNICIPALITY');
    }
  });
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
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="flex items-center justify-center h-48 sm:h-64">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }


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

  // Filter resources by municipality (based on creator's associated institution)
  const filteredResources = resources.filter(resource => {
    if (selectedMunicipality === "all") return true;
    return resource.createdBy?.profile?.institution?.name === selectedMunicipality;
  });

  const categories = [
    { id: "all", name: "Todos", count: filteredResources.length },
    { id: "Tecnología", name: "Tecnología", count: filteredResources.filter(r => r.category === "Tecnología").length },
    { id: "Marketing", name: "Marketing", count: filteredResources.filter(r => r.category === "Marketing").length },
    { id: "Empleo", name: "Empleo", count: filteredResources.filter(r => r.category === "Empleo").length },
    { id: "Emprendimiento", name: "Emprendimiento", count: filteredResources.filter(r => r.category === "Emprendimiento").length },
    { id: "Educación", name: "Educación", count: filteredResources.filter(r => r.category === "Educación").length },
    { id: "Salud", name: "Salud", count: filteredResources.filter(r => r.category === "Salud").length },
    { id: "Finanzas", name: "Finanzas", count: filteredResources.filter(r => r.category === "Finanzas").length },
    { id: "Recursos Humanos", name: "Recursos Humanos", count: filteredResources.filter(r => r.category === "Recursos Humanos").length },
    { id: "Otros", name: "Otros", count: filteredResources.filter(r => r.category === "Otros").length }
  ];

  const types = [
    { id: "all", name: "Todos", count: filteredResources.length },
    { id: "PDF", name: "PDF", count: filteredResources.filter(r => r.type === "PDF").length },
    { id: "Video", name: "Video", count: filteredResources.filter(r => r.type === "Video").length },
    { id: "Image", name: "Imagen", count: filteredResources.filter(r => r.type === "Image").length },
    { id: "ZIP", name: "ZIP", count: filteredResources.filter(r => r.type === "ZIP").length },
    { id: "DOC", name: "Documento", count: filteredResources.filter(r => r.type === "DOC").length },
    { id: "URL", name: "Enlace", count: filteredResources.filter(r => r.type === "URL").length }
  ];

  const statuses = [
    { id: "all", name: "Todos", count: filteredResources.length },
    { id: "PUBLISHED", name: "Publicados", count: filteredResources.filter(r => r.status === "PUBLISHED").length },
    { id: "DRAFT", name: "Borradores", count: filteredResources.filter(r => r.status === "DRAFT").length },
    { id: "ARCHIVED", name: "Archivados", count: filteredResources.filter(r => r.status === "ARCHIVED").length }
  ];

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
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="flex items-center justify-center h-48 sm:h-64">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="flex items-center justify-center h-48 sm:h-64">
          <div className="text-center">
            <p className="text-red-600 mb-2 text-sm sm:text-base">Error al cargar recursos</p>
            <p className="text-xs sm:text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Recursos</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            {isYouth 
              ? "Explora nuestra biblioteca de recursos educativos y materiales de apoyo"
              : "Gestiona tus recursos educativos y materiales de apoyo"
            }
          </p>
        </div>
        {canManageResources && (
          <div className="flex items-center space-x-2">
            <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Crear Recurso
            </Button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Recursos</CardTitle>
            <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-lg sm:text-2xl font-bold">{resources.length}</div>
            <p className="text-xs text-muted-foreground">
              {isYouth ? "Disponibles" : "En tu biblioteca"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Descargas Totales</CardTitle>
            <Download className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-lg sm:text-2xl font-bold">
              {resources.reduce((sum, r) => sum + r.downloads, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {isYouth ? "Descargas realizadas" : "De tus recursos"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Categorías</CardTitle>
            <Tag className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-lg sm:text-2xl font-bold">{categories.length - 1}</div>
            <p className="text-xs text-muted-foreground">
              Diferentes temas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Publicados</CardTitle>
            <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-lg sm:text-2xl font-bold">
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
        <CardHeader className="p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-base sm:text-lg">
              {isYouth ? "Biblioteca de Recursos" : "Mis Recursos"}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4" />
                <Input
                  placeholder="Buscar recursos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 sm:pl-10 w-full sm:w-64 text-sm sm:text-base"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <div className="space-y-4">
            {/* Filter Controls */}
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <div className="flex items-center space-x-2 min-w-0 flex-1 sm:flex-none">
                <Label className="text-xs sm:text-sm whitespace-nowrap">Categoría:</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-40 text-xs sm:text-sm">
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

              <div className="flex items-center space-x-2 min-w-0 flex-1 sm:flex-none">
                <Label className="text-xs sm:text-sm whitespace-nowrap">Municipio:</Label>
                <Select value={selectedMunicipality} onValueChange={setSelectedMunicipality}>
                  <SelectTrigger className="w-full sm:w-40 text-xs sm:text-sm">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los municipios</SelectItem>
                    {municipalityInstitutions.map((institution: any) => (
                      <SelectItem key={institution.id} value={institution.name}>
                        {institution.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 min-w-0 flex-1 sm:flex-none">
                <Label className="text-xs sm:text-sm whitespace-nowrap">Tipo:</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-full sm:w-40 text-xs sm:text-sm">
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
                <div className="flex items-center space-x-2 min-w-0 flex-1 sm:flex-none">
                  <Label className="text-xs sm:text-sm whitespace-nowrap">Estado:</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-full sm:w-40 text-xs sm:text-sm">
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
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 h-auto">
                {categories.slice(0, 5).map((category) => (
                  <TabsTrigger key={category.id} value={category.id} className="text-xs sm:text-sm py-2 px-2">
                    <span className="truncate">{category.name}</span>
                    <span className="ml-1">({category.count})</span>
                  </TabsTrigger>
                ))}
              </TabsList>

            <TabsContent value={selectedCategory} className="mt-4 sm:mt-6">
              {resources.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <FileText className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-base sm:text-lg font-semibold mb-2">
                    {isYouth ? "No hay recursos disponibles" : "No tienes recursos creados"}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                    {isYouth 
                      ? "Los recursos aparecerán aquí cuando estén disponibles"
                      : "Crea tu primer recurso para comenzar"
                    }
                  </p>
                  {canManageResources && (
                    <Button onClick={() => setShowForm(true)} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Primer Recurso
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {filteredResources.map((resource) => (
                    <Card key={resource.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3 p-4 sm:p-6">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center space-x-2 min-w-0 flex-1">
                            {getTypeIcon(resource.type)}
                            <div className="flex flex-wrap gap-1">
                              <Badge variant="outline" className="text-xs">{resource.category}</Badge>
                              {canManageResources && (
                                <Badge className={`text-xs ${getStatusColor(resource.status)}`}>
                                  {getStatusLabel(resource.status)}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 text-xs sm:text-sm text-muted-foreground flex-shrink-0">
                            <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>{resource.downloads}</span>
                          </div>
                        </div>
                        <CardTitle className="text-base sm:text-lg mt-3">{resource.title}</CardTitle>
                        <CardDescription className="line-clamp-2 text-xs sm:text-sm">
                          {resource.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0 p-4 sm:p-6">
                        <div className="space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <User className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              <span className="truncate">{resource.createdBy?.firstName} {resource.createdBy?.lastName}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
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
                          
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex flex-col sm:flex-row gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewResource(resource)}
                                className="text-xs sm:text-sm"
                              >
                                <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
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
                                className="text-xs sm:text-sm"
                              >
                                <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                Descargar
                              </Button>
                            </div>
                          </div>

                          {canManageResources && (
                            <div className="flex flex-wrap justify-end gap-2 pt-2 border-t">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditResource(resource)}
                                className="text-xs sm:text-sm"
                              >
                                <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                Editar
                              </Button>
                              {resource.status === "DRAFT" && (
                                <Button 
                                  size="sm"
                                  onClick={() => handlePublishResource(resource.id)}
                                  className="text-xs sm:text-sm"
                                >
                                  <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                  Publicar
                                </Button>
                              )}
                              {resource.status === "PUBLISHED" && (
                                <Button 
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUnpublishResource(resource.id)}
                                  className="text-xs sm:text-sm"
                                >
                                  <EyeOff className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                  Despublicar
                                </Button>
                              )}
                              <Button 
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteResource(resource.id)}
                                className="text-xs sm:text-sm"
                              >
                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
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

export default function ResourcesPage() {
  return (
    <RoleGuard allowedRoles={["YOUTH", "COMPANIES", "INSTITUTION", "SUPERADMIN"]}>
      <ResourcesPageContent />
    </RoleGuard>
  );
}
