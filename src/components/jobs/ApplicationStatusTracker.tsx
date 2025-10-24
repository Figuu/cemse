"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Calendar,
  FileText,
  Star,
  TrendingUp,
  TrendingDown,
  Target,
  MessageCircle,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";

interface ApplicationStatusTrackerProps {
  application: {
    id: string;
    jobTitle: string;
    company: string;
    status: string;
    appliedDate: string;
    lastUpdated: string;
    daysSinceApplied: number;
    responseTime: number | null;
    nextSteps?: string;
    priority: "low" | "medium" | "high";
  };
  className?: string;
}

export function ApplicationStatusTracker({ application, className }: ApplicationStatusTrackerProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "applied":
        return {
          label: "Aplicado",
          color: "bg-main-blue/10 text-main-blue",
          icon: FileText,
          progress: 20,
          description: "Tu aplicación ha sido enviada y está en revisión"
        };
      case "reviewing":
        return {
          label: "En Revisión",
          color: "bg-orange-light/10 text-orange-light",
          icon: Clock,
          progress: 40,
          description: "El empleador está revisando tu aplicación"
        };
      case "shortlisted":
        return {
          label: "Preseleccionado",
          color: "bg-purple-gender/10 text-purple-gender",
          icon: Star,
          progress: 60,
          description: "Has sido preseleccionado para la siguiente etapa"
        };
      case "interview":
        return {
          label: "Entrevista",
          color: "bg-orange-economy/10 text-orange-economy",
          icon: Calendar,
          progress: 80,
          description: "Tienes una entrevista programada"
        };
      case "offered":
        return {
          label: "Oferta",
          color: "bg-green-success/10 text-green-success",
          icon: CheckCircle,
          progress: 100,
          description: "¡Felicitaciones! Has recibido una oferta"
        };
      case "rejected":
        return {
          label: "Rechazado",
          color: "bg-red-100 text-red-800",
          icon: AlertCircle,
          progress: 0,
          description: "Tu aplicación no fue seleccionada"
        };
      default:
        return {
          label: "Desconocido",
          color: "bg-gray-100 text-gray-800",
          icon: Clock,
          progress: 0,
          description: "Estado no reconocido"
        };
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case "high":
        return {
          label: "Alta",
          color: "bg-red-100 text-red-800",
          icon: AlertCircle
        };
      case "medium":
        return {
          label: "Media",
          color: "bg-yellow-100 text-yellow-800",
          icon: Clock
        };
      case "low":
        return {
          label: "Baja",
          color: "bg-green-100 text-green-800",
          icon: CheckCircle
        };
      default:
        return {
          label: "Normal",
          color: "bg-gray-100 text-gray-800",
          icon: Clock
        };
    }
  };

  const getResponseTimeStatus = (responseTime: number | null, daysSinceApplied: number) => {
    if (!responseTime) {
      if (daysSinceApplied > 14) {
        return {
          status: "slow",
          message: "Respuesta tardía",
          icon: TrendingDown,
          color: "text-red-600"
        };
      } else if (daysSinceApplied > 7) {
        return {
          status: "normal",
          message: "Tiempo normal",
          icon: Clock,
          color: "text-yellow-600"
        };
      } else {
        return {
          status: "recent",
          message: "Aplicación reciente",
          icon: TrendingUp,
          color: "text-green-600"
        };
      }
    }

    if (responseTime <= 3) {
      return {
        status: "fast",
        message: "Respuesta rápida",
        icon: TrendingUp,
        color: "text-green-600"
      };
    } else if (responseTime <= 7) {
      return {
        status: "normal",
        message: "Tiempo normal",
        icon: Clock,
        color: "text-yellow-600"
      };
    } else {
      return {
        status: "slow",
        message: "Respuesta lenta",
        icon: TrendingDown,
        color: "text-red-600"
      };
    }
  };

  const statusConfig = getStatusConfig(application.status);
  const priorityConfig = getPriorityConfig(application.priority);
  const responseTimeStatus = getResponseTimeStatus(application.responseTime, application.daysSinceApplied);
  const StatusIcon = statusConfig.icon;
  const PriorityIcon = priorityConfig.icon;
  const ResponseTimeIcon = responseTimeStatus.icon;

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{application.jobTitle}</CardTitle>
            <CardDescription>{application.company}</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Badge className={statusConfig.color}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusConfig.label}
            </Badge>
            <Badge variant="outline" className={priorityConfig.color}>
              <PriorityIcon className="h-3 w-3 mr-1" />
              {priorityConfig.label}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Progreso de la aplicación</span>
            <span className="text-sm text-muted-foreground">{statusConfig.progress}%</span>
          </div>
          <Progress value={statusConfig.progress} className="h-2" />
          <p className="text-xs text-muted-foreground">{statusConfig.description}</p>
        </div>

        {/* Timeline info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2" />
              Aplicado
            </div>
            <p className="text-sm font-medium">{formatDate(application.appliedDate)}</p>
            <p className="text-xs text-muted-foreground">
              {application.daysSinceApplied} días atrás
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-2" />
              Última actualización
            </div>
            <p className="text-sm font-medium">{formatDate(application.lastUpdated)}</p>
            <p className="text-xs text-muted-foreground">
              {Math.floor((new Date().getTime() - new Date(application.lastUpdated).getTime()) / (1000 * 60 * 60 * 24))} días atrás
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center text-sm text-muted-foreground">
              <ResponseTimeIcon className={cn("h-4 w-4 mr-2", responseTimeStatus.color)} />
              Tiempo de respuesta
            </div>
            <p className="text-sm font-medium">
              {application.responseTime ? `${application.responseTime} días` : "Pendiente"}
            </p>
            <p className={cn("text-xs", responseTimeStatus.color)}>
              {responseTimeStatus.message}
            </p>
          </div>
        </div>

        {/* Next steps */}
        {application.nextSteps && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Target className="h-4 w-4 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-1">Próximos pasos</h4>
                <p className="text-sm text-blue-800">{application.nextSteps}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex space-x-2">
          <Button size="sm" variant="outline">
            <MessageCircle className="h-4 w-4 mr-2" />
            Contactar
          </Button>
          <Button size="sm" variant="outline">
            <ExternalLink className="h-4 w-4 mr-2" />
            Ver Oferta
          </Button>
          {application.status === "offered" && (
            <Button size="sm" className="bg-green-600 hover:bg-green-700">
              Responder Oferta
            </Button>
          )}
        </div>

        {/* Status-specific insights */}
        {application.status === "applied" && application.daysSinceApplied > 7 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-900 mb-1">Sugerencia</h4>
                <p className="text-sm text-yellow-800">
                  Han pasado {application.daysSinceApplied} días desde tu aplicación. 
                  Considera hacer seguimiento o aplicar a otras oportunidades similares.
                </p>
              </div>
            </div>
          </div>
        )}

        {application.status === "shortlisted" && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Star className="h-4 w-4 text-purple-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-purple-900 mb-1">¡Excelente!</h4>
                <p className="text-sm text-purple-800">
                  Has sido preseleccionado. Prepárate para posibles entrevistas o pruebas adicionales.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

