"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Star,
  Award,
  BookOpen,
  Briefcase,
  Users,
  Eye,
  ArrowRight,
  Lightbulb
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileInsightsProps {
  analytics: {
    profileCompleteness: {
      percentage: number;
      missingFields: string[];
    };
    skills: {
      total: number;
      verified: number;
      averageLevel: number;
      topSkills: { name: string; level: number; views: number }[];
    };
  };
  className?: string;
}

export function ProfileInsights({ analytics, className }: ProfileInsightsProps) {
  const getCompletenessColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 70) return "text-yellow-600";
    return "text-red-600";
  };


  const getSkillLevelColor = (level: number) => {
    if (level >= 4) return "text-green-600";
    if (level >= 3) return "text-yellow-600";
    return "text-red-600";
  };

  const getMatchColor = (match: number) => {
    if (match >= 90) return "bg-green-100 text-green-800";
    if (match >= 70) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Profile Completeness Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Completitud del Perfil
          </CardTitle>
          <CardDescription>
            Tu perfil está {analytics.profileCompleteness.percentage}% completo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progreso general</span>
              <span className={cn("text-sm font-bold", getCompletenessColor(analytics.profileCompleteness.percentage))}>
                {analytics.profileCompleteness.percentage}%
              </span>
            </div>
            <Progress 
              value={analytics.profileCompleteness.percentage} 
              className="h-3"
            />
          </div>

          {analytics.profileCompleteness.missingFields.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 text-yellow-600" />
                Campos que necesitas completar:
              </h4>
              <div className="space-y-1">
                {analytics.profileCompleteness.missingFields.map((field, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-muted-foreground">{field}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analytics.profileCompleteness.percentage >= 90 && (
            <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm text-green-800 font-medium">
                ¡Excelente! Tu perfil está muy completo.
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skills Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="h-5 w-5 mr-2" />
            Análisis de Habilidades
          </CardTitle>
          <CardDescription>
            Rendimiento de tus habilidades más vistas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{analytics.skills.total}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{analytics.skills.verified}</div>
              <div className="text-sm text-muted-foreground">Verificadas</div>
            </div>
            <div>
              <div className={cn("text-2xl font-bold", getSkillLevelColor(analytics.skills.averageLevel))}>
                {analytics.skills.averageLevel.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">Nivel Promedio</div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Habilidades más vistas:</h4>
            {analytics.skills.topSkills.map((skill, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{skill.name}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={cn(
                          "h-3 w-3",
                          i < skill.level ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        )} 
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Eye className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{skill.views}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>


      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Próximos Pasos
          </CardTitle>
          <CardDescription>
            Acciones recomendadas para mejorar tu perfil
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.profileCompleteness.percentage < 90 && (
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">Completa los campos faltantes en tu perfil</span>
                </div>
                <Button size="sm" variant="outline">
                  Completar Perfil
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            )}

            {analytics.skills.verified < analytics.skills.total && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Verifica más habilidades para aumentar tu credibilidad</span>
                </div>
                <Button size="sm" variant="outline">
                  Verificar Habilidades
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-green-600" />
                <span className="text-sm">Conecta con más profesionales en tu área</span>
              </div>
              <Button size="sm" variant="outline">
                Explorar Conexiones
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

