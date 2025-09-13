"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Target, 
  Lightbulb, 
  Star,
  MapPin,
  Briefcase,
  GraduationCap,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RecommendationInsightsProps {
  profile: {
    skills: string[];
    experienceLevel: string;
    educationLevel: string;
    location: string;
  };
  recommendations: Array<{
    matchPercentage: number;
    reasons: string[];
    company: { name: string };
    location: string;
    skills: string[];
    experience: string;
    education: string;
    salary?: { min: number; max: number; currency: string };
  }>;
  className?: string;
}

export function RecommendationInsights({ profile, recommendations, className }: RecommendationInsightsProps) {
  // Analyze recommendations to generate insights
  const insights = generateInsights(profile, recommendations);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "skills": return <Target className="h-4 w-4" />;
      case "location": return <MapPin className="h-4 w-4" />;
      case "experience": return <Briefcase className="h-4 w-4" />;
      case "education": return <GraduationCap className="h-4 w-4" />;
      case "salary": return <DollarSign className="h-4 w-4" />;
      case "trending": return <TrendingUp className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case "positive": return "text-green-600 bg-green-50 border-green-200";
      case "warning": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "info": return "text-blue-600 bg-blue-50 border-blue-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Profile Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="h-5 w-5 mr-2 text-blue-600" />
            Análisis de tu Perfil
          </CardTitle>
          <CardDescription>
            Cómo tu perfil se compara con las ofertas disponibles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Habilidades</span>
                <Badge variant="outline">{profile.skills.length} habilidades</Badge>
              </div>
              <div className="flex flex-wrap gap-1">
                {profile.skills.slice(0, 5).map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {profile.skills.length > 5 && (
                  <Badge variant="secondary" className="text-xs">
                    +{profile.skills.length - 5} más
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Experiencia</span>
                <Badge variant="outline">
                  {profile.experienceLevel.replace('_', ' ')}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Educación</span>
                <Badge variant="outline">
                  {profile.educationLevel.replace('_', ' ')}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Ubicación</span>
                <Badge variant="outline">
                  {profile.location || "No especificada"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <Card key={index} className={cn("border-l-4", getInsightColor(insight.type))}>
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {getInsightIcon(insight.category)}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium mb-1">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                  {insight.suggestions && insight.suggestions.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Sugerencias:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {insight.suggestions.map((suggestion, i) => (
                          <li key={i} className="flex items-center">
                            <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Market Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
            Tendencias del Mercado
          </CardTitle>
          <CardDescription>
            Información sobre las ofertas disponibles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{recommendations.length}</div>
              <div className="text-sm text-muted-foreground">Ofertas recomendadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(recommendations.reduce((acc, rec) => acc + rec.matchPercentage, 0) / recommendations.length || 0)}%
              </div>
              <div className="text-sm text-muted-foreground">Compatibilidad promedio</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(recommendations.map(rec => rec.company.name)).size}
              </div>
              <div className="text-sm text-muted-foreground">Empresas diferentes</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function generateInsights(profile: any, recommendations: any[]) {
  const insights = [];

  // Skills analysis
  const allRequiredSkills = recommendations.flatMap(rec => rec.skills);
  const skillFrequency = allRequiredSkills.reduce((acc, skill) => {
    acc[skill] = (acc[skill] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topSkills = Object.entries(skillFrequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([skill]) => skill);

  const missingSkills = topSkills.filter(skill => 
    !profile.skills.some((userSkill: string) => 
      userSkill.toLowerCase().includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(userSkill.toLowerCase())
    )
  );

  if (missingSkills.length > 0) {
    insights.push({
      category: "skills",
      type: "warning",
      title: "Habilidades en demanda",
      description: `Las siguientes habilidades son muy solicitadas en las ofertas recomendadas: ${missingSkills.slice(0, 3).join(", ")}.`,
      suggestions: [
        "Considera tomar cursos o certificaciones en estas áreas",
        "Practica proyectos que involucren estas tecnologías",
        "Actualiza tu perfil con estas habilidades"
      ]
    });
  }

  // Experience level analysis
  const experienceLevels = recommendations.map(rec => rec.experience);
  const mostCommonExperience = experienceLevels.reduce((acc, level) => {
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topExperience = Object.entries(mostCommonExperience)
    .sort(([,a], [,b]) => b - a)[0]?.[0];

  if (topExperience && topExperience !== profile.experienceLevel) {
    insights.push({
      category: "experience",
      type: "info",
      title: "Nivel de experiencia más solicitado",
      description: `La mayoría de las ofertas recomendadas requieren nivel ${topExperience.replace('_', ' ')}.`,
      suggestions: [
        "Considera aplicar a ofertas de nivel junior para ganar experiencia",
        "Destaca proyectos relevantes en tu perfil",
        "Busca oportunidades de crecimiento profesional"
      ]
    });
  }

  // Location analysis
  const locations = recommendations.map(rec => rec.location);
  const locationCounts = locations.reduce((acc, location) => {
    const city = location.split(',')[0];
    acc[city] = (acc[city] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topLocation = Object.entries(locationCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0];

  if (topLocation && !profile.location?.toLowerCase().includes(topLocation.toLowerCase())) {
    insights.push({
      category: "location",
      type: "info",
      title: "Oportunidades en otras ubicaciones",
      description: `Hay muchas ofertas disponibles en ${topLocation}.`,
      suggestions: [
        "Considera oportunidades remotas o híbridas",
        "Investiga el mercado laboral en esa ciudad",
        "Actualiza tu ubicación preferida en el perfil"
      ]
    });
  }

  // Salary analysis
  const salaries = recommendations
    .filter(rec => rec.salary)
    .map(rec => (rec.salary!.min + rec.salary!.max) / 2);

  if (salaries.length > 0) {
    const avgSalary = salaries.reduce((acc, salary) => acc + salary, 0) / salaries.length;
    insights.push({
      category: "salary",
      type: "positive",
      title: "Rango salarial del mercado",
      description: `El salario promedio en las ofertas recomendadas es de ${Math.round(avgSalary).toLocaleString()} BOB.`,
      suggestions: [
        "Investiga los rangos salariales para tu nivel de experiencia",
        "Considera el costo de vida en diferentes ubicaciones",
        "Negocia basándote en el valor que aportas"
      ]
    });
  }

  // General insights
  if (recommendations.length > 0) {
    const highMatchJobs = recommendations.filter(rec => rec.matchPercentage >= 80);
    
    if (highMatchJobs.length > 0) {
      insights.push({
        category: "trending",
        type: "positive",
        title: "Excelentes oportunidades",
        description: `Tienes ${highMatchJobs.length} ofertas con más del 80% de compatibilidad.`,
        suggestions: [
          "Prioriza aplicar a estas ofertas de alta compatibilidad",
          "Personaliza tu aplicación destacando las coincidencias",
          "Prepara ejemplos específicos de tu experiencia"
        ]
      });
    }
  }

  return insights;
}
