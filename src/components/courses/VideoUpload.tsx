"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Video, 
  X, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  CheckCircle,
  AlertCircle,
  FileVideo,
  Trash2
} from "lucide-react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

interface VideoUploadProps {
  onVideoUploaded: (videoUrl: string) => void;
  onVideoRemoved: () => void;
  initialVideoUrl?: string;
  disabled?: boolean;
}

const ACCEPTED_VIDEO_TYPES = [
  "video/mp4",
  "video/avi", 
  "video/mov",
  "video/wmv",
  "video/flv",
  "video/webm",
  "video/quicktime"
];

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

export const VideoUpload = ({ 
  onVideoUploaded, 
  onVideoRemoved, 
  initialVideoUrl,
  disabled = false 
}: VideoUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(initialVideoUrl || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { data: session } = useSession();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileSelect = useCallback((file: File) => {
    // Validate file type
    if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
      alert("Por favor selecciona un archivo de video válido (MP4, AVI, MOV, WMV, FLV, WebM)");
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      alert("El archivo es demasiado grande. El tamaño máximo es 500MB");
      return;
    }

    setSelectedFile(file);
    setProgress(0);
    setUploadError(null);
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

    setIsUploading(true);
    setUploadError(null);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("category", "course-video");

      // Create XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();
      
      return new Promise<void>((resolve, reject) => {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            setProgress(percentComplete);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            const result = JSON.parse(xhr.responseText);
            if (result.success && result.file) {
              setVideoUrl(result.file.url);
              onVideoUploaded(result.file.url);
              setSelectedFile(null);
              setProgress(100);
            }
            resolve();
          } else {
            const errorData = JSON.parse(xhr.responseText);
            reject(new Error(errorData.error || "Upload failed"));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Upload failed"));
        });

        xhr.open("POST", "/api/files/minio/upload");
        xhr.send(formData);
      });
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveVideo = () => {
    setVideoUrl(null);
    setSelectedFile(null);
    setProgress(0);
    setUploadError(null);
    onVideoRemoved();
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileTypeIcon = (file: File) => {
    return <FileVideo className="h-8 w-8 text-blue-500" />;
  };

  return (
    <div className="space-y-4">
      <Label>Video de Vista Previa</Label>
      
      {!videoUrl ? (
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
                    onClick={() => setSelectedFile(null)}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Upload Progress */}
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Subiendo video...</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="w-full" />
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
                  disabled={isUploading || disabled}
                  className="w-full"
                >
                  {isUploading ? (
                    <>
                      <Upload className="h-4 w-4 mr-2 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Subir Video
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900">
                    Arrastra y suelta tu video aquí
                  </p>
                  <p className="text-sm text-gray-500">
                    o haz clic para seleccionar un archivo
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mt-3">
                    {ACCEPTED_VIDEO_TYPES.map((type) => (
                      <Badge key={type} variant="secondary" className="text-xs">
                        {type.split('/')[1].toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Tamaño máximo: 500MB
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
                <Video className="h-4 w-4" />
                Video de Vista Previa
              </CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveVideo}
                disabled={disabled}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Video Player */}
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-48 object-cover"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                muted={isMuted}
                controls
              />
              
              {/* Custom Controls Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={togglePlayPause}
                      className="text-white hover:bg-white/20"
                    >
                      {isPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={toggleMute}
                      className="text-white hover:bg-white/20"
                    >
                      {isMuted ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Success Message */}
            <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-700">
                Video subido exitosamente
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hidden File Input */}
      <Input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_VIDEO_TYPES.join(",")}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
};
