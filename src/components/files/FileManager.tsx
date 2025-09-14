"use client";

import { useState, useEffect } from "react";
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
  Trash2,
  Calendar,
  User,
  Tag,
  Image,
  File,
  MoreVertical,
  Grid,
  List
} from "lucide-react";
import { ChunkedFileUpload } from "@/components/ui/chunked-file-upload";
import { useProfileFiles } from "@/hooks/useProfileFiles";

interface FileManagerProps {
  className?: string;
}

export function FileManager({ className }: FileManagerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showUpload, setShowUpload] = useState(false);

  const { files, isLoading, error, uploadFile, deleteFile, viewFile, refetch } = useProfileFiles();

  const categories = [
    { id: "all", name: "Todos", count: files.length },
    { id: "profile-picture", name: "Fotos de Perfil", count: files.filter(f => f.category === "profile-picture").length },
    { id: "cv", name: "CVs", count: files.filter(f => f.category === "cv").length },
    { id: "certificate", name: "Certificados", count: files.filter(f => f.category === "certificate").length },
    { id: "other", name: "Otros", count: files.filter(f => f.category === "other").length }
  ];

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) {
      return <Image className="h-5 w-5 text-blue-500" />;
    } else if (type === "application/pdf") {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else {
      return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "profile-picture":
        return "bg-blue-100 text-blue-800";
      case "cv":
        return "bg-green-100 text-green-800";
      case "certificate":
        return "bg-purple-100 text-purple-800";
      case "other":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "profile-picture":
        return "Foto de Perfil";
      case "cv":
        return "CV";
      case "certificate":
        return "Certificado";
      case "other":
        return "Otro";
      default:
        return category;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || file.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUploadComplete = (fileUrl: string) => {
    console.log("File uploaded successfully:", fileUrl);
    refetch();
  };

  const handleUploadError = (error: string) => {
    console.error("Upload error:", error);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestión de Archivos</h2>
          <p className="text-muted-foreground">
            Administra tus archivos y documentos
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
          >
            {viewMode === "grid" ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
          <Button onClick={() => setShowUpload(!showUpload)}>
            <Upload className="h-4 w-4 mr-2" />
            Subir Archivos
          </Button>
        </div>
      </div>

      {/* Upload Section */}
      {showUpload && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Subir Archivos</CardTitle>
            <CardDescription>
              Selecciona el tipo de archivo que deseas subir
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="profile-picture" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile-picture">Foto de Perfil</TabsTrigger>
                <TabsTrigger value="cv">CV</TabsTrigger>
                <TabsTrigger value="certificate">Certificado</TabsTrigger>
                <TabsTrigger value="other">Otros</TabsTrigger>
              </TabsList>

              <TabsContent value="profile-picture">
                <ChunkedFileUpload
                  category="profile-picture"
                  onUploadComplete={handleUploadComplete}
                  onUploadError={handleUploadError}
                  accept={{ "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"] }}
                  maxSize={5 * 1024 * 1024} // 5MB
                />
              </TabsContent>

              <TabsContent value="cv">
                <ChunkedFileUpload
                  category="cv"
                  onUploadComplete={handleUploadComplete}
                  onUploadError={handleUploadError}
                  accept={{ 
                    "application/pdf": [".pdf"],
                    "application/msword": [".doc"],
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"]
                  }}
                  maxSize={10 * 1024 * 1024} // 10MB
                />
              </TabsContent>

              <TabsContent value="certificate">
                <ChunkedFileUpload
                  category="certificate"
                  onUploadComplete={handleUploadComplete}
                  onUploadError={handleUploadError}
                  accept={{ 
                    "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
                    "application/pdf": [".pdf"]
                  }}
                  maxSize={10 * 1024 * 1024} // 10MB
                />
              </TabsContent>

              <TabsContent value="other">
                <ChunkedFileUpload
                  category="other"
                  onUploadComplete={handleUploadComplete}
                  onUploadError={handleUploadError}
                  maxSize={10 * 1024 * 1024} // 10MB
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Archivos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{files.length}</div>
            <p className="text-xs text-muted-foreground">
              Archivos almacenados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tamaño Total</CardTitle>
            <File className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatFileSize(files.reduce((sum, f) => sum + f.size, 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              Almacenamiento usado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CVs</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {files.filter(f => f.category === "cv").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Documentos de CV
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificados</CardTitle>
            <Tag className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {files.filter(f => f.category === "certificate").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Certificados obtenidos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Mis Archivos</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar archivos..."
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
              {filteredFiles.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay archivos</h3>
                  <p className="text-muted-foreground">
                    {selectedCategory === "all" 
                      ? "Sube tu primer archivo para comenzar"
                      : `No hay archivos de tipo ${categories.find(c => c.id === selectedCategory)?.name}`
                    }
                  </p>
                </div>
              ) : (
                <div className={viewMode === "grid" 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  : "space-y-2"
                }>
                  {filteredFiles.map((file) => (
                    <Card key={file.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            {getFileIcon(file.type)}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium truncate">{file.name}</h3>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge className={getCategoryColor(file.category)}>
                                  {getCategoryLabel(file.category)}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatFileSize(file.size)}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                                <Calendar className="h-3 w-3" />
                                <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => viewFile(file.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(file.url, '_blank')}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteFile(file.id)}
                            >
                              <Trash2 className="h-4 w-4" />
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
        </CardContent>
      </Card>
    </div>
  );
}
