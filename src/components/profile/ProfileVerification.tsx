"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Shield,
  User,
  Mail,
  Phone,
  FileText,
  Award,
  Camera,
  Upload
} from "lucide-react";

interface VerificationItem {
  id: string;
  name: string;
  description: string;
  status: "verified" | "pending" | "rejected" | "not-started";
  required: boolean;
  icon: React.ComponentType<{ className?: string }>;
  action?: string;
}

interface ProfileVerificationProps {
  className?: string;
}

export function ProfileVerification({ className }: ProfileVerificationProps) {
  const [verificationItems, setVerificationItems] = useState<VerificationItem[]>([
    {
      id: "email",
      name: "Verificación de Email",
      description: "Confirma tu dirección de email",
      status: "verified",
      required: true,
      icon: Mail,
      action: "Verificado"
    },
    {
      id: "phone",
      name: "Verificación de Teléfono",
      description: "Confirma tu número de teléfono",
      status: "pending",
      required: true,
      icon: Phone,
      action: "Verificar"
    },
    {
      id: "identity",
      name: "Verificación de Identidad",
      description: "Sube una foto de tu documento de identidad",
      status: "not-started",
      required: true,
      icon: User,
      action: "Subir Documento"
    },
    {
      id: "profile-picture",
      name: "Foto de Perfil",
      description: "Sube una foto profesional de tu perfil",
      status: "not-started",
      required: false,
      icon: Camera,
      action: "Subir Foto"
    },
    {
      id: "cv",
      name: "Currículum Vitae",
      description: "Sube tu CV actualizado",
      status: "not-started",
      required: false,
      icon: FileText,
      action: "Subir CV"
    },
    {
      id: "certificates",
      name: "Certificados",
      description: "Sube certificados que validen tus habilidades",
      status: "not-started",
      required: false,
      icon: Award,
      action: "Subir Certificados"
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "verified":
        return "Verificado";
      case "pending":
        return "Pendiente";
      case "rejected":
        return "Rechazado";
      default:
        return "No iniciado";
    }
  };

  const handleVerification = (id: string) => {
    setVerificationItems(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, status: "pending" as const }
          : item
      )
    );
    
    // Simulate verification process
    setTimeout(() => {
      setVerificationItems(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, status: "verified" as const }
            : item
        )
      );
    }, 2000);
  };

  const verifiedCount = verificationItems.filter(item => item.status === "verified").length;
  const totalCount = verificationItems.length;
  const requiredCount = verificationItems.filter(item => item.required).length;
  const verifiedRequiredCount = verificationItems.filter(item => item.required && item.status === "verified").length;
  const verificationPercentage = Math.round((verifiedCount / totalCount) * 100);
  const requiredVerificationPercentage = Math.round((verifiedRequiredCount / requiredCount) * 100);

  const isProfileVerified = verifiedRequiredCount === requiredCount;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Verification Status */}
      <Card className={isProfileVerified ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className={`h-6 w-6 ${isProfileVerified ? "text-green-600" : "text-yellow-600"}`} />
              <CardTitle className={isProfileVerified ? "text-green-900" : "text-yellow-900"}>
                Estado de Verificación
              </CardTitle>
            </div>
            <Badge className={isProfileVerified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
              {isProfileVerified ? "Verificado" : "Pendiente"}
            </Badge>
          </div>
          <CardDescription className={isProfileVerified ? "text-green-700" : "text-yellow-700"}>
            {isProfileVerified 
              ? "¡Tu perfil está completamente verificado! Esto aumenta tu credibilidad."
              : "Completa la verificación de tu perfil para aumentar tu credibilidad y visibilidad."
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progreso General</span>
              <span>{verificationPercentage}%</span>
            </div>
            <Progress value={verificationPercentage} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Verificaciones Requeridas</span>
              <span>{verifiedRequiredCount}/{requiredCount}</span>
            </div>
            <Progress value={requiredVerificationPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Verification Items */}
      <div className="space-y-4">
        {verificationItems.map(item => {
          const Icon = item.icon;
          return (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Icon className="h-6 w-6 text-gray-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-medium">{item.name}</h3>
                        {item.required && (
                          <Badge variant="outline" className="text-xs">
                            Requerido
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(item.status)}
                        <Badge className={getStatusColor(item.status)}>
                          {getStatusLabel(item.status)}
                        </Badge>
                      </div>
                    </div>
                    
                    {item.status !== "verified" && (
                      <Button
                        onClick={() => handleVerification(item.id)}
                        disabled={item.status === "pending"}
                        size="sm"
                      >
                        {item.status === "pending" ? (
                          <>
                            <Clock className="h-4 w-4 mr-2" />
                            Verificando...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            {item.action}
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Verification Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Beneficios de la Verificación</CardTitle>
          <CardDescription>
            Los perfiles verificados tienen ventajas en la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Mayor Credibilidad</h4>
                <p className="text-sm text-muted-foreground">
                  Los empleadores confían más en perfiles verificados
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Mejor Visibilidad</h4>
                <p className="text-sm text-muted-foreground">
                  Apareces primero en las búsquedas de candidatos
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Acceso Prioritario</h4>
                <p className="text-sm text-muted-foreground">
                  Acceso a ofertas de trabajo exclusivas
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Soporte Prioritario</h4>
                <p className="text-sm text-muted-foreground">
                  Atención al cliente prioritaria
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
