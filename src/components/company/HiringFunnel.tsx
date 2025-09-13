"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Eye, 
  UserCheck, 
  CheckCircle,
  TrendingUp,
  ArrowRight,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HiringFunnelProps {
  funnel: {
    applied: number;
    reviewed: number;
    shortlisted: number;
    hired: number;
    conversionRates: {
      reviewRate: number;
      shortlistRate: number;
      hireRate: number;
      overallHireRate: number;
    };
  };
  className?: string;
}

export function HiringFunnel({ funnel, className }: HiringFunnelProps) {
  const stages = [
    {
      key: "applied",
      label: "Aplicaciones Recibidas",
      count: funnel.applied,
      icon: Users,
      color: "bg-blue-100 text-blue-800",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      key: "reviewed",
      label: "En Revisión",
      count: funnel.reviewed,
      icon: Eye,
      color: "bg-yellow-100 text-yellow-800",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
    },
    {
      key: "shortlisted",
      label: "Preseleccionadas",
      count: funnel.shortlisted,
      icon: UserCheck,
      color: "bg-purple-100 text-purple-800",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
    {
      key: "hired",
      label: "Contratadas",
      count: funnel.hired,
      icon: CheckCircle,
      color: "bg-green-100 text-green-800",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
  ];

  const conversionSteps = [
    {
      from: "Aplicaciones",
      to: "Revisadas",
      rate: funnel.conversionRates.reviewRate,
      count: funnel.reviewed,
      total: funnel.applied,
    },
    {
      from: "Revisadas",
      to: "Preseleccionadas",
      rate: funnel.conversionRates.shortlistRate,
      count: funnel.shortlisted,
      total: funnel.reviewed,
    },
    {
      from: "Preseleccionadas",
      to: "Contratadas",
      rate: funnel.conversionRates.hireRate,
      count: funnel.hired,
      total: funnel.shortlisted,
    },
  ];

  const getConversionColor = (rate: number) => {
    if (rate >= 50) return "text-green-600";
    if (rate >= 25) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Funnel Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Embudo de Contratación
          </CardTitle>
          <CardDescription>
            Progreso de candidatos a través del proceso de selección
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stages.map((stage, index) => {
              const StageIcon = stage.icon;
              const percentage = funnel.applied > 0 ? 
                Math.round((stage.count / funnel.applied) * 100) : 0;

              return (
                <div key={stage.key} className="relative">
                  <div className={cn(
                    "flex items-center justify-between p-4 rounded-lg border-2",
                    stage.bgColor,
                    stage.borderColor
                  )}>
                    <div className="flex items-center space-x-3">
                      <div className={cn("p-2 rounded-full", stage.bgColor)}>
                        <StageIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{stage.label}</h4>
                        <p className="text-sm text-muted-foreground">
                          {stage.count} candidatos
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold">{stage.count}</span>
                        <Badge className={stage.color}>
                          {percentage}%
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-2">
                    <Progress value={percentage} className="h-2" />
                  </div>

                  {/* Arrow to next stage */}
                  {index < stages.length - 1 && (
                    <div className="flex justify-center my-4">
                      <ArrowRight className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Conversion Rates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Tasas de Conversión
          </CardTitle>
          <CardDescription>
            Eficiencia en cada etapa del proceso de selección
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {conversionSteps.map((step, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">
                      {step.from} → {step.to}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {step.count} de {step.total} candidatos
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      "text-2xl font-bold",
                      getConversionColor(step.rate)
                    )}>
                      {step.rate}%
                    </span>
                  </div>
                </div>
                <Progress value={step.rate} className="h-2" />
              </div>
            ))}

            {/* Overall Conversion Rate */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-lg">Tasa de Conversión General</h4>
                  <p className="text-sm text-muted-foreground">
                    Aplicaciones a contrataciones
                  </p>
                </div>
                <div className="text-right">
                  <span className={cn(
                    "text-3xl font-bold",
                    getConversionColor(funnel.conversionRates.overallHireRate)
                  )}>
                    {funnel.conversionRates.overallHireRate}%
                  </span>
                  <p className="text-sm text-muted-foreground">
                    {funnel.hired} de {funnel.applied} aplicaciones
                  </p>
                </div>
              </div>
              <Progress 
                value={funnel.conversionRates.overallHireRate} 
                className="h-3 mt-2" 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Insights Clave</CardTitle>
          <CardDescription>
            Recomendaciones basadas en el rendimiento del embudo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {funnel.conversionRates.reviewRate < 30 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800">Revisión Lenta</h4>
                <p className="text-sm text-yellow-700">
                  Solo el {funnel.conversionRates.reviewRate}% de las aplicaciones son revisadas. 
                  Considera automatizar el proceso de preselección.
                </p>
              </div>
            )}

            {funnel.conversionRates.shortlistRate < 20 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800">Preselección Baja</h4>
                <p className="text-sm text-blue-700">
                  Solo el {funnel.conversionRates.shortlistRate}% de las aplicaciones revisadas 
                  pasan a preselección. Revisa los criterios de selección.
                </p>
              </div>
            )}

            {funnel.conversionRates.hireRate < 50 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-800">Contratación Baja</h4>
                <p className="text-sm text-red-700">
                  Solo el {funnel.conversionRates.hireRate}% de los preseleccionados son contratados. 
                  Mejora el proceso de entrevistas.
                </p>
              </div>
            )}

            {funnel.conversionRates.overallHireRate >= 10 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-800">Excelente Rendimiento</h4>
                <p className="text-sm text-green-700">
                  Tu tasa de conversión general del {funnel.conversionRates.overallHireRate}% 
                  está por encima del promedio de la industria.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
