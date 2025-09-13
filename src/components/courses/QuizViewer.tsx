"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  Submit,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Quiz, QuizQuestion, QuizResults } from "@/hooks/useQuizzes";

interface QuizViewerProps {
  quiz: Quiz;
  onSubmit: (answers: Record<string, any>) => Promise<{ attempt: any; results: QuizResults } | null>;
  onExit: () => void;
  className?: string;
}

export function QuizViewer({ 
  quiz, 
  onSubmit, 
  onExit,
  className 
}: QuizViewerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeRemaining, setTimeRemaining] = useState(quiz.timeLimit ? quiz.timeLimit * 60 : null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<QuizResults | null>(null);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  // Timer effect
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await onSubmit(answers);
      if (result) {
        setResults(result.results);
        setShowResults(true);
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case "multiple_choice":
        return <HelpCircle className="h-4 w-4" />;
      case "true_false":
        return <CheckCircle className="h-4 w-4" />;
      case "fill_blank":
        return <Input className="h-4 w-4" />;
      case "essay":
        return <Textarea className="h-4 w-4" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case "multiple_choice":
        return "Opción Múltiple";
      case "true_false":
        return "Verdadero/Falso";
      case "fill_blank":
        return "Completar";
      case "essay":
        return "Ensayo";
      default:
        return type;
    }
  };

  if (showResults && results) {
    return (
      <div className={cn("space-y-6", className)}>
        <Card className={cn(
          "border-2",
          results.passed ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
        )}>
          <CardContent className="text-center py-12">
            <div className="mb-6">
              {results.passed ? (
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              ) : (
                <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
              )}
              <h2 className="text-2xl font-bold mb-2">
                {results.passed ? "¡Felicidades!" : "Inténtalo de nuevo"}
              </h2>
              <p className="text-muted-foreground">
                {results.passed 
                  ? "Has aprobado el cuestionario" 
                  : "No has alcanzado la puntuación mínima requerida"
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{results.score}%</div>
                <div className="text-sm text-muted-foreground">Tu Puntuación</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{results.correctAnswers}</div>
                <div className="text-sm text-muted-foreground">Respuestas Correctas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{results.totalQuestions}</div>
                <div className="text-sm text-muted-foreground">Total Preguntas</div>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span>Puntuación Mínima Requerida</span>
                <span className="font-medium">{quiz.passingScore}%</span>
              </div>
              <Progress 
                value={results.score} 
                className="h-3"
              />
            </div>

            <div className="flex space-x-2 justify-center">
              <Button variant="outline" onClick={onExit}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              {quiz.attempts.canRetake && (
                <Button onClick={() => {
                  setShowResults(false);
                  setResults(null);
                  setCurrentQuestionIndex(0);
                  setAnswers({});
                  setTimeRemaining(quiz.timeLimit ? quiz.timeLimit * 60 : null);
                }}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reintentar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Quiz Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{quiz.title}</CardTitle>
              {quiz.description && (
                <CardDescription>{quiz.description}</CardDescription>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {timeRemaining !== null && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <span className="font-mono text-lg">
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              )}
              <Button variant="outline" size="sm" onClick={onExit}>
                Salir
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progreso</span>
              <span>{currentQuestionIndex + 1} de {totalQuestions}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Question */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            {getQuestionTypeIcon(currentQuestion.type)}
            <Badge variant="outline">
              {getQuestionTypeLabel(currentQuestion.type)}
            </Badge>
            {currentQuestion.points && (
              <Badge variant="secondary">
                {currentQuestion.points} puntos
              </Badge>
            )}
          </div>
          <CardTitle className="text-lg">
            Pregunta {currentQuestionIndex + 1}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-lg">
            {currentQuestion.question}
          </div>

          {/* Question Content */}
          <div className="space-y-4">
            {currentQuestion.type === "multiple_choice" && (
              <RadioGroup
                value={answers[currentQuestion.id] || ""}
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
              >
                {currentQuestion.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={index.toString()} id={`${currentQuestion.id}-${index}`} />
                    <label 
                      htmlFor={`${currentQuestion.id}-${index}`}
                      className="flex-1 cursor-pointer"
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQuestion.type === "true_false" && (
              <RadioGroup
                value={answers[currentQuestion.id] || ""}
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, value === "true")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id={`${currentQuestion.id}-true`} />
                  <label htmlFor={`${currentQuestion.id}-true`} className="cursor-pointer">
                    Verdadero
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id={`${currentQuestion.id}-false`} />
                  <label htmlFor={`${currentQuestion.id}-false`} className="cursor-pointer">
                    Falso
                  </label>
                </div>
              </RadioGroup>
            )}

            {currentQuestion.type === "fill_blank" && (
              <Input
                value={answers[currentQuestion.id] || ""}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                placeholder="Escribe tu respuesta aquí..."
                className="text-lg"
              />
            )}

            {currentQuestion.type === "essay" && (
              <Textarea
                value={answers[currentQuestion.id] || ""}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                placeholder="Escribe tu respuesta aquí..."
                rows={6}
                className="text-lg"
              />
            )}
          </div>

          {/* Explanation */}
          {currentQuestion.explanation && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Explicación:</h4>
              <p className="text-blue-800 text-sm">{currentQuestion.explanation}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            {Object.keys(answers).length} de {totalQuestions} respondidas
          </span>
        </div>

        <div className="flex space-x-2">
          {currentQuestionIndex < totalQuestions - 1 ? (
            <Button onClick={handleNext}>
              Siguiente
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Submit className="h-4 w-4 mr-2" />
                  Enviar Cuestionario
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Time Warning */}
      {timeRemaining !== null && timeRemaining <= 300 && timeRemaining > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="flex items-center space-x-2 py-4">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <span className="text-orange-800">
              {timeRemaining <= 60 
                ? `¡Tiempo casi agotado! ${formatTime(timeRemaining)} restantes`
                : `Tiempo restante: ${formatTime(timeRemaining)}`
              }
            </span>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
