"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import { useFileUpload } from "@/hooks/useFileUpload";
import Image from "next/image";

interface ProfileImageUploadProps {
  currentImageUrl?: string;
  onImageUpdate: (imageUrl: string) => void;
  disabled?: boolean;
}

export function ProfileImageUpload({ 
  currentImageUrl, 
  onImageUpdate, 
  disabled = false 
}: ProfileImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, isUploading: hookIsUploading, error } = useFileUpload();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Error", {
        description: "Por favor selecciona un archivo de imagen válido.",
      });
      return;
    }

    // Validate file size (max 5MB for profile images)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("Error", {
        description: "La imagen es demasiado grande. El tamaño máximo es 5MB.",
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setIsUploading(true);
    try {
      const imageUrl = await uploadFile(file);
      onImageUpdate(imageUrl);
      toast.success("Imagen actualizada", {
        description: "Tu foto de perfil se ha actualizado correctamente.",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("Error", {
        description: "No se pudo subir la imagen. Inténtalo de nuevo.",
      });
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageUpdate('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled && !isUploading && !hookIsUploading) {
      fileInputRef.current?.click();
    }
  };

  const displayImage = previewUrl || currentImageUrl;
  const isLoading = isUploading || hookIsUploading;

  return (
    <Card className="w-fit">
      <CardContent className="p-4">
        <div className="flex flex-col items-center space-y-4">
          {/* Image Display */}
          <div className="relative">
            <div className="h-32 w-32 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-gray-200">
              {displayImage ? (
                <Image
                  src={displayImage}
                  alt="Profile"
                  width={128}
                  height={128}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Camera className="h-12 w-12 text-gray-400" />
              )}
            </div>
            
            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {!disabled && (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClick}
                disabled={isLoading}
                className="flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>{displayImage ? "Cambiar" : "Subir"}</span>
              </Button>
              
              {displayImage && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveImage}
                  disabled={isLoading}
                  className="flex items-center space-x-2 text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                  <span>Eliminar</span>
                </Button>
              )}
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled || isLoading}
          />

          {/* Error Display */}
          {error && (
            <p className="text-sm text-red-600 text-center max-w-48">
              {error}
            </p>
          )}

          {/* Help Text */}
          <p className="text-xs text-gray-500 text-center max-w-48">
            Formatos: JPG, PNG, GIF. Máximo 5MB.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
