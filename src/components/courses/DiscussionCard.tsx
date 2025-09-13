"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageCircle, 
  ThumbsUp, 
  ThumbsDown, 
  Reply, 
  Calendar, 
  User, 
  BookOpen,
  GraduationCap,
  Clock,
  MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Discussion } from "@/hooks/useDiscussions";

interface DiscussionCardProps {
  discussion: Discussion;
  onReply: (discussionId: string) => void;
  onVote: (targetType: string, targetId: string, isUpvote: boolean) => Promise<void>;
  onViewReplies?: (discussionId: string) => void;
  showActions?: boolean;
  className?: string;
}

export function DiscussionCard({ 
  discussion, 
  onReply, 
  onVote,
  onViewReplies,
  showActions = true,
  className 
}: DiscussionCardProps) {
  const [isVoting, setIsVoting] = useState(false);
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [isDownvoted, setIsDownvoted] = useState(false);

  const handleVote = async (isUpvote: boolean) => {
    if (isVoting) return;

    setIsVoting(true);
    try {
      await onVote("discussion", discussion.id, isUpvote);
      
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
    if (discussion.lesson) {
      return <BookOpen className="h-4 w-4" />;
    } else if (discussion.course) {
      return <GraduationCap className="h-4 w-4" />;
    }
    return <MessageCircle className="h-4 w-4" />;
  };

  const getContextLabel = () => {
    if (discussion.lesson) {
      return `Módulo: ${discussion.lesson.module.title}`;
    } else if (discussion.course) {
      return `Curso: ${discussion.course.title}`;
    }
    return "Discusión General";
  };

  return (
    <Card className={cn("hover:shadow-md transition-all duration-200 group", className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <Avatar className="h-10 w-10">
              <AvatarImage src={discussion.student.avatar || undefined} />
              <AvatarFallback>{getInitials(discussion.student.name)}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg leading-tight">{discussion.title}</CardTitle>
              <CardDescription className="mt-1">
                Por {discussion.student.name} • {formatDate(discussion.createdAt)}
              </CardDescription>
              
              <div className="flex items-center space-x-2 mt-2">
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  {getContextIcon()}
                  <span>{getContextLabel()}</span>
                </div>
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
        {/* Discussion Content */}
        <div className="prose prose-sm max-w-none">
          <p className="text-foreground whitespace-pre-wrap">{discussion.content}</p>
        </div>

        {/* Context Information */}
        {(discussion.course || discussion.lesson) && (
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Contexto:</span>
              <span className="font-medium">
                {discussion.lesson 
                  ? `${discussion.lesson.module.course.title} • ${discussion.lesson.module.title} • ${discussion.lesson.title}`
                  : discussion.course?.title
                }
              </span>
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

              {/* Reply Count */}
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <MessageCircle className="h-4 w-4" />
                <span>{discussion.replyCount} respuestas</span>
              </div>
            </div>

            <div className="flex space-x-2">
              {onViewReplies && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewReplies(discussion.id)}
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Ver Respuestas
                </Button>
              )}
              
              <Button
                size="sm"
                onClick={() => onReply(discussion.id)}
              >
                <Reply className="h-4 w-4 mr-1" />
                Responder
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
