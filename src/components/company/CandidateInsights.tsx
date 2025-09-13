"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  GraduationCap, 
  Briefcase, 
  MapPin,
  TrendingUp,
  Award,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CandidateInsightsProps {
  insights: {
    totalCandidates: number;
    experienceLevels: Record<string, number>;
    educationLevels: Record<string, number>;
    topSkills: Array<{ skill: string; count: number }>;
    averageSkillsPerCandidate: number;
  };
  demographics: {
    byLocation: Array<{
      location: string;
      count: number;
      percentage: number;
    }>;
    totalCandidates: number;
  };
  className?: string;
}

export function CandidateInsights({ insights, demographics, className }: CandidateInsightsProps) {
  const getExperienceLabel = (level: string) => {
    switch (level) {
      case "NO_EXPERIENCE":
        return "Sin Experiencia";
      case "ENTRY_LEVEL":
        return "Nivel Inicial";
      case "MID_LEVEL":
        return "Nivel Medio";
      case "SENIOR_LEVEL":
        return "Nivel Senior";
      default:
        return level;
    }
  };

  const getEducationLabel = (level: string) => {
    switch (level) {
      case "NONE":
        return "Sin Educación Formal";
      case "HIGH_SCHOOL":
        return "Bachillerato";
      case "BACHELOR":
        return "Licenciatura";
      case "MASTER":
        return "Maestría";
      case "PHD":
        return "Doctorado";
      default:
        return level;
    }
  };

  const getExperienceColor = (level: string) => {
    switch (level) {
      case "NO_EXPERIENCE":
        return "bg-gray-100 text-gray-800";
      case "ENTRY_LEVEL":
        return "bg-blue-100 text-blue-800";
      case "MID_LEVEL":
        return "bg-green-100 text-green-800";
      case "SENIOR_LEVEL":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEducationColor = (level: string) => {
    switch (level) {
      case "NONE":
        return "bg-gray-100 text-gray-800";
      case "HIGH_SCHOOL":
        return "bg-blue-100 text-blue-800";
      case "BACHELOR":
        return "bg-green-100 text-green-800";
      case "MASTER":
        return "bg-purple-100 text-purple-800";
      case "PHD":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const experienceEntries = Object.entries(insights.experienceLevels).sort(([,a], [,b]) => b - a);
  const educationEntries = Object.entries(insights.educationLevels).sort(([,a], [,b]) => b - a);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Candidatos</p>
                <p className="text-2xl font-bold">{insights.totalCandidates}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Habilidades Promedio</p>
                <p className="text-2xl font-bold">{insights.averageSkillsPerCandidate.toFixed(1)}</p>
              </div>
              <Award className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ubicaciones</p>
                <p className="text-2xl font-bold">{demographics.byLocation.length}</p>
              </div>
              <MapPin className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Experience Levels */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Briefcase className="h-5 w-5 mr-2" />
              Niveles de Experiencia
            </CardTitle>
            <CardDescription>
              Distribución de candidatos por experiencia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {experienceEntries.map(([level, count]) => {
                const percentage = insights.totalCandidates > 0 ? 
                  Math.round((count / insights.totalCandidates) * 100) : 0;

                return (
                  <div key={level} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge className={getExperienceColor(level)}>
                          {getExperienceLabel(level)}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">{count}</span>
                        <span className="text-sm font-medium">{percentage}%</span>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Education Levels */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <GraduationCap className="h-5 w-5 mr-2" />
              Niveles de Educación
            </CardTitle>
            <CardDescription>
              Distribución de candidatos por educación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {educationEntries.map(([level, count]) => {
                const percentage = insights.totalCandidates > 0 ? 
                  Math.round((count / insights.totalCandidates) * 100) : 0;

                return (
                  <div key={level} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge className={getEducationColor(level)}>
                          {getEducationLabel(level)}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">{count}</span>
                        <span className="text-sm font-medium">{percentage}%</span>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Habilidades Más Demandadas
          </CardTitle>
          <CardDescription>
            Habilidades más comunes entre los candidatos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.topSkills.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay datos de habilidades disponibles</p>
              </div>
            ) : (
              insights.topSkills.map((skill, index) => {
                const percentage = insights.totalCandidates > 0 ? 
                  Math.round((skill.count / insights.totalCandidates) * 100) : 0;

                return (
                  <div key={skill.skill} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                        <span className="font-medium">{skill.skill}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">{skill.count} candidatos</span>
                        <span className="text-sm font-medium">{percentage}%</span>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Location Demographics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Distribución Geográfica
          </CardTitle>
          <CardDescription>
            Candidatos por ubicación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {demographics.byLocation.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay datos de ubicación disponibles</p>
              </div>
            ) : (
              demographics.byLocation.map((location) => (
                <div key={location.location} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{location.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">{location.count} candidatos</span>
                      <span className="text-sm font-medium">{location.percentage}%</span>
                    </div>
                  </div>
                  <Progress value={location.percentage} className="h-2" />
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
