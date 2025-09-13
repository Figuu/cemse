"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  HelpCircle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RotateCcw,
  Play,
  Award,
  BookOpen,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Quiz } from "@/hooks/useQuizzes";

interface QuizCardProps {
  quiz: Quiz;
  onStart: (quizId: string) => void;
  onViewResults: (quizId: string) => void;
  showActions?: boolean;
  className?: string;
}

export function QuizCard({ 
  quiz, 
  onStart, 
  onViewResults,
  showActions = true,
  className 
}: QuizCardProps) {
  const [isStarting, setIsStarting] = useState(false);

  const getStatusColor = (isPassed: boolean, canRetake: boolean) => {
    if (isPassed) return "bg-green-100 text-green-800";
    if (!canRetake) return "bg-red-100 text-red-800";
    return "bg-blue-100 text-blue-800";
  };

  const getStatusText = (isPassed: boolean, canRetake: boolean) => {
    if (isPassed) return "Aprobado";
    if (!canRetake) return "Sin intentos";
    return "Disponible";
  };

  const getStatusIcon = (isPassed: boolean, canRetake: boolean) => {
    if (isPassed) return <CheckCircle className="h-4 w-4" />;
    if (!canRetake) return <XCircle className="h-4 w-4" />;
    return <Play className="h-4 w-4" />;
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const handleStart = async () => {
    setIsStarting(true);
    try {
      onStart(quiz.id);
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{quiz.title}</CardTitle>
            {quiz.description && (
              <CardDescription>{quiz.description}</CardDescription>
            )}
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              {quiz.lesson && (
                <span>{quiz.lesson.module.course.title} • {quiz.lesson.module.title}</span>
              )}
              {quiz.course && (
                <span>{quiz.course.title}</span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(quiz.attempts.isPassed, quiz.attempts.canRetake)}>
              {getStatusIcon(quiz.attempts.isPassed, quiz.attempts.canRetake)}
              <span className="ml-1">{getStatusText(quiz.attempts.isPassed, quiz.attempts.canRetake)}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Quiz Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <HelpCircle className="h-4 w-4 text-blue-600 mr-1" />
              <span className="text-sm font-medium">Preguntas</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {quiz.questions.length}
            </p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Clock className="h-4 w-4 text-purple-600 mr-1" />
              <span className="text-sm font-medium">Tiempo</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {quiz.timeLimit ? formatDuration(quiz.timeLimit) : "∞"}
            </p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Award className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm font-medium">Aprobación</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {quiz.passingScore}%
            </p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <RotateCcw className="h-4 w-4 text-orange-600 mr-1" />
              <span className="text-sm font-medium">Intentos</span>
            </div>
            <p className="text-2xl font-bold text-orange-600">
              {quiz.maxAttempts === 0 ? "∞" : quiz.maxAttempts}
            </p>
          </div>
        </div>

        {/* Attempt Progress */}
        {quiz.attempts.count > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Mejor Puntuación</span>
              <span className="font-medium">{quiz.attempts.bestScore}%</span>
            </div>
            <Progress 
              value={quiz.attempts.bestScore} 
              className="h-2"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{quiz.attempts.count} intento{quiz.attempts.count !== 1 ? 's' : ''}</span>
              {quiz.attempts.latest && (
                <span>Último: {new Date(quiz.attempts.latest.completedAt).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        )}

        {/* Attempts Remaining */}
        {quiz.maxAttempts > 0 && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between text-sm">
              <span>Intentos Restantes</span>
              <span className="font-medium">
                {quiz.attempts.canRetake ? quiz.maxAttempts - quiz.attempts.count : 0}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex space-x-2">
              {quiz.attempts.count > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewResults(quiz.id)}
                >
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Ver Resultados
                </Button>
              )}
            </div>

            <div className="flex space-x-2">
              {quiz.attempts.canRetake ? (
                <Button
                  size="sm"
                  onClick={handleStart}
                  disabled={isStarting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isStarting ? (
                    <>
                      <RotateCcw className="h-4 w-4 mr-1 animate-spin" />
                      Iniciando...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-1" />
                      {quiz.attempts.count > 0 ? "Reintentar" : "Comenzar"}
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  size="sm"
                  disabled
                  variant="outline"
                >
                  {quiz.attempts.isPassed ? "Aprobado" : "Sin intentos"}
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
