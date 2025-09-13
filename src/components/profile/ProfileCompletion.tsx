"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Target } from "lucide-react";

interface ProfileCompletionProps {
  percentage: number;
  className?: string;
}

export function ProfileCompletion({ percentage, className }: ProfileCompletionProps) {
  const getCompletionStatus = (percentage: number) => {
    if (percentage >= 90) {
      return {
        status: "excellent",
        icon: CheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        message: "¡Excelente! Tu perfil está casi completo.",
        action: "Tu perfil se ve muy profesional"
      };
    } else if (percentage >= 70) {
      return {
        status: "good",
        icon: Target,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        message: "Buen trabajo, pero puedes mejorar tu perfil.",
        action: "Completa algunos campos más para destacar"
      };
    } else {
      return {
        status: "needs-work",
        icon: AlertCircle,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
        message: "Tu perfil necesita más información.",
        action: "Completa tu perfil para mejores oportunidades"
      };
    }
  };

  const completionStatus = getCompletionStatus(percentage);
  const Icon = completionStatus.icon;

  const getMissingFields = (percentage: number) => {
    const fields = [
      { name: "Información personal básica", completed: percentage > 20 },
      { name: "Información de contacto", completed: percentage > 40 },
      { name: "Título profesional", completed: percentage > 60 },
      { name: "Biografía", completed: percentage > 80 },
      { name: "Foto de perfil", completed: percentage > 90 },
    ];

    return fields.filter(field => !field.completed);
  };

  const missingFields = getMissingFields(percentage);

  return (
    <Card className={`${completionStatus.bgColor} ${completionStatus.borderColor} border-2 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon className={`h-5 w-5 ${completionStatus.color}`} />
            <CardTitle className={completionStatus.color}>
              Completitud del Perfil
            </CardTitle>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${completionStatus.color}`}>
              {percentage}%
            </div>
            <div className="text-sm text-muted-foreground">
              Completado
            </div>
          </div>
        </div>
        <CardDescription>
          {completionStatus.message}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progreso</span>
            <span>{percentage}%</span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>

        {percentage < 100 && (
          <div className="space-y-3">
            <div className="text-sm font-medium text-muted-foreground">
              Campos pendientes:
            </div>
            <div className="space-y-2">
              {missingFields.map((field, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <div className="h-2 w-2 bg-orange-400 rounded-full" />
                  <span>{field.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {
              // Scroll to profile form or open edit mode
              const profileForm = document.getElementById('profile-form');
              if (profileForm) {
                profileForm.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            {percentage < 100 ? "Completar Perfil" : completionStatus.action}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
