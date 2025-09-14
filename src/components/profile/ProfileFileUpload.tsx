"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChunkedFileUpload } from "@/components/ui/chunked-file-upload";
import { 
  Image, 
  FileText, 
  Download, 
  Trash2, 
  Eye,
  User,
  Award,
  Upload
} from "lucide-react";
import { cn, formatFileSize, getFileExtension } from "@/lib/utils";

interface ProfileFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
  category: "profile-picture" | "cv" | "certificate" | "other";
  status: "active" | "pending" | "rejected";
}

interface ProfileFileUploadProps {
  onFileUpload: (files: File[], category: string) => Promise<void>;
  onFileDelete: (fileId: string) => Promise<void>;
  onFileView: (fileId: string) => void;
  files: ProfileFile[];
  category: "profile-picture" | "cv" | "certificate" | "other";
  maxFiles?: number;
  maxSize?: number;
  className?: string;
}

export function ProfileFileUpload({
  onFileUpload,
  onFileDelete,
  onFileView,
  files,
  category,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  className
}: ProfileFileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "profile-picture":
        return User;
      case "cv":
        return FileText;
      case "certificate":
        return Award;
      default:
        return FileText;
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case "profile-picture":
        return "Foto de Perfil";
      case "cv":
        return "Currículum Vitae";
      case "certificate":
        return "Certificados";
      default:
        return "Archivos";
    }
  };

  const getCategoryDescription = (category: string) => {
    switch (category) {
      case "profile-picture":
        return "Sube una foto profesional para tu perfil";
      case "cv":
        return "Sube tu CV en formato PDF o Word";
      case "certificate":
        return "Sube tus certificados y diplomas";
      default:
        return "Sube archivos relacionados con tu perfil";
    }
  };

  const getAcceptTypes = (category: string): Record<string, string[]> => {
    switch (category) {
      case "profile-picture":
        return {
          "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"]
        };
      case "cv":
        return {
          "application/pdf": [".pdf"],
          "application/msword": [".doc"],
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"]
        };
      case "certificate":
        return {
          "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
          "application/pdf": [".pdf"]
        };
      default:
        return {
          "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
          "application/pdf": [".pdf"],
          "application/msword": [".doc"],
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"]
        };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Activo";
      case "pending":
        return "Pendiente";
      case "rejected":
        return "Rechazado";
      default:
        return status;
    }
  };


  const handleDelete = async (fileId: string) => {
    try {
      await onFileDelete(fileId);
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const categoryFiles = files.filter(file => file.category === category);
  const Icon = getCategoryIcon(category);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Icon className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg">{getCategoryTitle(category)}</CardTitle>
        </div>
        <CardDescription>
          {getCategoryDescription(category)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <ChunkedFileUpload
          onUploadComplete={(fileUrl) => {
            console.log("File uploaded successfully:", fileUrl);
            // The file will be automatically added to the files list via the hook
          }}
          onUploadError={(error) => {
            console.error("Upload error:", error);
          }}
          accept={getAcceptTypes(category)}
          maxFiles={maxFiles}
          maxSize={maxSize}
          category={category}
          disabled={isUploading}
          className="w-full"
        />

        {/* Uploaded Files List */}
        {categoryFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              Archivos Subidos ({categoryFiles.length})
            </h4>
            <div className="space-y-2">
              {categoryFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {file.category === "profile-picture" ? (
                        // eslint-disable-next-line jsx-a11y/alt-text
                        <Image className="h-8 w-8 text-blue-500" />
                      ) : file.category === "cv" ? (
                        <FileText className="h-8 w-8 text-green-500" />
                      ) : file.category === "certificate" ? (
                        <Award className="h-8 w-8 text-purple-500" />
                      ) : (
                        <FileText className="h-8 w-8 text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span>{getFileExtension(file.name).toUpperCase()}</span>
                        <span>•</span>
                        <span>{file.uploadedAt.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(file.status)}>
                      {getStatusText(file.status)}
                    </Badge>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onFileView(file.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(file.url, '_blank')}
                        className="h-8 w-8 p-0"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(file.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Status */}
        {isUploading && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Upload className="h-4 w-4 animate-spin" />
            <span>Subiendo archivos...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
