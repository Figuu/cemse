"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  HelpCircle, 
  ThumbsUp, 
  ThumbsDown, 
  MessageCircle, 
  Calendar, 
  User, 
  BookOpen,
  GraduationCap,
  Clock,
  CheckCircle,
  MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Question } from "@/hooks/useDiscussions";

interface QuestionCardProps {
  question: Question;
  onAnswer: (questionId: string) => void;
  onVote: (targetType: string, targetId: string, isUpvote: boolean) => Promise<void>;
  onViewAnswers?: (questionId: string) => void;
  showActions?: boolean;
  className?: string;
}

export function QuestionCard({ 
  question, 
  onAnswer, 
  onVote,
  onViewAnswers,
  showActions = true,
  className 
}: QuestionCardProps) {
  const [isVoting, setIsVoting] = useState(false);
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [isDownvoted, setIsDownvoted] = useState(false);

  const handleVote = async (isUpvote: boolean) => {
    if (isVoting) return;

    setIsVoting(true);
    try {
      await onVote("question", question.id, isUpvote);
      
      if (isUpvote) {
        setIsUpvoted(!isUpvoted);
        setIsDownvoted(false);
      } else {
        setIsDownvoted(!isDownvoted);
        setIsUpvoted(false);
      }
    } finally {
      setIsVoting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getContextIcon = () => {
    if (question.lesson) {
      return <BookOpen className="h-4 w-4" />;
    } else if (question.course) {
      return <GraduationCap className="h-4 w-4" />;
    }
    return <HelpCircle className="h-4 w-4" />;
  };

  const getContextLabel = () => {
    if (question.lesson) {
      return `Módulo: ${question.lesson.module.title}`;
    } else if (question.course) {
      return `Curso: ${question.course.title}`;
    }
    return "Pregunta General";
  };

  const getStatusBadge = () => {
    if (question.isResolved) {
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Resuelta
        </Badge>
      );
    } else if (question.answerCount > 0) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          <MessageCircle className="h-3 w-3 mr-1" />
          Con Respuestas
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-gray-100 text-gray-800">
          <HelpCircle className="h-3 w-3 mr-1" />
          Sin Respuestas
        </Badge>
      );
    }
  };

  return (
    <Card className={cn("hover:shadow-md transition-all duration-200 group", className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <Avatar className="h-10 w-10">
              <AvatarImage src={question.student.avatar || undefined} />
              <AvatarFallback>{getInitials(question.student.name)}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg leading-tight">{question.title}</CardTitle>
              <CardDescription className="mt-1">
                Por {question.student.name} • {formatDate(question.createdAt)}
              </CardDescription>
              
              <div className="flex items-center space-x-2 mt-2">
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  {getContextIcon()}
                  <span>{getContextLabel()}</span>
                </div>
                {getStatusBadge()}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Question Content */}
        <div className="prose prose-sm max-w-none">
          <p className="text-foreground whitespace-pre-wrap">{question.content}</p>
        </div>

        {/* Context Information */}
        {(question.course || question.lesson) && (
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Contexto:</span>
              <span className="font-medium">
                {question.lesson 
                  ? `${question.lesson.module.course.title} • ${question.lesson.module.title} • ${question.lesson.title}`
                  : question.course?.title
                }
              </span>
            </div>
          </div>
        )}

        {/* Answers Preview */}
        {question.answers.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-sm font-medium text-blue-900 mb-2">
              Respuestas ({question.answerCount})
            </div>
            <div className="space-y-2">
              {question.answers.slice(0, 2).map((answer) => (
                <div key={answer.id} className="text-sm text-blue-800">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{answer.student.name}:</span>
                    <span className="text-xs text-blue-600">
                      {formatDate(answer.createdAt)}
                    </span>
                    {answer.isAccepted && (
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Aceptada
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-2">{answer.content}</p>
                </div>
              ))}
              {question.answers.length > 2 && (
                <div className="text-xs text-blue-600">
                  Y {question.answers.length - 2} respuesta(s) más...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-4">
              {/* Voting */}
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote(true)}
                  disabled={isVoting}
                  className={cn(
                    "h-8 px-2",
                    isUpvoted && "text-green-600 bg-green-50 hover:bg-green-100"
                  )}
                >
                  <ThumbsUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote(false)}
                  disabled={isVoting}
                  className={cn(
                    "h-8 px-2",
                    isDownvoted && "text-red-600 bg-red-50 hover:bg-red-100"
                  )}
                >
                  <ThumbsDown className="h-4 w-4" />
                </Button>
              </div>

              {/* Answer Count */}
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <MessageCircle className="h-4 w-4" />
                <span>{question.answerCount} respuestas</span>
              </div>
            </div>

            <div className="flex space-x-2">
              {onViewAnswers && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewAnswers(question.id)}
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Ver Respuestas
                </Button>
              )}
              
              <Button
                size="sm"
                onClick={() => onAnswer(question.id)}
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                Responder
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
