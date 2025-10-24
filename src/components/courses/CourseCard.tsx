"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  Play, 
  CheckCircle,
  User,
  Award,
  Tag,
  ExternalLink,
  Heart,
  Share2,
  Edit,
  Trash2,
  MoreVertical
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Course } from "@/hooks/useCourses";
import { useSession } from "next-auth/react";
import { getImageUrl } from "@/lib/imageUtils";

interface CourseCardProps {
  course: Course;
  onEnroll: (courseId: string) => Promise<void>;
  onUnenroll: (courseId: string) => Promise<void>;
  onView: (courseId: string) => void;
  onEdit?: (courseId: string) => void;
  onDelete?: (courseId: string) => void;
  showActions?: boolean;
  className?: string;
  viewMode?: "grid" | "list";
}

export function CourseCard({ 
  course, 
  onEnroll, 
  onUnenroll, 
  onView,
  onEdit,
  onDelete,
  showActions = true,
  className,
  viewMode = "grid"
}: CourseCardProps) {
  const { data: session } = useSession();
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isUnenrolling, setIsUnenrolling] = useState(false);

  const getLevelColor = (level: string) => {
    switch (level) {
      case "BEGINNER":
        return "bg-green-100 text-green-800";
      case "INTERMEDIATE":
        return "bg-yellow-100 text-yellow-800";
      case "ADVANCED":
        return "bg-red-100 text-red-800";
      case "EXPERT":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case "BEGINNER":
        return "Principiante";
      case "INTERMEDIATE":
        return "Intermedio";
      case "ADVANCED":
        return "Avanzado";
      case "EXPERT":
        return "Experto";
      default:
        return level;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "TECHNOLOGY":
        return "bg-main-blue/10 text-main-blue";
      case "BUSINESS":
        return "bg-green-environment/10 text-green-environment";
      case "DESIGN":
        return "bg-purple-gender/10 text-purple-gender";
      case "MARKETING":
        return "bg-orange-economy/10 text-orange-economy";
      case "LANGUAGES":
        return "bg-purple-light/10 text-purple-light";
      case "HEALTH":
        return "bg-green-success/10 text-green-success";
      case "EDUCATION":
        return "bg-main-dark-blue/10 text-main-dark-blue";
      case "ARTS":
        return "bg-orange-light/10 text-orange-light";
      case "SCIENCE":
        return "bg-green-light/10 text-green-light";
      case "ENGINEERING":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "TECHNOLOGY":
        return "Tecnología";
      case "BUSINESS":
        return "Negocios";
      case "DESIGN":
        return "Diseño";
      case "MARKETING":
        return "Marketing";
      case "LANGUAGES":
        return "Idiomas";
      case "HEALTH":
        return "Salud";
      case "EDUCATION":
        return "Educación";
      case "ARTS":
        return "Artes";
      case "SCIENCE":
        return "Ciencia";
      case "ENGINEERING":
        return "Ingeniería";
      case "OTHER":
        return "Otros";
      default:
        return category;
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const handleEnroll = async () => {
    setIsEnrolling(true);
    try {
      await onEnroll(course.id);
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleUnenroll = async () => {
    setIsUnenrolling(true);
    try {
      await onUnenroll(course.id);
    } finally {
      setIsUnenrolling(false);
    }
  };

  if (viewMode === "list") {
    return (
      <Card className={cn("overflow-hidden hover:shadow-lg transition-all duration-200 group", className)}>
        <div className="flex flex-col sm:flex-row">
          {/* Course Thumbnail - List View */}
          <div className="w-full sm:w-48 h-32 sm:h-auto bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden flex-shrink-0">
            {course.thumbnail ? (
              <Image
                src={getImageUrl(course.thumbnail) || ''}
                alt={course.title}
                fill
                className="object-cover"
                onError={(e) => {
                  console.error('Image failed to load:', course.thumbnail);
                  console.error('Error:', e);
                }}
                onLoad={() => {
                  console.log('Image loaded successfully:', course.thumbnail);
                }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground" />
              </div>
            )}
            
            {/* Progress Bar for Enrolled Courses */}
            {course.isEnrolled && course.progress > 0 && (
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span>Progreso</span>
                  <span>{Math.round(course.progress)}%</span>
                </div>
                <Progress value={course.progress} className="h-1" />
              </div>
            )}

            {/* Course Level Badge */}
            <div className="absolute top-2 left-2">
              <Badge className={cn(getLevelColor(course.level), "text-xs")}>
                {getLevelLabel(course.level)}
              </Badge>
            </div>

            {/* Category Badge */}
            <div className="absolute top-2 right-2">
              <Badge className={cn(getCategoryColor(course.category), "text-xs")}>
                {getCategoryLabel(course.category)}
              </Badge>
            </div>

            {/* Certification Badge */}
            {course.certification && (
              <div className="absolute bottom-2 right-2">
                <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                  <Award className="h-3 w-3 mr-1" />
                  Certificado
                </Badge>
              </div>
            )}
          </div>

          {/* Course Content - List View */}
          <div className="flex-1 p-4 sm:p-6">
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg font-semibold line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {course.title}
                  </h3>
                  
                  {course.instructor && (
                    <p className="text-sm text-muted-foreground mt-1 flex items-center">
                      <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      {course.instructor.name}
                    </p>
                  )}

                  {course.shortDescription && (
                    <p className="text-xs sm:text-sm text-muted-foreground mt-2 line-clamp-2">
                      {course.shortDescription}
                    </p>
                  )}
                </div>

                {/* Course Stats - List View */}
                <div className="flex items-center space-x-4 mt-3 sm:mt-0 sm:ml-4 text-xs sm:text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    {formatDuration(course.duration)}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    {course.studentsCount.toLocaleString()}
                  </div>
                  <div className="flex items-center">
                    <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-1 fill-yellow-400 text-yellow-400" />
                    {course.rating.toFixed(1)}
                  </div>
                </div>
              </div>

              {/* Course Details - List View */}
              <div className="flex flex-wrap gap-4 text-xs sm:text-sm">
                <span>Lecciones: <strong>{course.totalLessons}</strong></span>
                <span>Módulos: <strong>{course.totalModules}</strong></span>
                {course.totalQuizzes > 0 && (
                  <span>Cuestionarios: <strong>{course.totalQuizzes}</strong></span>
                )}
              </div>

              {/* Tags - List View */}
              {course.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {course.tags.slice(0, 4).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                  {course.tags.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{course.tags.length - 4} más
                    </Badge>
                  )}
                </div>
              )}

              {/* Enrollment Status - List View */}
              {course.isEnrolled && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progreso</span>
                    <span className="font-medium">{Math.round(course.progress)}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                  {course.isCompleted && (
                    <div className="flex items-center text-green-600 text-sm">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Completado
                    </div>
                  )}
                </div>
              )}

              {/* Actions - List View */}
              {showActions && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 pt-2">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onView(course.id)}
                      className="text-xs"
                    >
                      <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {/* TODO: Implement share */}}
                      className="text-xs"
                    >
                      <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="ml-1 sm:hidden">Compartir</span>
                    </Button>
                  </div>

                  <div className="flex space-x-2">
                    {/* Show different actions based on user role and course ownership */}
                    {(session?.user?.role === "INSTITUTION" && course.isOwner) || session?.user?.role === "SUPERADMIN" ? (
                      // Institution viewing their own course OR Super Admin viewing any course
                      <>
                        <Button
                          size="sm"
                          onClick={() => onView(course.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-xs"
                        >
                          <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Gestionar
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="text-xs">
                              <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="ml-1 sm:hidden">Más</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {onEdit && (
                              <DropdownMenuItem onClick={() => onEdit(course.id)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                            )}
                            {onDelete && (
                              <DropdownMenuItem 
                                onClick={() => onDelete(course.id)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    ) : session?.user?.role === "INSTITUTION" && !course.isOwner ? (
                      // Institution viewing someone else's course
                      <Button
                        size="sm"
                        onClick={() => onView(course.id)}
                        className="bg-gray-600 hover:bg-gray-700 text-xs"
                      >
                        <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        Ver Detalles
                      </Button>
                    ) : course.isEnrolled ? (
                      // Student viewing enrolled course
                      <Button
                        size="sm"
                        onClick={() => onView(course.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-xs"
                      >
                        <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        Continuar
                      </Button>
                    ) : (
                      // Student viewing available course
                      <Button
                        size="sm"
                        onClick={handleEnroll}
                        disabled={isEnrolling}
                        className="bg-green-600 hover:bg-green-700 text-xs"
                      >
                        {isEnrolling ? (
                          <>
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 animate-spin" />
                            Inscribiendo...
                          </>
                        ) : (
                          "Inscribirse"
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Grid View (default)
  return (
    <Card className={cn("overflow-hidden hover:shadow-lg transition-all duration-200 group", className)}>
      {/* Course Thumbnail - Grid View */}
      <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden">
        {course.thumbnail ? (
          <Image
            src={getImageUrl(course.thumbnail) || ''}
            alt={course.title}
            fill
            className="object-cover"
            onError={(e) => {
              console.error('Image failed to load:', course.thumbnail);
              console.error('Error:', e);
            }}
            onLoad={() => {
              console.log('Image loaded successfully:', course.thumbnail);
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="h-16 w-16 text-muted-foreground" />
          </div>
        )}

        {/* Progress Overlay */}
        {course.isEnrolled && course.progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
            <div className="flex items-center justify-between text-sm mb-1">
              <span>Progreso</span>
              <span>{Math.round(course.progress)}%</span>
            </div>
            <Progress value={course.progress} className="h-1" />
          </div>
        )}

        {/* Course Level Badge */}
        <div className="absolute top-2 left-2">
          <Badge className={getLevelColor(course.level)}>
            {getLevelLabel(course.level)}
          </Badge>
        </div>

        {/* Category Badge */}
        <div className="absolute top-2 right-2">
          <Badge className={getCategoryColor(course.category)}>
            {getCategoryLabel(course.category)}
          </Badge>
        </div>

        {/* Certification Badge */}
        {course.certification && (
          <div className="absolute bottom-2 right-2">
            <Badge className="bg-yellow-100 text-yellow-800">
              <Award className="h-3 w-3 mr-1" />
              Certificado
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="space-y-2">
          <CardTitle className="text-base sm:text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
            {course.title}
          </CardTitle>
          
          {course.instructor && (
            <CardDescription className="flex items-center text-sm">
              <User className="h-4 w-4 mr-1" />
              {course.instructor.name}
            </CardDescription>
          )}

          {course.shortDescription && (
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
              {course.shortDescription}
            </p>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Course Stats */}
        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="flex items-center">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              {formatDuration(course.duration)}
            </div>
            <div className="flex items-center">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              {course.studentsCount.toLocaleString()}
            </div>
            <div className="flex items-center">
              <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-1 fill-yellow-400 text-yellow-400" />
              {course.rating.toFixed(1)}
            </div>
          </div>
        </div>

        {/* Course Details */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-muted-foreground">Lecciones</span>
            <span className="font-medium">{course.totalLessons}</span>
          </div>
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-muted-foreground">Módulos</span>
            <span className="font-medium">{course.totalModules}</span>
          </div>
          {course.totalQuizzes > 0 && (
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">Cuestionarios</span>
              <span className="font-medium">{course.totalQuizzes}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {course.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {course.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
            {course.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{course.tags.length - 3} más
              </Badge>
            )}
          </div>
        )}

        {/* Enrollment Status */}
        {course.isEnrolled && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progreso</span>
              <span className="font-medium">{Math.round(course.progress)}%</span>
            </div>
            <Progress value={course.progress} className="h-2" />
            {course.isCompleted && (
              <div className="flex items-center text-green-600 text-sm">
                <CheckCircle className="h-4 w-4 mr-1" />
                Completado
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 pt-2">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView(course.id)}
                className="flex-1 sm:flex-none"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Ver
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {/* TODO: Implement share */}}
                className="flex-1 sm:flex-none"
              >
                <Share2 className="h-4 w-4" />
                <span className="ml-1 sm:hidden">Compartir</span>
              </Button>
            </div>

            <div className="flex space-x-2">
              {/* Show different actions based on user role and course ownership */}
              {(session?.user?.role === "INSTITUTION" && course.isOwner) || session?.user?.role === "SUPERADMIN" ? (
                // Institution viewing their own course OR Super Admin viewing any course
                <>
                  <Button
                    size="sm"
                    onClick={() => onView(course.id)}
                    className="bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none"
                  >
                    <BookOpen className="h-4 w-4 mr-1" />
                    Gestionar
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                        <MoreVertical className="h-4 w-4" />
                        <span className="ml-1 sm:hidden">Más</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(course.id)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <DropdownMenuItem 
                          onClick={() => onDelete(course.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : session?.user?.role === "INSTITUTION" && !course.isOwner ? (
                // Institution viewing someone else's course
                <Button
                  size="sm"
                  onClick={() => onView(course.id)}
                  className="bg-gray-600 hover:bg-gray-700 w-full sm:w-auto"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Ver Detalles
                </Button>
              ) : course.isEnrolled ? (
                // Student viewing enrolled course
                <Button
                  size="sm"
                  onClick={() => onView(course.id)}
                  className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                >
                  <Play className="h-4 w-4 mr-1" />
                  Continuar
                </Button>
              ) : (
                // Student viewing available course
                <Button
                  size="sm"
                  onClick={handleEnroll}
                  disabled={isEnrolling}
                  className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                >
                  {isEnrolling ? (
                    <>
                      <Clock className="h-4 w-4 mr-1 animate-spin" />
                      Inscribiendo...
                    </>
                  ) : (
                    "Inscribirse"
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
