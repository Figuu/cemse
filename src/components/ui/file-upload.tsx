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
  FileText, 
  X, 
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onUpload: (files: File[]) => Promise<void>;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number; // in bytes
  className?: string;
  disabled?: boolean;
}

interface UploadedFile {
  file: File;
  id: string;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  error?: string;
}

export function FileUpload({
  onUpload,
  accept = {
    "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    "application/pdf": [".pdf"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"]
  },
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  className,
  disabled = false
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleUpload = async () => {
    const pendingFiles = uploadedFiles.filter(f => f.status === "pending");
    if (pendingFiles.length === 0) return;

    setIsUploading(true);

    // Update status to uploading
    setUploadedFiles(prev => 
      prev.map(f => 
        f.status === "pending" 
          ? { ...f, status: "uploading" as const, progress: 0 }
          : f
      )
    );

    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploadedFiles(prev => 
          prev.map(f => 
            f.status === "uploading" 
              ? { ...f, progress: i }
              : f
          )
        );
      }

      // Call the actual upload function
      await onUpload(pendingFiles.map(f => f.file));

      // Update status to success
      setUploadedFiles(prev => 
        prev.map(f => 
          f.status === "uploading" 
            ? { ...f, status: "success" as const, progress: 100 }
            : f
        )
      );
    } catch (error) {
      // Update status to error
      setUploadedFiles(prev => 
        prev.map(f => 
          f.status === "uploading" 
            ? { 
                ...f, 
                status: "error" as const, 
                error: error instanceof Error ? error.message : "Error al subir archivo"
              }
            : f
        )
      );
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      // eslint-disable-next-line jsx-a11y/alt-text
      return <Image className="h-4 w-4" />;
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
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {file.status === "uploading" && (
                  <div className="w-20">
                    <Progress value={file.progress} className="h-2" />
                  </div>
                )}
                
                {file.status === "success" && (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
                
                {file.status === "error" && (
                  <AlertCircle className="h-4 w-4 text-red-600" />
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

      {/* Upload Button */}
      {pendingFiles.length > 0 && (
        <Button
          onClick={handleUpload}
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Subiendo...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Subir {pendingFiles.length} archivo{pendingFiles.length > 1 ? "s" : ""}
            </>
          )}
        </Button>
      )}
    </div>
  );
}
