"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  MessageCircle, 
  HelpCircle, 
  Award,
  Settings,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Calendar,
  Clock,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { InstructorCourse } from "@/hooks/useInstructorDashboard";

interface InstructorCourseCardProps {
  course: InstructorCourse;
  onView: (courseId: string) => void;
  onEdit: (courseId: string) => void;
  onDelete: (courseId: string) => void;
  onManageStudents: (courseId: string) => void;
  onManageContent: (courseId: string) => void;
  className?: string;
}

export function InstructorCourseCard({ 
  course, 
  onView, 
  onEdit, 
  onDelete,
  onManageStudents,
  onManageContent,
  className 
}: InstructorCourseCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(course.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "DRAFT":
        return "bg-yellow-100 text-yellow-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "Activo";
      case "DRAFT":
        return "Borrador";
      case "COMPLETED":
        return "Completado";
      default:
        return status;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "BEGINNER":
        return "bg-blue-100 text-blue-800";
      case "INTERMEDIATE":
        return "bg-yellow-100 text-yellow-800";
      case "ADVANCED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case "BEGINNER":
        return "Principiante";
      case "INTERMEDIATE":
        return "Intermedio";
      case "ADVANCED":
        return "Avanzado";
      default:
        return level;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  return (
    <Card className={cn("hover:shadow-lg transition-all duration-200 group", className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <CardTitle className="text-lg">{course.title}</CardTitle>
              <Badge className={getStatusColor(course.status)}>
                {getStatusText(course.status)}
              </Badge>
              <Badge className={getLevelColor(course.level)}>
                {getLevelText(course.level)}
              </Badge>
            </div>
            <CardDescription className="line-clamp-2">
              {course.description}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Course Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-lg font-semibold">{course.stats.totalStudents}</div>
            <div className="text-xs text-muted-foreground">Estudiantes</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <BookOpen className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-lg font-semibold">{course.stats.totalModules}</div>
            <div className="text-xs text-muted-foreground">Módulos</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <MessageCircle className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-lg font-semibold">{course.stats.totalDiscussions}</div>
            <div className="text-xs text-muted-foreground">Discusiones</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <HelpCircle className="h-4 w-4 text-orange-600" />
            </div>
            <div className="text-lg font-semibold">{course.stats.totalQuestions}</div>
            <div className="text-xs text-muted-foreground">Preguntas</div>
          </div>
        </div>

        {/* Progress and Completion */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progreso Promedio</span>
            <span className="font-medium">{course.stats.averageProgress}%</span>
          </div>
          <Progress value={course.stats.averageProgress} className="h-2" />
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Tasa de Completación</span>
            <span className="font-medium">
              {course.stats.totalStudents > 0 
                ? Math.round((course.stats.completedStudents / course.stats.totalStudents) * 100)
                : 0}%
            </span>
          </div>
        </div>

        {/* Course Details */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {formatDuration(course.duration)}
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {formatDate(course.createdAt)}
            </div>
          </div>
          <div className="flex items-center">
            <TrendingUp className="h-4 w-4 mr-1" />
            {course.stats.totalLessons} lecciones
          </div>
        </div>

        {/* Recent Students Preview */}
        {course.recentStudents.length > 0 && (
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="text-sm font-medium mb-2">Estudiantes Recientes</div>
            <div className="space-y-1">
              {course.recentStudents.slice(0, 3).map((student) => (
                <div key={student.id} className="flex items-center justify-between text-xs">
                  <span className="truncate">{student.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-muted-foreground">{student.progress}%</span>
                    {student.isCompleted && (
                      <Award className="h-3 w-3 text-green-600" />
                    )}
                  </div>
                </div>
              ))}
              {course.recentStudents.length > 3 && (
                <div className="text-xs text-muted-foreground">
                  Y {course.recentStudents.length - 3} más...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(course.id)}
            >
              <Eye className="h-4 w-4 mr-1" />
              Ver
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onManageStudents(course.id)}
            >
              <Users className="h-4 w-4 mr-1" />
              Estudiantes
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onManageContent(course.id)}
            >
              <BookOpen className="h-4 w-4 mr-1" />
              Contenido
            </Button>
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(course.id)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              {isDeleting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
