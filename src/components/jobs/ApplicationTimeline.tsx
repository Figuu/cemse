"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Calendar,
  FileText,
  MessageCircle,
  Star,
  XCircle,
  ArrowRight,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate, formatDateTime } from "@/lib/utils";

interface TimelineEvent {
  id: string;
  type: "applied" | "reviewed" | "shortlisted" | "interview_scheduled" | "interview_completed" | "offered" | "rejected" | "withdrawn" | "pending";
  title: string;
  description: string;
  date: string;
  status: "completed" | "pending" | "cancelled";
  details?: {
    method?: string;
    documents?: string[];
    estimatedResponse?: string;
    responseTime?: number;
    reason?: string;
    nextStep?: string;
    estimatedTime?: string;
    offerType?: string;
    responseDeadline?: string;
    daysWaiting?: number;
    suggestedAction?: string;
  };
}

interface ApplicationTimelineProps {
  timeline: TimelineEvent[];
  className?: string;
}

export function ApplicationTimeline({ timeline, className }: ApplicationTimelineProps) {
  const getEventIcon = (type: string, status: string) => {
    if (status === "cancelled") {
      return <XCircle className="h-5 w-5 text-gray-400" />;
    }

    switch (type) {
      case "applied":
        return <FileText className="h-5 w-5 text-blue-600" />;
      case "reviewed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "shortlisted":
        return <Star className="h-5 w-5 text-purple-600" />;
      case "interview_scheduled":
      case "interview_completed":
        return <Calendar className="h-5 w-5 text-orange-600" />;
      case "offered":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "withdrawn":
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getEventColor = (type: string, status: string) => {
    if (status === "cancelled") return "text-gray-500";
    if (status === "pending") return "text-yellow-600";

    switch (type) {
      case "applied":
        return "text-blue-600";
      case "reviewed":
        return "text-green-600";
      case "shortlisted":
        return "text-purple-600";
      case "interview_scheduled":
      case "interview_completed":
        return "text-orange-600";
      case "offered":
        return "text-green-600";
      case "rejected":
        return "text-red-600";
      case "withdrawn":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="bg-green-100 text-green-800">Completado</Badge>;
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="text-gray-500">Cancelado</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Cronología de la Aplicación
        </CardTitle>
        <CardDescription>
          Seguimiento detallado del progreso de tu aplicación
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {timeline.map((event, index) => (
            <div key={event.id} className="relative">
              {/* Timeline line */}
              {index < timeline.length - 1 && (
                <div className="absolute left-6 top-8 w-0.5 h-16 bg-gray-200" />
              )}
              
              <div className="flex items-start space-x-4">
                {/* Icon */}
                <div className={cn(
                  "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center",
                  event.status === "completed" ? "bg-green-100" : 
                  event.status === "pending" ? "bg-yellow-100" : "bg-gray-100"
                )}>
                  {getEventIcon(event.type, event.status)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={cn(
                      "text-sm font-semibold",
                      getEventColor(event.type, event.status)
                    )}>
                      {event.title}
                    </h4>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(event.status)}
                      <span className="text-xs text-muted-foreground">
                        {formatDate(event.date)}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">
                    {event.description}
                  </p>

                  {/* Event details */}
                  {event.details && (
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                      {event.details.method && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <span className="font-medium mr-2">Método:</span>
                          {event.details.method}
                        </div>
                      )}

                      {event.details.documents && event.details.documents.length > 0 && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <span className="font-medium mr-2">Documentos:</span>
                          {event.details.documents.join(", ")}
                        </div>
                      )}

                      {event.details.estimatedResponse && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <span className="font-medium mr-2">Tiempo estimado:</span>
                          {event.details.estimatedResponse}
                        </div>
                      )}

                      {event.details.responseTime && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <span className="font-medium mr-2">Tiempo de respuesta:</span>
                          {event.details.responseTime} días
                        </div>
                      )}

                      {event.details.nextStep && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <span className="font-medium mr-2">Próximo paso:</span>
                          {event.details.nextStep}
                        </div>
                      )}

                      {event.details.estimatedTime && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <span className="font-medium mr-2">Tiempo estimado:</span>
                          {event.details.estimatedTime}
                        </div>
                      )}

                      {event.details.daysWaiting && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <span className="font-medium mr-2">Días esperando:</span>
                          {event.details.daysWaiting} días
                        </div>
                      )}

                      {event.details.suggestedAction && (
                        <div className="flex items-center text-xs text-blue-600">
                          <span className="font-medium mr-2">Sugerencia:</span>
                          {event.details.suggestedAction}
                        </div>
                      )}

                      {event.details.reason && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <span className="font-medium mr-2">Razón:</span>
                          {event.details.reason}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action buttons for pending events */}
                  {event.status === "pending" && event.type === "pending" && (
                    <div className="flex space-x-2 mt-3">
                      <Button size="sm" variant="outline">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Contactar
                      </Button>
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Ver Oferta
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Empty state */}
          {timeline.length === 0 && (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Sin cronología disponible</h3>
              <p className="text-muted-foreground">
                La cronología de esta aplicación aparecerá aquí una vez que haya actividad.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

