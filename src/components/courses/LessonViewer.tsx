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
  RotateCcw,
  Video,
  Headphones
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
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const [seekPosition, setSeekPosition] = useState<number | null>(null);

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

  // Reset video error and set video source when lesson changes
  useEffect(() => {
    setVideoError(null);
    if (lesson.contentType === "VIDEO" && lesson.videoUrl) {
      // Add cache-busting parameter to force fresh load
      const urlWithCacheBust = `${lesson.videoUrl}?t=${Date.now()}`;
      setVideoSrc(urlWithCacheBust);
      console.log("Setting video source:", urlWithCacheBust);
      
      // Test URL accessibility
      fetch(lesson.videoUrl, { method: 'HEAD' })
        .then(response => {
          console.log(`Video URL accessibility test: ${response.status} ${response.statusText}`);
          if (!response.ok) {
            console.error('Video URL not accessible:', response.status, response.statusText);
          }
        })
        .catch(error => {
          console.error('Error testing video URL:', error);
        });
    }
  }, [lesson.id, lesson.videoUrl, lesson.contentType]);

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

    const handleWaiting = () => {
      console.log("Media waiting for data...");
      setIsBuffering(true);
    };

    const handleCanPlay = () => {
      console.log("Media can play");
      setIsBuffering(false);
      setSeekPosition(null);
    };

    const handleSeeked = () => {
      console.log("Media seek completed");
      setIsBuffering(false);
      setSeekPosition(null);
    };

    const handleSeeking = () => {
      console.log("Media seeking...");
      setIsBuffering(true);
    };

    media.addEventListener("timeupdate", handleTimeUpdate);
    media.addEventListener("loadedmetadata", handleLoadedMetadata);
    media.addEventListener("ended", handleEnded);
    media.addEventListener("waiting", handleWaiting);
    media.addEventListener("canplay", handleCanPlay);
    media.addEventListener("seeked", handleSeeked);
    media.addEventListener("seeking", handleSeeking);

    return () => {
      media.removeEventListener("timeupdate", handleTimeUpdate);
      media.removeEventListener("loadedmetadata", handleLoadedMetadata);
      media.removeEventListener("ended", handleEnded);
      media.removeEventListener("waiting", handleWaiting);
      media.removeEventListener("canplay", handleCanPlay);
      media.removeEventListener("seeked", handleSeeked);
      media.removeEventListener("seeking", handleSeeking);
    };
  }, [lesson.contentType]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("msfullscreenchange", handleFullscreenChange);
    };
  }, []);

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

  const handleFullscreen = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (!isFullscreen) {
        if (video.requestFullscreen) {
          await video.requestFullscreen();
        } else if ((video as any).webkitRequestFullscreen) {
          await (video as any).webkitRequestFullscreen();
        } else if ((video as any).msRequestFullscreen) {
          await (video as any).msRequestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error("Error toggling fullscreen:", error);
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
    
    // Check if the video is ready to seek
    if (media.readyState < 2) {
      console.log("Video not ready for seeking, waiting for more data...");
      // Wait for the video to be ready
      const checkReady = () => {
        if (media.readyState >= 2) {
          console.log("Video ready, seeking to:", newTime);
          media.currentTime = newTime;
          setCurrentTime(newTime);
        } else {
          // Wait a bit more
          setTimeout(checkReady, 100);
        }
      };
      checkReady();
      return;
    }

    // Check if we're trying to seek beyond what's loaded
    if (newTime > media.duration) {
      console.log("Cannot seek beyond video duration");
      return;
    }

    // Check if the seek position is within the buffered range
    const buffered = media.buffered;
    let canSeek = false;
    
    for (let i = 0; i < buffered.length; i++) {
      if (newTime >= buffered.start(i) && newTime <= buffered.end(i)) {
        canSeek = true;
        break;
      }
    }

    if (!canSeek) {
      console.log("Seek position not buffered yet, waiting for data...");
      setIsBuffering(true);
      setSeekPosition(newTime);
      
      // Wait for the video to buffer the requested position
      const checkBuffer = () => {
        const buffered = media.buffered;
        let canSeekNow = false;
        
        for (let i = 0; i < buffered.length; i++) {
          if (newTime >= buffered.start(i) && newTime <= buffered.end(i)) {
            canSeekNow = true;
            break;
          }
        }

        if (canSeekNow) {
          console.log("Buffer ready, seeking to:", newTime);
          media.currentTime = newTime;
          setCurrentTime(newTime);
          setIsBuffering(false);
          setSeekPosition(null);
        } else {
          // Wait a bit more for buffering
          setTimeout(checkBuffer, 200);
        }
      };
      checkBuffer();
      return;
    }

    // Safe to seek
    console.log("Seeking to:", newTime);
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
      {(() => {
        console.log("LessonViewer - Lesson data:", {
          contentType: lesson.contentType,
          videoUrl: lesson.videoUrl,
          audioUrl: lesson.audioUrl,
          hasVideoUrl: !!lesson.videoUrl,
          hasAudioUrl: !!lesson.audioUrl
        });
        return null;
      })()}
      
      {(lesson.contentType === "VIDEO" || lesson.contentType === "AUDIO") ? (
        <Card>
          <CardContent className="p-0">
            {lesson.contentType === "VIDEO" ? (
              lesson.videoUrl ? (
                videoError ? (
                  <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Video className="h-16 w-16 text-red-400 mx-auto mb-4" />
                      <p className="text-red-600 font-medium">Video Error</p>
                      <p className="text-sm text-gray-500 mb-4">{videoError}</p>
                      <div className="space-y-2 text-xs text-gray-400 mb-4">
                        <p>URL: {lesson.videoUrl}</p>
                        <p>Try refreshing the page or contact support if the problem persists.</p>
                      </div>
                      <div className="space-y-2">
                        <Button 
                          onClick={() => {
                            setVideoError(null);
                            console.log("Manual retry: Starting fresh load");
                            if (videoRef.current) {
                              videoRef.current.load();
                            }
                          }}
                          variant="outline"
                          size="sm"
                        >
                          Retry Video
                        </Button>
                        <Button 
                          onClick={() => {
                            setVideoError(null);
                            console.log("Manual retry: Force reload with cache bust");
                            const newUrl = `${lesson.videoUrl}?manual=${Date.now()}`;
                            setVideoSrc(newUrl);
                            if (videoRef.current) {
                              videoRef.current.load();
                            }
                          }}
                          variant="outline"
                          size="sm"
                        >
                          Force Reload
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    src={videoSrc || lesson.videoUrl}
                    className="w-full aspect-video object-contain"
                    controls={false}
                    preload="metadata"
                    crossOrigin="anonymous"
                    onLoadedMetadata={() => {
                      if (videoRef.current) {
                        setDuration(videoRef.current.duration);
                      }
                    }}
                    onTimeUpdate={() => {
                      if (videoRef.current) {
                        setCurrentTime(videoRef.current.currentTime);
                      }
                    }}
                    onEnded={() => {
                      setIsPlaying(false);
                      handleComplete();
                    }}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onClick={handlePlayPause}
                    onError={(e) => {
                      console.error("Video error:", e);
                      const video = e.target as HTMLVideoElement;
                      const errorDetails = {
                        error: video.error,
                        networkState: video.networkState,
                        readyState: video.readyState,
                        src: video.src,
                        currentSrc: video.currentSrc
                      };
                      console.error("Video error details:", errorDetails);
                      
                        if (video.error) {
                          let errorMessage = "Unknown video error";
                          switch (video.error.code) {
                            case 1:
                              errorMessage = "Video loading aborted";
                              break;
                            case 2:
                              errorMessage = "Network error while loading video";
                              break;
                            case 3:
                              errorMessage = "Video format not supported or corrupted";
                              break;
                            case 4:
                              errorMessage = "Video not found or access denied";
                              break;
                          }
                          
                          // Check if this is a seeking error
                          if (video.networkState === 1 && video.readyState === 1) {
                            errorMessage = "Seeking error - trying to access unbuffered content";
                            console.log("Seeking error detected, attempting recovery...");
                            
                            // Try to recover by seeking to a safe position
                            setTimeout(() => {
                              if (videoRef.current && video.buffered.length > 0) {
                                const safeTime = video.buffered.start(0);
                                console.log("Recovering by seeking to safe position:", safeTime);
                                video.currentTime = safeTime;
                                setCurrentTime(safeTime);
                                setVideoError(null);
                                setIsBuffering(false);
                                setSeekPosition(null);
                              }
                            }, 1000);
                          }
                          
                          setVideoError(errorMessage);
                        
                        // Try to retry with different approaches
                        if (video.error?.code === 4 && lesson.videoUrl) {
                          console.log("Attempting to retry with different approaches...");
                          
                          // Try 1: Without crossOrigin
                          setTimeout(() => {
                            if (videoRef.current) {
                              console.log("Retry 1: Removing crossOrigin attribute");
                              videoRef.current.crossOrigin = null;
                              videoRef.current.load();
                            }
                          }, 1000);
                          
                          // Try 2: With original URL (no cache busting)
                          setTimeout(() => {
                            if (videoRef.current) {
                              console.log("Retry 2: Using original URL without cache busting");
                              setVideoSrc(lesson.videoUrl);
                              videoRef.current.load();
                            }
                          }, 2000);
                          
                          // Try 3: Force reload with new cache bust
                          setTimeout(() => {
                            if (videoRef.current) {
                              console.log("Retry 3: Force reload with new cache bust");
                              const newUrl = `${lesson.videoUrl}?retry=${Date.now()}`;
                              setVideoSrc(newUrl);
                              videoRef.current.load();
                            }
                          }, 3000);
                        }
                      }
                    }}
                    onLoadStart={() => {
                      console.log("Video load started for:", lesson.videoUrl);
                      setVideoError(null); // Clear any previous errors
                    }}
                    onCanPlay={() => {
                      console.log("Video can play:", lesson.videoUrl);
                      setVideoError(null); // Clear any previous errors
                    }}
                    onCanPlayThrough={() => {
                      console.log("Video can play through:", lesson.videoUrl);
                      setVideoError(null); // Clear any previous errors
                    }}
                    onLoadedData={() => {
                      console.log("Video data loaded:", lesson.videoUrl);
                    }}
                    onLoadedMetadata={() => {
                      console.log("Video metadata loaded:", lesson.videoUrl);
                      if (videoRef.current) {
                        console.log("Video duration:", videoRef.current.duration);
                        console.log("Video videoWidth:", videoRef.current.videoWidth);
                        console.log("Video videoHeight:", videoRef.current.videoHeight);
                      }
                    }}
                  />
                  
                    {/* Video Overlay - Only show when paused */}
                    {!isPlaying && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 cursor-pointer" onClick={handlePlayPause}>
                        <div className="bg-white bg-opacity-90 rounded-full p-4 hover:bg-opacity-100 transition-all">
                          <Play className="h-12 w-12 text-black" />
                        </div>
                      </div>
                    )}

                    {/* Buffering Indicator */}
                    {isBuffering && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="text-center text-white">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
                          <p className="text-sm">
                            {seekPosition ? `Buffering to ${formatTime(seekPosition)}...` : 'Buffering...'}
                          </p>
                        </div>
                      </div>
                    )}

                  {/* Custom Controls - Always visible for better UX */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent text-white p-4">
                    <div className="space-y-3">
                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="relative">
                          <input
                            type="range"
                            min="0"
                            max={duration || 0}
                            value={currentTime}
                            onChange={handleSeek}
                            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                            style={{
                              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${duration > 0 ? (currentTime / duration) * 100 : 0}%, #6b7280 ${duration > 0 ? (currentTime / duration) * 100 : 0}%, #6b7280 100%)`
                            }}
                          />
                        </div>
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
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlayPause();
                            }}
                            className="text-white hover:bg-white hover:bg-opacity-20"
                          >
                            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMute();
                            }}
                            className="text-white hover:bg-white hover:bg-opacity-20"
                          >
                            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFullscreen();
                            }}
                            className="text-white hover:bg-white hover:bg-opacity-20"
                          >
                            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                          </Button>
                        </div>

                        <div className="flex items-center space-x-2">
                          <div className="text-sm font-medium">
                            {formatTime(currentTime)} / {formatTime(duration)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                )
              ) : (
                <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">No video file available</p>
                    <p className="text-sm text-gray-500">This lesson doesn't have a video attached</p>
                  </div>
                </div>
              )
            ) : null}
            
            {lesson.contentType === "AUDIO" ? (
              lesson.audioUrl ? (
              <div className="w-full bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-lg">
                <div className="flex items-center justify-center space-x-6">
                  <Button
                    size="lg"
                    onClick={handlePlayPause}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full p-4"
                  >
                    {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
                  </Button>
                  <div className="flex-1 space-y-2">
                    <div className="text-lg font-medium">{lesson.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                    <div className="w-full">
                      <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full bg-gray-300 rounded-lg appearance-none cursor-pointer slider audio-slider"
                        style={{
                          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${duration > 0 ? (currentTime / duration) * 100 : 0}%, #d1d5db ${duration > 0 ? (currentTime / duration) * 100 : 0}%, #d1d5db 100%)`
                        }}
                      />
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleMute}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
              ) : (
                <div className="w-full bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Headphones className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">No audio file available</p>
                    <p className="text-sm text-gray-500">This lesson doesn't have an audio file attached</p>
                  </div>
                </div>
              )
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No media content</p>
              <p className="text-sm text-gray-500">This lesson doesn't have video or audio content</p>
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
