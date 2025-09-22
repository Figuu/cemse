"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Heart, TrendingUp } from "lucide-react";

interface TripleImpactData {
  problemSolved: string;
  beneficiaries: string;
  resourcesUsed: string;
  communityInvolvement: string;
  longTermImpact: string;
}

interface TripleImpactAnalysisProps {
  impactData: TripleImpactData;
  className?: string;
}


export function TripleImpactAnalysis({ 
  impactData, 
  className 
}: TripleImpactAnalysisProps) {
  
  // Simple completion check
  const getCompletionPercentage = () => {
    const fields = Object.values(impactData);
    const filledFields = fields.filter(field => field && field.trim().length > 0);
    return Math.round((filledFields.length / fields.length) * 100);
  };

  const completionPercentage = getCompletionPercentage();

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Análisis de Triple Impacto
            <Badge variant="outline" className="ml-2">
              {completionPercentage}% completado
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Impact Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Impacto Social
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h5 className="font-medium text-sm">Problema Resuelto:</h5>
                  <p className="text-sm text-gray-600 mt-1">
                    {impactData.problemSolved || "No especificado"}
                  </p>
                </div>
                <div>
                  <h5 className="font-medium text-sm">Beneficiarios:</h5>
                  <p className="text-sm text-gray-600 mt-1">
                    {impactData.beneficiaries || "No especificado"}
                  </p>
                </div>
                <div>
                  <h5 className="font-medium text-sm">Involucramiento Comunitario:</h5>
                  <p className="text-sm text-gray-600 mt-1">
                    {impactData.communityInvolvement || "No especificado"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Impacto a Largo Plazo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  {impactData.longTermImpact || "No especificado"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Resources Used */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-4 w-4" />
                Recursos Utilizados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                {impactData.resourcesUsed || "No especificado"}
              </p>
            </CardContent>
          </Card>

          {/* Simple Recommendations */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg text-blue-800">Recomendaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-blue-700">
                {completionPercentage < 50 && (
                  <p>• Completa todos los campos para tener una evaluación completa del triple impacto</p>
                )}
                {completionPercentage >= 50 && completionPercentage < 100 && (
                  <p>• ¡Buen progreso! Termina de completar los campos restantes</p>
                )}
                {completionPercentage === 100 && (
                  <p>• ¡Excelente! Has completado la evaluación de triple impacto</p>
                )}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
