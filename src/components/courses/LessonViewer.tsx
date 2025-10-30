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
  Headphones,
  HelpCircle,
  AlertCircle,
  FileText,
  File,
  FileSpreadsheet,
  FileImage,
  Paperclip
} from "lucide-react";
import { Lesson, LessonProgress } from "@/hooks/useCourseProgress";
import { QuizViewer } from "./QuizViewer";
import { toast } from "sonner";

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
  const [isPlayRequestPending, setIsPlayRequestPending] = useState(false);
  const [lessonQuiz, setLessonQuiz] = useState<any | null>(null);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [initialQuizAnswers, setInitialQuizAnswers] = useState<Record<string, any> | undefined>(undefined);
  const [initialQuizResults, setInitialQuizResults] = useState<any | null>(null);
  const [contentWatched, setContentWatched] = useState(false);

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
      }
    };

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying, isCompleted, timeSpent, onProgressUpdate]);

  // Fetch quiz for this lesson
  useEffect(() => {
    const fetchQuiz = async () => {
      // Safety check for lesson.course
      if (!lesson?.course?.id || !lesson?.id) {
        console.error("Lesson or course ID is missing", { lesson });
        setLessonQuiz(null);
        setIsLoadingQuiz(false);
        return;
      }

      setIsLoadingQuiz(true);
      try {
        const response = await fetch(`/api/courses/${lesson.course.id}/lessons/${lesson.id}/quiz`);
        if (response.ok) {
          const data = await response.json();
          console.log("Quiz data received:", data);
          if (data.success && data.quiz) {
            // Validate quiz structure
            const quiz = data.quiz;

            // Ensure questions is an array with valid questions
            if (quiz.questions && Array.isArray(quiz.questions) && quiz.questions.length > 0) {
              // Validate each question has required fields
              const validQuestions = quiz.questions.every((q: any) =>
                q && typeof q === 'object' && q.type && q.question
              );

              if (validQuestions) {
                console.log("Setting quiz with", quiz.questions.length, "questions");
                setLessonQuiz(quiz);

                // If there's a latest attempt, fetch full attempt details (with answers) and show summary
                const latest = quiz.latestAttempt;
                if (latest) {
                  try {
                    const attemptsRes = await fetch(`/api/quizzes/${quiz.id}/attempts`);
                    if (attemptsRes.ok) {
                      const attemptsData = await attemptsRes.json();
                      const latestAttempt = Array.isArray(attemptsData.attempts) && attemptsData.attempts.length > 0
                        ? attemptsData.attempts[0]
                        : null;

                      if (latestAttempt && latestAttempt.answers) {
                        const questions = quiz.questions as any[];
                        let correct = 0;
                        const total = questions.length;

                        questions.forEach((question: any, index: number) => {
                          const questionId = question.id || index.toString();
                          const userAnswer = latestAttempt.answers?.[questionId];
                          const correctAnswer = question.correctAnswer;

                          let isCorrect = false;
                          if (question.type === 'multiple_choice') {
                            const ua = typeof userAnswer === 'string' ? parseInt(userAnswer, 10) : userAnswer;
                            const ca = typeof correctAnswer === 'string' ? parseInt(correctAnswer, 10) : correctAnswer;
                            isCorrect = ua === ca;
                          } else if (question.type === 'true_false') {
                            const ua = userAnswer === true || userAnswer === 'true';
                            const ca = correctAnswer === true || correctAnswer === 'true';
                            isCorrect = ua === ca;
                          } else if (question.type === 'fill_blank' || question.type === 'short_answer') {
                            const ua = String(userAnswer ?? '').trim().toLowerCase();
                            const ca = String(correctAnswer ?? '').trim().toLowerCase();
                            isCorrect = ua === ca;
                          } else if (question.type === 'essay') {
                            isCorrect = !!(userAnswer && String(userAnswer).trim().length > 0);
                          } else {
                            // eslint-disable-next-line eqeqeq
                            isCorrect = (userAnswer as any) == (correctAnswer as any);
                          }

                          if (isCorrect) correct++;
                        });

                        const score = total > 0 ? Math.round((correct / total) * 100) : 0;
                        setInitialQuizAnswers(latestAttempt.answers || {});
                        setInitialQuizResults({
                          correctAnswers: correct,
                          totalQuestions: total,
                          score,
                          passed: latestAttempt.passed,
                          passingScore: quiz.passingScore,
                        });
                        setShowQuiz(true);
                      }
                    }
                  } catch (e) {
                    console.error('Error loading latest attempt with answers:', e);
                  }
                } else {
                  setInitialQuizAnswers(undefined);
                  setInitialQuizResults(null);
                }
              } else {
                console.error("Quiz questions are malformed:", quiz.questions);
                setLessonQuiz(null);
              }
            } else {
              console.warn("Quiz has no questions or invalid format:", quiz);
              setLessonQuiz(null);
            }
          } else {
            console.log("No quiz found for this lesson");
            setLessonQuiz(null);
          }
        } else {
          console.error("Failed to fetch quiz, status:", response.status);
          setLessonQuiz(null);
        }
      } catch (error) {
        console.error("Error fetching quiz:", error);
        setLessonQuiz(null);
      } finally {
        setIsLoadingQuiz(false);
      }
    };

    fetchQuiz();
  }, [lesson?.id, lesson?.course?.id]);

  // Set video source when lesson changes
  useEffect(() => {
    setVideoError(null);

    if (lesson.contentType === "VIDEO" && lesson.videoUrl) {
      setVideoSrc(lesson.videoUrl);
      console.log("Setting video source:", lesson.videoUrl);
    }
  }, [lesson.id, lesson.videoUrl, lesson.contentType]);

  const handlePlayPause = () => {
    const video = videoRef.current;
    const audio = audioRef.current;
    const media = video || audio;

    if (!media || isPlayRequestPending) return;

    if (media.paused) {
      // Prevent multiple play requests
      setIsPlayRequestPending(true);
      
      // Use a promise to handle the play request properly
      const playPromise = media.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Playback started successfully
            console.log("Media started playing");
            setIsPlayRequestPending(false);
          })
          .catch((error) => {
            // Handle play errors gracefully
            setIsPlayRequestPending(false);
            if (error.name === 'AbortError') {
              console.log("Play request was aborted (likely interrupted by pause)");
            } else {
              console.error("Error playing media:", error);
              setVideoError("Error playing video");
            }
          });
      } else {
        setIsPlayRequestPending(false);
      }
    } else {
      media.pause();
    }
  };

  const handleMute = () => {
    const video = videoRef.current;
    const audio = audioRef.current;
    const media = video || audio;

    if (!media) return;

    media.muted = !media.muted;
    setIsMuted(media.muted);
  };

  const handleFullscreen = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (!document.fullscreenElement) {
        await video.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Error toggling fullscreen:", error);
    }
  };

  const handleComplete = async () => {
    if (isCompleted) return;

    // If there's a quiz, don't mark as complete yet - show the quiz first
    if (lessonQuiz && !showQuiz) {
      // Validate quiz has questions before showing
      if (lessonQuiz.questions && Array.isArray(lessonQuiz.questions) && lessonQuiz.questions.length > 0) {
        console.log("Video ended. Quiz available with", lessonQuiz.questions.length, "questions");
        setContentWatched(true);
        setShowQuiz(true);
        toast.info("Debes completar el cuestionario para terminar esta lección");
      } else {
        console.error("Quiz exists but has no valid questions:", lessonQuiz);
        toast.error("Error: El cuestionario no tiene preguntas configuradas");
        // Mark as complete anyway since the quiz is broken
        setIsUpdating(true);
        try {
          const success = await onProgressUpdate(true, timeSpent);
          if (success) {
            setIsCompleted(true);
            toast.success("Lección completada");
          }
        } catch (error) {
          console.error("Error marking lesson complete:", error);
          toast.error("Error al completar la lección");
        } finally {
          setIsUpdating(false);
        }
      }
      return;
    }

    setIsUpdating(true);
    try {
      const success = await onProgressUpdate(true, timeSpent);
      if (success) {
        setIsCompleted(true);
        toast.success("Lección completada");
      }
    } catch (error) {
      console.error("Error marking lesson complete:", error);
      toast.error("Error al completar la lección");
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
    console.log("Seeking to:", newTime);
    
    // Store the current playing state
    const wasPlaying = !media.paused;
    
    try {
      // Update the video position
      media.currentTime = newTime;
      setCurrentTime(newTime);
      
      // If the video was playing before seeking, keep it playing
      if (wasPlaying && media.paused && !isPlayRequestPending) {
        setIsPlayRequestPending(true);
        const playPromise = media.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("Resumed playback after seek");
              setIsPlayRequestPending(false);
            })
            .catch((error) => {
              setIsPlayRequestPending(false);
              if (error.name === 'AbortError') {
                console.log("Play request was aborted after seek");
              } else {
                console.log("Error resuming playback after seek:", error);
              }
            });
        } else {
          setIsPlayRequestPending(false);
        }
      }
    } catch (seekError) {
      console.log("Seek failed:", seekError);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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

  const handleQuizSubmit = async (answers: Record<string, any>) => {
    try {
      const response = await fetch(`/api/quizzes/${lessonQuiz.id}/attempts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit quiz");
      }

      const data = await response.json();

      if (data.success) {
        // Check if the quiz was passed
        if (data.attempt.passed) {
          // Mark lesson as complete
          setIsUpdating(true);
          try {
            const success = await onProgressUpdate(true, timeSpent);
            if (success) {
              setIsCompleted(true);
              toast.success("¡Cuestionario aprobado! Lección completada");
            }
          } catch (error) {
            console.error("Error marking lesson complete:", error);
            toast.error("Error al completar la lección");
          } finally {
            setIsUpdating(false);
          }
        } else {
          toast.error(`No aprobaste el cuestionario. Necesitas ${lessonQuiz.passingScore}% para aprobar.`);
        }

        return {
          attempt: data.attempt,
          results: data.results,
        };
      }

      return null;
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast.error("Error al enviar el cuestionario");
      return null;
    }
  };

  const handleQuizExit = () => {
    if (!isCompleted) {
      toast.warning("Debes completar el cuestionario para continuar");
    }
    setShowQuiz(false);
  };

  return (
    <div className={`space-y-6 ${className || ''}`}>
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
              <Badge variant={isCompleted ? "default" : "secondary"}>
                {isCompleted ? "Completada" : "En Progreso"}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>


      {/* Main Content */}
      {lesson.contentType === "VIDEO" ? (
        <Card>
          <CardContent className="p-0">
            {lesson.videoUrl ? (
              <div className="relative w-full bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  src={videoSrc || lesson.videoUrl}
                  className="w-full aspect-video object-contain"
                  controls={false}
                  onLoadedMetadata={() => {
                    if (videoRef.current) {
                      setDuration(videoRef.current.duration);
                      console.log("Video metadata loaded, duration:", videoRef.current.duration);
                    }
                  }}
                  onTimeUpdate={() => {
                    if (videoRef.current) {
                      setCurrentTime(videoRef.current.currentTime);
                    }
                  }}
                  onSeeking={() => {
                    console.log("Video seeking started");
                  }}
                  onSeeked={() => {
                    console.log("Video seeking completed");
                    if (videoRef.current) {
                      setCurrentTime(videoRef.current.currentTime);
                      console.log("Updated currentTime to:", videoRef.current.currentTime);
                    }
                  }}
                  onEnded={() => {
                    setIsPlaying(false);
                    handleComplete();
                  }}
                  onPlay={() => {
                    setIsPlaying(true);
                    console.log("Video started playing");
                  }}
                  onPause={() => {
                    setIsPlaying(false);
                    console.log("Video paused");
                  }}
                />
                
                {/* Custom Controls */}
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
                    
                    {/* Control Buttons */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Button
                          size="sm"
                          onClick={handlePlayPause}
                          className="bg-white/20 hover:bg-white/30 text-white"
                        >
                          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleMute}
                          className="bg-white/20 hover:bg-white/30 text-white"
                        >
                          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        onClick={handleFullscreen}
                        className="bg-white/20 hover:bg-white/30 text-white"
                      >
                        <Maximize className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">No hay video disponible</p>
                  <p className="text-sm text-gray-500">Esta lección no tiene un video adjunto</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : lesson.contentType === "AUDIO" ? (
        <Card>
          <CardContent className="p-0">
            {lesson.audioUrl ? (
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
                    variant="outline"
                    size="sm"
                    onClick={handleMute}
                    className="rounded-full p-2"
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                </div>
                <audio
                  ref={audioRef}
                  src={lesson.audioUrl}
                  onLoadedMetadata={() => {
                    if (audioRef.current) {
                      setDuration(audioRef.current.duration);
                    }
                  }}
                  onTimeUpdate={() => {
                    if (audioRef.current) {
                      setCurrentTime(audioRef.current.currentTime);
                    }
                  }}
                  onEnded={() => {
                    setIsPlaying(false);
                    handleComplete();
                  }}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              </div>
            ) : (
              <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Headphones className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">No hay audio disponible</p>
                  <p className="text-sm text-gray-500">Esta lección no tiene un archivo de audio adjunto</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Sin contenido multimedia</p>
              <p className="text-sm text-gray-500">Esta lección no tiene contenido de video o audio</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Section */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getContentTypeIcon(lesson.contentType)}
                <span className="font-medium">Progreso de la Lección</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {formatTime(timeSpent)} de {formatTime(duration)}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>{isCompleted ? "Completada" : "En Progreso"}</span>
            </div>
            <Progress
              value={isCompleted ? 100 : (duration > 0 ? (currentTime / duration) * 100 : 0)}
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Attachments Section - Show lesson resources */}
      {lesson.attachments && Object.keys(lesson.attachments).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Paperclip className="h-5 w-5" />
              Recursos Adjuntos
            </CardTitle>
            <CardDescription>
              Descarga los recursos adicionales de esta lección
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.values(lesson.attachments).map((attachment: any, index) => {
              if (!attachment || typeof attachment !== 'object' || !attachment.url) return null;

              return (
                <div key={attachment.id || index} className="flex items-center space-x-3 p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                  {getFileIcon(attachment.type || '')}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {attachment.name}
                    </p>
                    {attachment.size && (
                      <p className="text-xs text-gray-500">
                        {formatFileSize(attachment.size)}
                      </p>
                    )}
                  </div>
                  <a
                    href={attachment.url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0"
                  >
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Descargar
                    </Button>
                  </a>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Quiz Section - Show if lesson has a quiz */}
      {lessonQuiz && !isCompleted && (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <HelpCircle className="h-8 w-8 text-purple-600" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-purple-900">Cuestionario Requerido</h3>
                <p className="text-sm text-purple-800">
                  Esta lección incluye un cuestionario que debes completar para continuar.
                  {lessonQuiz.passingScore && ` Puntuación mínima requerida: ${lessonQuiz.passingScore}%`}
                </p>
                {contentWatched ? (
                  <Button
                    type="button"
                    onClick={() => {
                      console.log("Opening quiz. Quiz data:", lessonQuiz);
                      console.log("Quiz questions:", lessonQuiz?.questions);
                      if (lessonQuiz?.questions) {
                        console.log("First question:", lessonQuiz.questions[0]);
                      }
                      setShowQuiz(true);
                    }}
                    className="mt-2 bg-purple-600 hover:bg-purple-700"
                  >
                    <HelpCircle className="h-4 w-4 mr-2" />
                    {showQuiz ? "Continuar Cuestionario" : "Comenzar Cuestionario"}
                  </Button>
                ) : (
                  <p className="text-sm text-purple-700 italic">
                    Completa el contenido de la lección para desbloquear el cuestionario
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quiz Viewer - Show when quiz is active */}
      {showQuiz && lessonQuiz && lessonQuiz.questions && lessonQuiz.questions.length > 0 && (
        <QuizViewer
          quiz={lessonQuiz}
          onSubmit={handleQuizSubmit}
          onExit={handleQuizExit}
          initialAnswers={initialQuizAnswers}
          initialResults={initialQuizResults}
        />
      )}

      {/* Debug: Show if quiz button was clicked but quiz is invalid */}
      {showQuiz && (!lessonQuiz || !lessonQuiz.questions || lessonQuiz.questions.length === 0) && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="font-semibold text-red-900 mb-2">Error al cargar el cuestionario</h3>
              <p className="text-sm text-red-800 mb-4">
                El cuestionario no tiene preguntas configuradas o los datos están corruptos.
              </p>
              <Button onClick={() => setShowQuiz(false)} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={!onPrevious}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>
        <Button
          variant="outline"
          onClick={onNext}
          disabled={!onNext || (lessonQuiz && !isCompleted)}
        >
          Siguiente
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}