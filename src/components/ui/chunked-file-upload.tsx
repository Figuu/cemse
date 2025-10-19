"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  File, 
  Image, 
  FileText, 
  X, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Pause,
  Play,
  RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useChunkedUpload } from "@/hooks/useChunkedUpload";

interface ChunkedFileUploadProps {
  onUploadComplete: (fileUrl: string) => void;
  onUploadError?: (error: string) => void;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number; // in bytes
  chunkSize?: number; // in bytes
  category: string;
  className?: string;
  disabled?: boolean;
}

interface UploadedFile {
  file: File;
  id: string;
  status: "pending" | "uploading" | "success" | "error" | "paused";
  progress: number;
  error?: string;
  fileUrl?: string;
}

export function ChunkedFileUpload({
  onUploadComplete,
  onUploadError,
  accept = {
    "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    "application/pdf": [".pdf"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"]
  },
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  chunkSize = 512 * 1024, // 512KB chunks (Next.js App Router has 1MB FormData limit)
  category,
  className,
  disabled = false
}: ChunkedFileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const { uploadFile, progress, error, reset } = useChunkedUpload({
    chunkSize,
    onProgress: (progress) => {
      setUploadedFiles(prev => 
        prev.map(f => 
          f.status === "uploading" 
            ? { ...f, progress }
            : f
        )
      );
    },
    onChunkComplete: (chunkIndex, totalChunks) => {
      console.log(`Chunk ${chunkIndex}/${totalChunks} completed`);
    }
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: "pending",
      progress: 0
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize,
    disabled: disabled || isUploading
  });

  const handleUpload = async (fileItem: UploadedFile) => {
    if (fileItem.status !== "pending") return;

    setIsUploading(true);
    
    // Update status to uploading
    setUploadedFiles(prev => 
      prev.map(f => 
        f.id === fileItem.id 
          ? { ...f, status: "uploading" as const, progress: 0 }
          : f
      )
    );

    try {
      const result = await uploadFile(fileItem.file, category, (fileUrl) => {
        // Update status to success
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileItem.id 
              ? { ...f, status: "success" as const, progress: 100, fileUrl }
              : f
          )
        );
        
        onUploadComplete(fileUrl);
      });

      // Update status to success
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, status: "success" as const, progress: 100, fileUrl: result.fileUrl }
            : f
        )
      );

    } catch (error) {
      // Update status to error
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === fileItem.id 
            ? { 
                ...f, 
                status: "error" as const, 
                error: error instanceof Error ? error.message : "Error al subir archivo"
              }
            : f
        )
      );
      
      onUploadError?.(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadAll = async () => {
    const pendingFiles = uploadedFiles.filter(f => f.status === "pending");
    
    for (const fileItem of pendingFiles) {
      await handleUpload(fileItem);
    }
  };

  const pauseUpload = (id: string) => {
    setUploadedFiles(prev => 
      prev.map(f => 
        f.id === id && f.status === "uploading" 
          ? { ...f, status: "paused" as const }
          : f
      )
    );
  };

  const resumeUpload = (fileItem: UploadedFile) => {
    if (fileItem.status === "paused") {
      handleUpload(fileItem);
    }
  };

  const retryUpload = (fileItem: UploadedFile) => {
    if (fileItem.status === "error") {
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, status: "pending" as const, progress: 0, error: undefined }
            : f
        )
      );
      handleUpload({ ...fileItem, status: "pending", progress: 0 });
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <Image className="h-4 w-4" aria-label="Image file" />;
    } else if (file.type === "application/pdf") {
      return <FileText className="h-4 w-4" />;
    } else {
      return <File className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const pendingFiles = uploadedFiles.filter(f => f.status === "pending");
  const uploadingFiles = uploadedFiles.filter(f => f.status === "uploading");
  const hasUploadedFiles = uploadedFiles.length > 0;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop Zone */}
      <Card
        {...getRootProps()}
        className={cn(
          "cursor-pointer transition-colors",
          isDragActive && "border-primary bg-primary/5",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
      >
        <CardContent className="p-6">
          <div className="text-center">
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
            <div className="mt-4">
              <p className="text-sm font-medium">
                {isDragActive
                  ? "Suelta los archivos aquí..."
                  : "Arrastra archivos aquí o haz clic para seleccionar"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG, PDF, DOC, DOCX hasta {formatFileSize(maxSize)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Subida por partes para archivos grandes
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {hasUploadedFiles && (
        <div className="space-y-2">
          {uploadedFiles.map(file => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {getFileIcon(file.file)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {file.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.file.size)}
                  </p>
                  {file.status === "uploading" && (
                    <div className="mt-1">
                      <Progress value={file.progress} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {Math.round(file.progress)}% completado
                      </p>
                    </div>
                  )}
                  {file.error && (
                    <p className="text-xs text-red-600 mt-1">
                      {file.error}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {file.status === "pending" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpload(file)}
                    disabled={isUploading}
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    Subir
                  </Button>
                )}
                
                {file.status === "uploading" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => pauseUpload(file.id)}
                  >
                    <Pause className="h-4 w-4 mr-1" />
                    Pausar
                  </Button>
                )}
                
                {file.status === "paused" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => resumeUpload(file)}
                    disabled={isUploading}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Reanudar
                  </Button>
                )}
                
                {file.status === "success" && (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <Badge variant="outline" className="text-green-600">
                      Completado
                    </Badge>
                  </div>
                )}
                
                {file.status === "error" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => retryUpload(file)}
                    disabled={isUploading}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Reintentar
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.id)}
                  disabled={file.status === "uploading"}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload All Button */}
      {pendingFiles.length > 0 && (
        <Button
          onClick={handleUploadAll}
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Subiendo {uploadingFiles.length} archivo{uploadingFiles.length > 1 ? "s" : ""}...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Subir {pendingFiles.length} archivo{pendingFiles.length > 1 ? "s" : ""}
            </>
          )}
        </Button>
      )}

      {/* Global Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Progreso General</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <p className="text-sm text-red-600">{error}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            className="text-red-600 hover:text-red-700"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
