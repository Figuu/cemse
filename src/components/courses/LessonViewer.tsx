"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize,
  CheckCircle,
  Clock,
  BookOpen,
  Download,
  ArrowLeft,
  ArrowRight,
  RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Lesson, LessonProgress } from "@/hooks/useCourseProgress";

interface LessonViewerProps {
  lesson: Lesson;
  progress: LessonProgress | null;
  onProgressUpdate: (isCompleted: boolean, timeSpent: number) => Promise<boolean>;
  onPrevious?: () => void;
  onNext?: () => void;
  className?: string;
}

export function LessonViewer({ 
  lesson, 
  progress, 
  onProgressUpdate,
  onPrevious,
  onNext,
  className 
}: LessonViewerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [timeSpent, setTimeSpent] = useState(progress?.timeSpent || 0);
  const [isCompleted, setIsCompleted] = useState(progress?.isCompleted || false);
  const [isUpdating, setIsUpdating] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update time spent every 30 seconds
  useEffect(() => {
    if (isPlaying && !isCompleted) {
      progressIntervalRef.current = setInterval(async () => {
        const newTimeSpent = timeSpent + 30;
        setTimeSpent(newTimeSpent);
        
        // Update progress in database
        setIsUpdating(true);
        try {
          await onProgressUpdate(false, newTimeSpent);
        } catch (error) {
          console.error("Error updating time spent:", error);
        } finally {
          setIsUpdating(false);
        }
      }, 30000);
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying, isCompleted, timeSpent, onProgressUpdate]);

  // Handle video/audio events
  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    const media = video || audio;

    if (!media) return;

    const handleTimeUpdate = () => {
      setCurrentTime(media.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(media.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      handleComplete();
    };

    media.addEventListener("timeupdate", handleTimeUpdate);
    media.addEventListener("loadedmetadata", handleLoadedMetadata);
    media.addEventListener("ended", handleEnded);

    return () => {
      media.removeEventListener("timeupdate", handleTimeUpdate);
      media.removeEventListener("loadedmetadata", handleLoadedMetadata);
      media.removeEventListener("ended", handleEnded);
    };
  }, [lesson.contentType]);

  const handlePlayPause = () => {
    const video = videoRef.current;
    const audio = audioRef.current;
    const media = video || audio;

    if (!media) return;

    if (isPlaying) {
      media.pause();
      setIsPlaying(false);
    } else {
      media.play();
      setIsPlaying(true);
    }
  };

  const handleMute = () => {
    const video = videoRef.current;
    const audio = audioRef.current;
    const media = video || audio;

    if (!media) return;

    media.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!isFullscreen) {
      video.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleComplete = async () => {
    if (isCompleted) return;

    setIsUpdating(true);
    try {
      const success = await onProgressUpdate(true, timeSpent);
      if (success) {
        setIsCompleted(true);
      }
    } catch (error) {
      console.error("Error marking lesson complete:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    const audio = audioRef.current;
    const media = video || audio;

    if (!media) return;

    const newTime = parseFloat(e.target.value);
    media.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType) {
      case "VIDEO":
        return <Play className="h-4 w-4" />;
      case "AUDIO":
        return <Volume2 className="h-4 w-4" />;
      case "TEXT":
        return <BookOpen className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getContentTypeLabel = (contentType: string) => {
    switch (contentType) {
      case "VIDEO":
        return "Video";
      case "AUDIO":
        return "Audio";
      case "TEXT":
        return "Texto";
      default:
        return contentType;
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Lesson Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-xl">{lesson.title}</CardTitle>
              <CardDescription>
                {lesson.module.title} • {getContentTypeLabel(lesson.contentType)}
              </CardDescription>
              {lesson.description && (
                <p className="text-sm text-muted-foreground">
                  {lesson.description}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {lesson.isRequired && (
                <Badge variant="outline">Requerida</Badge>
              )}
              {lesson.isPreview && (
                <Badge variant="outline">Vista Previa</Badge>
              )}
              {isCompleted && (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Completada
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Media Player */}
      {(lesson.contentType === "VIDEO" || lesson.contentType === "AUDIO") && (
        <Card>
          <CardContent className="p-0">
            <div className="relative">
              {lesson.contentType === "VIDEO" && lesson.videoUrl && (
                <video
                  ref={videoRef}
                  src={lesson.videoUrl}
                  className="w-full aspect-video bg-black"
                  controls={false}
                />
              )}
              {lesson.contentType === "AUDIO" && lesson.audioUrl && (
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <audio
                    ref={audioRef}
                    src={lesson.audioUrl}
                    className="w-full"
                    controls={false}
                  />
                </div>
              )}

              {/* Custom Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-4">
                <div className="space-y-3">
                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <input
                      type="range"
                      min="0"
                      max={duration || 0}
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handlePlayPause}
                        className="text-white hover:bg-white hover:bg-opacity-20"
                      >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleMute}
                        className="text-white hover:bg-white hover:bg-opacity-20"
                      >
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </Button>
                      {lesson.contentType === "VIDEO" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleFullscreen}
                          className="text-white hover:bg-white hover:bg-opacity-20"
                        >
                          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="text-sm">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Text Content */}
      {lesson.contentType === "TEXT" && (
        <Card>
          <CardContent className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
          </CardContent>
        </Card>
      )}

      {/* Lesson Progress */}
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Progreso de la Lección</h3>
            <div className="text-sm text-muted-foreground">
              Tiempo invertido: {Math.floor(timeSpent / 60)}m {timeSpent % 60}s
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Estado</span>
              <span>{isCompleted ? "Completada" : "En Progreso"}</span>
            </div>
            <Progress 
              value={isCompleted ? 100 : (duration > 0 ? (currentTime / duration) * 100 : 0)} 
              className="h-2"
            />
          </div>

          {!isCompleted && (
            <Button
              onClick={handleComplete}
              disabled={isUpdating}
              className="w-full"
            >
              {isUpdating ? (
                <>
                  <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Marcar como Completada
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Attachments */}
      {lesson.attachments && Object.keys(lesson.attachments).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recursos Adicionales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(lesson.attachments).map(([key, attachment]: [string, any]) => (
                <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Download className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{attachment.name || key}</div>
                      <div className="text-sm text-muted-foreground">
                        {attachment.type || "Archivo"}
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Descargar
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={!onPrevious}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>
        <Button
          onClick={onNext}
          disabled={!onNext}
        >
          Siguiente
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
