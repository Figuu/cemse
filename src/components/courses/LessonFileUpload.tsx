"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  File, 
  Image, 
  Video,
  Headphones,
  FileText, 
  X, 
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LessonFileUploadProps {
  contentType: "VIDEO" | "AUDIO" | "IMAGE" | "TEXT";
  onUpload: (file: File) => Promise<string>;
  onRemove?: () => void;
  currentUrl?: string;
  className?: string;
  disabled?: boolean;
}

interface UploadedFile {
  file: File;
  id: string;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  error?: string;
  url?: string;
}

export function LessonFileUpload({
  contentType,
  onUpload,
  onRemove,
  currentUrl,
  className,
  disabled = false
}: LessonFileUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const getAcceptTypes = () => {
    switch (contentType) {
      case "VIDEO":
        return {
          "video/*": [".mp4", ".avi", ".mov", ".wmv", ".flv", ".webm", ".mkv"]
        };
      case "AUDIO":
        return {
          "audio/*": [".mp3", ".wav", ".ogg", ".m4a", ".aac", ".flac"]
        };
      case "IMAGE":
        return {
          "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"]
        };
      default:
        return {
          "text/*": [".txt", ".md", ".html"],
          "application/pdf": [".pdf"]
        };
    }
  };

  const getMaxSize = () => {
    switch (contentType) {
      case "VIDEO":
        return 500 * 1024 * 1024; // 500MB
      case "AUDIO":
        return 100 * 1024 * 1024; // 100MB
      case "IMAGE":
        return 10 * 1024 * 1024; // 10MB
      default:
        return 5 * 1024 * 1024; // 5MB
    }
  };

  const getContentTypeLabel = () => {
    switch (contentType) {
      case "VIDEO":
        return "Video";
      case "AUDIO":
        return "Audio";
      case "IMAGE":
        return "Imagen";
      default:
        return "Archivo";
    }
  };

  const getContentTypeIcon = () => {
    switch (contentType) {
      case "VIDEO":
        return <Video className="h-8 w-8 text-muted-foreground" />;
      case "AUDIO":
        return <Headphones className="h-8 w-8 text-muted-foreground" />;
      case "IMAGE":
        return <Image className="h-8 w-8 text-muted-foreground" />;
      default:
        return <FileText className="h-8 w-8 text-muted-foreground" />;
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    const newFile: UploadedFile = {
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: "pending",
      progress: 0
    };

    setUploadedFile(newFile);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: getAcceptTypes(),
    maxFiles: 1,
    maxSize: getMaxSize(),
    disabled: disabled || isUploading
  });

  const handleUpload = async () => {
    if (!uploadedFile || uploadedFile.status !== "pending") return;

    setIsUploading(true);
    setUploadedFile(prev => prev ? { ...prev, status: "uploading", progress: 0 } : null);

    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploadedFile(prev => prev ? { ...prev, progress: i } : null);
      }

      // Call the actual upload function
      const url = await onUpload(uploadedFile.file);

      console.log("File uploaded successfully, URL:", url);

      setUploadedFile(prev => prev ? { 
        ...prev, 
        status: "success", 
        progress: 100,
        url 
      } : null);
    } catch (error) {
      setUploadedFile(prev => prev ? { 
        ...prev, 
        status: "error", 
        error: error instanceof Error ? error.message : "Error al subir archivo"
      } : null);
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (onRemove) {
      onRemove();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("video/")) {
      return <Video className="h-4 w-4" />;
    } else if (file.type.startsWith("audio/")) {
      return <Headphones className="h-4 w-4" />;
    } else if (file.type.startsWith("image/")) {
      return <Image className="h-4 w-4" />;
    } else {
      return <FileText className="h-4 w-4" />;
    }
  };

  // If there's a current URL, show it as uploaded
  if (currentUrl && !uploadedFile) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
          <div className="flex items-center space-x-3">
            {getContentTypeIcon()}
            <div>
              <p className="text-sm font-medium text-green-800">
                Archivo {getContentTypeLabel().toLowerCase()} cargado
              </p>
              <p className="text-xs text-green-600">
                {currentUrl}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <Button
              variant="ghost"
              size="sm"
              onClick={removeFile}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
            {getContentTypeIcon()}
            <div className="mt-4">
              <p className="text-sm font-medium">
                {isDragActive
                  ? `Suelta el archivo ${getContentTypeLabel().toLowerCase()} aquí...`
                  : `Arrastra un archivo ${getContentTypeLabel().toLowerCase()} aquí o haz clic para seleccionar`}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Máximo {formatFileSize(getMaxSize())}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Preview */}
      {uploadedFile && (
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              {getFileIcon(uploadedFile.file)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {uploadedFile.file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(uploadedFile.file.size)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {uploadedFile.status === "uploading" && (
                <div className="w-20">
                  <Progress value={uploadedFile.progress} className="h-2" />
                </div>
              )}
              
              {uploadedFile.status === "success" && (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
              
              {uploadedFile.status === "error" && (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={removeFile}
                disabled={uploadedFile.status === "uploading"}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {uploadedFile.status === "error" && uploadedFile.error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {uploadedFile.error}
            </div>
          )}

          {uploadedFile.status === "success" && uploadedFile.url && (
            <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
              Archivo subido exitosamente: {uploadedFile.url}
            </div>
          )}
        </div>
      )}

      {/* Upload Button */}
      {uploadedFile && uploadedFile.status === "pending" && (
        <Button
          onClick={handleUpload}
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Subiendo archivo...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Subir {getContentTypeLabel().toLowerCase()}
            </>
          )}
        </Button>
      )}
    </div>
  );
}
