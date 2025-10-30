"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Trash2,
  File,
  FileSpreadsheet,
  FileImage,
  Download
} from "lucide-react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

interface ResourceFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
}

interface ResourceUploadProps {
  onResourcesChange: (resources: ResourceFile[]) => void;
  initialResources?: ResourceFile[];
  disabled?: boolean;
}

const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-powerpoint",
  "application/zip",
  "application/x-zip-compressed",
  "text/plain",
  "image/png",
  "image/jpeg",
  "image/jpg"
];

const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB (increased for large PDFs and documents)

export const ResourceUpload = ({
  onResourcesChange,
  initialResources = [],
  disabled = false
}: ResourceUploadProps) => {
  const [resources, setResources] = useState<ResourceFile[]>(
    Array.isArray(initialResources) ? initialResources : []
  );
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: session } = useSession();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<{ [key: string]: number }>({});
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Update resources when initialResources changes
  useEffect(() => {
    if (Array.isArray(initialResources)) {
      setResources(initialResources);
    }
  }, [initialResources]);

  const handleFileSelect = useCallback((files: FileList) => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    Array.from(files).forEach(file => {
      // Validate file type
      if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        errors.push(`${file.name}: Tipo de archivo no permitido`);
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: El archivo excede el tamaño máximo de 200MB`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      setUploadError(errors.join(", "));
      setTimeout(() => setUploadError(null), 5000);
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
      setUploadError(null);
    }
  }, []);

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
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

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  }, [disabled, handleFileSelect]);

  const uploadFile = async (file: File): Promise<ResourceFile | null> => {
    try {
      console.log("Uploading file:", file.name, "Type:", file.type, "Size:", file.size);

      // Use regular multipart upload for all files since nginx is configured for 1GB
      // This is more efficient than base64 encoding
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", "course-resource");

      // Create XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();

      return new Promise<ResourceFile | null>((resolve, reject) => {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            setProgress(prev => ({ ...prev, [file.name]: percentComplete }));
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            try {
              const result = JSON.parse(xhr.responseText);
              if (result.success && result.file) {
                const resourceFile: ResourceFile = {
                  id: result.file.id,
                  name: file.name,
                  url: result.file.url,
                  size: file.size,
                  type: file.type,
                  uploadedAt: result.file.uploadedAt
                };
                setProgress(prev => ({ ...prev, [file.name]: 100 }));
                resolve(resourceFile);
              } else {
                reject(new Error("Upload failed"));
              }
            } catch (e) {
              reject(new Error("Invalid server response"));
            }
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText);
              console.error("Upload error:", errorData);
              reject(new Error(errorData.error || "Upload failed"));
            } catch (e) {
              // If response is not JSON (e.g., HTML error page)
              console.error("Upload failed - HTML response:", xhr.responseText.substring(0, 200));
              console.error("Status:", xhr.status);

              // Provide specific error messages based on status code
              if (xhr.status === 413) {
                reject(new Error(`Archivo demasiado grande. El límite es 200MB. Si el problema persiste, contacta al administrador.`));
              } else {
                reject(new Error(`Error al subir archivo. Código: ${xhr.status}`));
              }
            }
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Error de red al subir archivo"));
        });

        xhr.open("POST", "/api/files/minio/upload");
        xhr.send(formData);
      });
    } catch (error) {
      console.error("Upload failed:", error);
      return null;
    }
  };

  const handleUploadAll = async () => {
    if (selectedFiles.length === 0 || !session?.user?.id) return;

    setIsUploading(true);
    setUploadError(null);
    setProgress({});

    try {
      const uploadPromises = selectedFiles.map(file => uploadFile(file));
      const results = await Promise.all(uploadPromises);

      const successfulUploads = results.filter((r): r is ResourceFile => r !== null);

      if (successfulUploads.length > 0) {
        const updatedResources = [...resources, ...successfulUploads];
        setResources(updatedResources);
        onResourcesChange(updatedResources);
        setSelectedFiles([]);
        setProgress({});
      }

      if (successfulUploads.length < selectedFiles.length) {
        setUploadError(`${selectedFiles.length - successfulUploads.length} archivo(s) fallaron al subirse`);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveSelected = (fileName: string) => {
    setSelectedFiles(prev => prev.filter(f => f.name !== fileName));
    setProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileName];
      return newProgress;
    });
  };

  const handleRemoveResource = (resourceId: string) => {
    const updatedResources = resources.filter(r => r.id !== resourceId);
    setResources(updatedResources);
    onResourcesChange(updatedResources);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return <FileText className="h-5 w-5 text-red-500" />;
    if (type.includes("word") || type.includes("document")) return <FileText className="h-5 w-5 text-blue-500" />;
    if (type.includes("sheet") || type.includes("excel")) return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
    if (type.includes("image")) return <FileImage className="h-5 w-5 text-purple-500" />;
    if (type.includes("zip")) return <File className="h-5 w-5 text-orange-500" />;
    return <File className="h-5 w-5 text-gray-500" />;
  };

  return (
    <div className="space-y-4">
      <Label>Recursos Adjuntos (máx. 200MB por archivo)</Label>

      {/* Upload Area */}
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
          <div className="text-center">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900">
                Arrastra y suelta tus archivos aquí
              </p>
              <p className="text-sm text-gray-500">
                o haz clic para seleccionar archivos
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-3">
                <Badge variant="secondary" className="text-xs">PDF</Badge>
                <Badge variant="secondary" className="text-xs">DOC</Badge>
                <Badge variant="secondary" className="text-xs">DOCX</Badge>
                <Badge variant="secondary" className="text-xs">XLS</Badge>
                <Badge variant="secondary" className="text-xs">XLSX</Badge>
                <Badge variant="secondary" className="text-xs">PPT</Badge>
                <Badge variant="secondary" className="text-xs">PPTX</Badge>
                <Badge variant="secondary" className="text-xs">ZIP</Badge>
                <Badge variant="secondary" className="text-xs">TXT</Badge>
                <Badge variant="secondary" className="text-xs">IMG</Badge>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Tamaño máximo por archivo: 200MB
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isUploading}
            >
              Seleccionar Archivos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Selected Files (Pending Upload) */}
      {selectedFiles.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Archivos Seleccionados ({selectedFiles.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div key={`${file.name}-${index}`} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                {getFileIcon(file.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                  {progress[file.name] !== undefined && (
                    <Progress value={progress[file.name]} className="w-full mt-2 h-1" />
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveSelected(file.name)}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {uploadError && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-700">{uploadError}</span>
              </div>
            )}

            <Button
              type="button"
              onClick={handleUploadAll}
              disabled={isUploading || disabled}
              className="w-full mt-2"
            >
              {isUploading ? (
                <>
                  <Upload className="h-4 w-4 mr-2 animate-spin" />
                  Subiendo {selectedFiles.length} archivo(s)...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Subir {selectedFiles.length} archivo(s)
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Uploaded Resources */}
      {resources.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Recursos Subidos ({resources.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {resources.map((resource) => (
              <div key={resource.id} className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                {getFileIcon(resource.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {resource.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(resource.size)}
                  </p>
                </div>
                <a
                  href={resource.url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-green-100 rounded"
                >
                  <Download className="h-4 w-4 text-green-600" />
                </a>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveResource(resource.id)}
                  disabled={disabled}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Hidden File Input */}
      <Input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_FILE_TYPES.join(",")}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
        multiple
      />
    </div>
  );
};
