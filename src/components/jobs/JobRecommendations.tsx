"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Lightbulb, 
  Star, 
  MapPin, 
  Briefcase, 
  Clock, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { JobRecommendation } from "@/hooks/useJobRecommendations";

interface JobRecommendationsProps {
  recommendations: JobRecommendation[];
  isLoading: boolean;
  error: string | null;
  onRefetch: () => void;
  onApply?: (jobId: string) => void;
  onBookmark?: (jobId: string) => void;
  className?: string;
}

export function JobRecommendations({ 
  recommendations, 
  isLoading, 
  error, 
  onRefetch,
  onApply,
  onBookmark,
  className 
}: JobRecommendationsProps) {
  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    if (percentage >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getMatchBadgeColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-100 text-green-800";
    if (percentage >= 60) return "bg-yellow-100 text-yellow-800";
    if (percentage >= 40) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  if (isLoading) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lightbulb className="h-5 w-5 mr-2 text-yellow-600" />
            Trabajos Recomendados
          </CardTitle>
          <CardDescription>
            Ofertas personalizadas basadas en tu perfil
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lightbulb className="h-5 w-5 mr-2 text-yellow-600" />
            Trabajos Recomendados
          </CardTitle>
          <CardDescription>
            Ofertas personalizadas basadas en tu perfil
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error al cargar recomendaciones</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={onRefetch}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lightbulb className="h-5 w-5 mr-2 text-yellow-600" />
            Trabajos Recomendados
          </CardTitle>
          <CardDescription>
            Ofertas personalizadas basadas en tu perfil
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay recomendaciones disponibles</h3>
            <p className="text-muted-foreground mb-4">
              Completa tu perfil para recibir recomendaciones personalizadas
            </p>
            <Button variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              Completar Perfil
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Lightbulb className="h-5 w-5 mr-2 text-yellow-600" />
              Trabajos Recomendados
            </CardTitle>
            <CardDescription>
              {recommendations.length} ofertas personalizadas basadas en tu perfil
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onRefetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((job) => (
          <div key={job.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-lg font-semibold">{job.title}</h3>
                  <Badge className={getMatchBadgeColor(job.matchPercentage)}>
                    {job.matchPercentage}% match
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                  <div className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-1" />
                    {job.company.name}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {job.location}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatDate(job.postedAt)}
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                  <span className="capitalize">{job.type.replace('_', ' ')}</span>
                  {job.remote && <span>• Remoto</span>}
                  {job.salary && (
                    <span>• {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()} {job.salary.currency}</span>
                  )}
                  <span>• {job.experience.replace('_', ' ')}</span>
                </div>

                {/* Match reasons */}
                <div className="mb-3">
                  <div className="flex items-center mb-2">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="text-sm font-medium">Por qué es ideal para ti:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {job.reasons.map((reason, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {reason}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Skills match */}
                {job.skills.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center mb-2">
                      <TrendingUp className="h-4 w-4 text-blue-500 mr-1" />
                      <span className="text-sm font-medium">Habilidades requeridas:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {job.skills.slice(0, 5).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {job.skills.length > 5 && (
                        <Badge variant="secondary" className="text-xs">
                          +{job.skills.length - 5} más
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Match progress bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Compatibilidad</span>
                    <span className={cn("text-sm font-semibold", getMatchColor(job.matchPercentage))}>
                      {job.matchPercentage}%
                    </span>
                  </div>
                  <Progress 
                    value={job.matchPercentage} 
                    className="h-2"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-2 ml-4">
                <Button 
                  size="sm" 
                  onClick={() => onApply?.(job.id)}
                  disabled={job.isApplied}
                >
                  {job.isApplied ? "Aplicado" : "Aplicar"}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onBookmark?.(job.id)}
                >
                  {job.isBookmarked ? "Guardado" : "Guardar"}
                </Button>
                <Button size="sm" variant="ghost">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Ver Detalles
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
