"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  Phone, 
  Users, 
  Code,
  CheckCircle,
  XCircle,
  MessageSquare,
  ExternalLink,
  MoreHorizontal,
  Edit,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate, formatDateTime } from "@/lib/utils";
import { Interview } from "@/hooks/useInterviews";

interface InterviewCardProps {
  interview: Interview;
  onUpdate: (id: string, status: string) => Promise<void>;
  onMessage: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
  className?: string;
}

export function InterviewCard({ 
  interview, 
  onUpdate, 
  onMessage, 
  onEdit,
  onDelete,
  showActions = true,
  className 
}: InterviewCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "PHONE":
        return <Phone className="h-4 w-4" />;
      case "VIDEO":
        return <Video className="h-4 w-4" />;
      case "IN_PERSON":
        return <Users className="h-4 w-4" />;
      case "TECHNICAL":
        return <Code className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "PHONE":
        return "Llamada Telefónica";
      case "VIDEO":
        return "Videollamada";
      case "IN_PERSON":
        return "Presencial";
      case "TECHNICAL":
        return "Técnica";
      default:
        return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "bg-blue-100 text-blue-800";
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "DECLINED":
        return "bg-red-100 text-red-800";
      case "COMPLETED":
        return "bg-purple-100 text-purple-800";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "Programada";
      case "CONFIRMED":
        return "Confirmada";
      case "DECLINED":
        return "Declinada";
      case "COMPLETED":
        return "Completada";
      case "CANCELLED":
        return "Cancelada";
      default:
        return status;
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await onUpdate(interview.id, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const isUpcoming = new Date(interview.scheduledAt) > new Date();
  const isPast = new Date(interview.scheduledAt) < new Date();

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{interview.application.jobTitle}</CardTitle>
            <CardDescription>
              {interview.application.company} • {interview.application.candidate.name}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(interview.status)}>
              {getStatusLabel(interview.status)}
            </Badge>
            {showActions && (
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Interview Details */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            {getTypeIcon(interview.type)}
            <span className="text-sm font-medium">{getTypeLabel(interview.type)}</span>
          </div>

          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {formatDateTime(interview.scheduledAt)}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {interview.duration} minutos
            </span>
          </div>

          {interview.location && (
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {interview.location}
              </span>
            </div>
          )}

          {interview.meetingLink && (
            <div className="flex items-center space-x-2">
              <Video className="h-4 w-4 text-muted-foreground" />
              <a
                href={interview.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline flex items-center"
              >
                Unirse a la reunión
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>
          )}
        </div>

        {/* Notes */}
        {interview.notes && (
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Notas</h4>
            <p className="text-sm text-gray-600">{interview.notes}</p>
          </div>
        )}

        {/* Feedback */}
        {interview.feedback && (
          <div className="bg-blue-50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-blue-700 mb-1">Feedback</h4>
            <p className="text-sm text-blue-600">{interview.feedback}</p>
          </div>
        )}

        {/* Messages Count */}
        {interview.messages.length > 0 && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            <span>{interview.messages.length} mensajes</span>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex space-x-2">
              {isUpcoming && interview.status === "SCHEDULED" && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusUpdate("CONFIRMED")}
                    disabled={isUpdating}
                    className="text-green-600 hover:text-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Confirmar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusUpdate("DECLINED")}
                    disabled={isUpdating}
                    className="text-red-600 hover:text-red-700"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Declinar
                  </Button>
                </>
              )}

              {isPast && interview.status === "CONFIRMED" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusUpdate("COMPLETED")}
                  disabled={isUpdating}
                  className="text-purple-600 hover:text-purple-700"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Marcar Completada
                </Button>
              )}

              <Button
                size="sm"
                variant="outline"
                onClick={() => onMessage(interview.id)}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Mensajes
              </Button>
            </div>

            <div className="flex space-x-1">
              {onEdit && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(interview.id)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(interview.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
