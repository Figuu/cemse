"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  Download, 
  Trash2, 
  Eye, 
  Search, 
  Filter,
  File,
  Image,
  Video,
  Music,
  FileText,
  Globe,
  HardDrive,
  BarChart3,
  RefreshCw
} from "lucide-react";
import { useMinIO } from "@/hooks/useMinIO";
import { BUCKETS, minioClient, MinIOObject } from "@/lib/minioClientService";

interface MinIOFile {
  url: string;
  bucket: string;
  key: string;
  originalName: string;
  size: number;
  type: string;
}

interface MinIOStats {
  buckets?: Record<string, { size: number; fileCount: number }>;
  totalSize?: number;
  totalFiles?: number;
}

export function MinIOFileManager() {
  const {
    uploadFile,
    listFiles,
    deleteFile,
    getPresignedUrl,
    getStats,
    isLoading,
    error,
    clearError
  } = useMinIO();

  const [files, setFiles] = useState<MinIOFile[]>([]);
  const [stats, setStats] = useState<MinIOStats | null>(null);
  const [selectedBucket, setSelectedBucket] = useState<string>("uploads");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    loadFiles();
    loadStats();
  }, [selectedBucket]);

  const loadFiles = async () => {
    const result = await listFiles(selectedBucket);
    if (result) {
      setFiles(result);
    }
  };

  const loadStats = async () => {
    const result = await getStats();
    if (result) {
      setStats(result);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadProgress(0);
    
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 10, 90));
    }, 100);

    const result = await uploadFile(file, selectedBucket);
    
    clearInterval(progressInterval);
    setUploadProgress(100);

    if (result) {
      await loadFiles();
      await loadStats();
    }

    // Reset progress after a delay
    setTimeout(() => setUploadProgress(0), 1000);
  };

  const handleDeleteFile = async (file: MinIOFile) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar ${file.originalName}?`)) return;

    const success = await deleteFile(file.bucket, file.key);
    if (success) {
      await loadFiles();
      await loadStats();
    }
  };

  const handleDownloadFile = async (file: MinIOFile) => {
    const presignedUrl = await getPresignedUrl(file.bucket, file.key);
    if (presignedUrl) {
      window.open(presignedUrl, '_blank');
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type.startsWith('video/')) return Video;
    if (type.startsWith('audio/')) return Music;
    if (type === 'application/pdf') return FileText;
    if (type.startsWith('text/')) return FileText;
    return File;
  };

  const getBucketLabel = (bucket: string) => {
    switch (bucket) {
      case 'uploads': return 'Subidas';
      case 'documents': return 'Documentos';
      case 'images': return 'Imágenes';
      case 'videos': return 'Videos';
      case 'audio': return 'Audio';
      case 'temp': return 'Temporales';
      default: return bucket;
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  };

  const filteredFiles = files.filter(file =>
    file.originalName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">MinIO File Manager</h2>
          <p className="text-muted-foreground">
            Gestiona archivos en el almacenamiento MinIO
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowStats(!showStats)}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Estadísticas
          </Button>
          <Button
            variant="outline"
            onClick={loadFiles}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Statistics */}
      {showStats && stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <HardDrive className="h-5 w-5 mr-2" />
              Estadísticas de Almacenamiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.buckets ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(stats.buckets).map(([bucket, data]) => (
                  <div key={bucket} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{getBucketLabel(bucket)}</h3>
                      <Badge variant="outline">{data.fileCount} archivos</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatFileSize(data.size)}
                    </div>
                  </div>
                ))}
                <div className="p-4 border rounded-lg bg-primary/5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Total</h3>
                    <Badge variant="default">{stats.totalFiles} archivos</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatFileSize(stats.totalSize || 0)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <HardDrive className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No hay estadísticas disponibles</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Bucket</label>
              <Select value={selectedBucket} onValueChange={setSelectedBucket}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(BUCKETS).map(bucket => (
                    <SelectItem key={bucket} value={bucket}>
                      {getBucketLabel(bucket)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar archivos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-end">
              <label className="text-sm font-medium mb-2 block w-full">
                Subir Archivo
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <Button asChild className="w-full">
                  <label htmlFor="file-upload">
                    <Upload className="h-4 w-4 mr-2" />
                    Seleccionar Archivo
                  </label>
                </Button>
              </label>
            </div>
            <div className="flex items-end">
              {uploadProgress > 0 && (
                <div className="w-full">
                  <div className="text-sm text-muted-foreground mb-2">
                    Subiendo... {uploadProgress}%
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-red-800">{error}</p>
              <Button variant="ghost" size="sm" onClick={clearError}>
                ✕
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Files Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFiles.map((file) => {
          const FileIcon = getFileIcon(file.type);
          return (
            <Card key={`${file.bucket}-${file.key}`} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileIcon className="h-8 w-8 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm truncate">
                        {file.originalName}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {formatFileSize(file.size)}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadFile(file)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(file.url, '_blank')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteFile(file)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Bucket:</span>
                    <Badge variant="outline">{getBucketLabel(file.bucket)}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Tipo:</span>
                    <span className="truncate">{file.type}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredFiles.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-12 text-center">
            <File className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No se encontraron archivos</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? "Intenta ajustar los términos de búsqueda"
                : "Sube tu primer archivo para comenzar"
              }
            </p>
            <Button onClick={() => document.getElementById('file-upload')?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Subir Archivo
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
