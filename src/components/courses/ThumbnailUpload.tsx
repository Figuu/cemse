"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { 
  Upload, 
  Image as ImageIcon, 
  X, 
  CheckCircle,
  AlertCircle,
  FileImage,
  Trash2,
  Eye
} from "lucide-react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

interface ThumbnailUploadProps {
  onThumbnailUploaded: (thumbnailUrl: string) => void;
  onThumbnailRemoved: () => void;
  initialThumbnailUrl?: string;
  disabled?: boolean;
}

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg", 
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml"
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const RECOMMENDED_DIMENSIONS = "1200x675 (16:9 aspect ratio)";

export const ThumbnailUpload = ({ 
  onThumbnailUploaded, 
  onThumbnailRemoved, 
  initialThumbnailUrl,
  disabled = false 
}: ThumbnailUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(initialThumbnailUrl || null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileSelect = useCallback((file: File) => {
    // Validate file type
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      alert("Por favor selecciona un archivo de imagen válido (JPEG, PNG, GIF, WebP, SVG)");
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      alert("El archivo es demasiado grande. El tamaño máximo es 10MB");
      return;
    }

    setSelectedFile(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }, []);

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [disabled, handleFileSelect]);

  const handleUpload = async () => {
    if (!selectedFile || !session?.user?.id) return;

    setIsLoading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("category", "course-thumbnail");

      const response = await fetch("/api/files/minio/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload file");
      }

      const result = await response.json();
      if (result.success && result.file) {
        setThumbnailUrl(result.file.url);
        onThumbnailUploaded(result.file.url);
        setSelectedFile(null);
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveThumbnail = () => {
    setThumbnailUrl(null);
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    onThumbnailRemoved();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileTypeIcon = (file: File) => {
    return <FileImage className="h-8 w-8 text-green-500" />;
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label>Imagen de Portada</Label>
        <p className="text-xs text-gray-500">
          Dimensiones recomendadas: {RECOMMENDED_DIMENSIONS}
        </p>
      </div>
      
      {!thumbnailUrl ? (
        <Card 
          className={cn(
            "border-2 border-dashed transition-colors",
            dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <CardContent className="p-6">
            {selectedFile ? (
              <div className="space-y-4">
                {/* Selected File Preview */}
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  {getFileTypeIcon(selectedFile)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedFile(null);
                      if (previewUrl) {
                        URL.revokeObjectURL(previewUrl);
                        setPreviewUrl(null);
                      }
                    }}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Image Preview */}
                {previewUrl && (
                  <div className="relative w-full h-48">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-cover rounded-lg border"
                    />
                    <div className="absolute top-2 right-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          const newWindow = window.open();
                          if (newWindow) {
                            newWindow.document.write(`
                              <html>
                                <head><title>Vista Previa</title></head>
                                <body style="margin:0; padding:20px; text-align:center;">
                                  <img src="${previewUrl}" style="max-inline-size:100%; max-block-size:90vh; object-fit:contain;" />
                                </body>
                              </html>
                            `);
                          }
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Upload Error */}
                {uploadError && (
                  <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-700">{uploadError}</span>
                  </div>
                )}

                {/* Upload Button */}
                <Button
                  type="button"
                  onClick={handleUpload}
                  disabled={isLoading || disabled}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Upload className="h-4 w-4 mr-2 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Subir Imagen
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900">
                    Arrastra y suelta tu imagen aquí
                  </p>
                  <p className="text-sm text-gray-500">
                    o haz clic para seleccionar un archivo
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mt-3">
                    {ACCEPTED_IMAGE_TYPES.map((type) => (
                      <Badge key={type} variant="secondary" className="text-xs">
                        {type.split('/')[1].toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Tamaño máximo: 10MB
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled}
                >
                  Seleccionar Archivo
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Imagen de Portada
              </CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveThumbnail}
                disabled={disabled}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Thumbnail Preview */}
            <div className="relative w-full h-48">
              <Image
                src={thumbnailUrl}
                alt="Course thumbnail"
                fill
                className="object-cover rounded-lg border"
              />
              <div className="absolute top-2 right-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const newWindow = window.open();
                    if (newWindow) {
                      newWindow.document.write(`
                        <html>
                          <head><title>Vista Previa</title></head>
                          <body style="margin:0; padding:20px; text-align:center;">
                            <img src="${thumbnailUrl}" style="max-inline-size:100%; max-block-size:90vh; object-fit:contain;" />
                          </body>
                        </html>
                      `);
                    }
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Success Message */}
            <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-700">
                Imagen subida exitosamente
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hidden File Input */}
      <Input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
};
