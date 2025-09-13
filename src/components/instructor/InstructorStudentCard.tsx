"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Mail, 
  Calendar, 
  Clock, 
  Award,
  MessageCircle,
  MoreHorizontal,
  Eye,
  Send,
  CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { InstructorStudent } from "@/hooks/useInstructorDashboard";

interface InstructorStudentCardProps {
  student: InstructorStudent;
  onView: (studentId: string) => void;
  onMessage: (studentId: string) => void;
  onViewProgress: (studentId: string) => void;
  className?: string;
}

export function InstructorStudentCard({ 
  student, 
  onView, 
  onMessage,
  onViewProgress,
  className 
}: InstructorStudentCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (isCompleted: boolean) => {
    return isCompleted 
      ? "bg-green-100 text-green-800"
      : "bg-blue-100 text-blue-800";
  };

  const getStatusText = (isCompleted: boolean) => {
    return isCompleted ? "Completado" : "En Progreso";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return "Hace menos de 1 hora";
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} horas`;
    } else if (diffInHours < 48) {
      return "Ayer";
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Hace ${diffInDays} días`;
    }
  };

  return (
    <Card className={cn("hover:shadow-md transition-all duration-200 group", className)}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          {/* Avatar */}
          <Avatar className="h-12 w-12">
            <AvatarImage src={student.avatar || undefined} />
            <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
          </Avatar>

          {/* Student Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold truncate">{student.name}</h3>
                <p className="text-sm text-muted-foreground truncate">{student.email}</p>
                <p className="text-sm text-muted-foreground truncate">{student.course.title}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={getStatusColor(student.enrollment.isCompleted)}>
                  {getStatusText(student.enrollment.isCompleted)}
                </Badge>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Progress Section */}
            <div className="mt-4 space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progreso del Curso</span>
                  <span className="font-medium">{student.enrollment.progressPercentage}%</span>
                </div>
                <Progress value={student.enrollment.progressPercentage} className="h-2" />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {student.stats.completedLessons} / {student.stats.totalLessons} lecciones
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {formatRelativeTime(student.stats.lastActivity)}
                  </span>
                </div>
              </div>
            </div>

            {/* Course Details */}
            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Inscrito: {formatDate(student.enrollment.enrolledAt)}</span>
                </div>
                {student.enrollment.completedAt && (
                  <div className="flex items-center space-x-2">
                    <Award className="h-4 w-4" />
                    <span>Completado: {formatDate(student.enrollment.completedAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(student.id)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Ver Perfil
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewProgress(student.id)}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Progreso
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onMessage(student.id)}
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                Mensaje
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
