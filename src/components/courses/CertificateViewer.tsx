"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Award, 
  Download, 
  Share2, 
  Calendar, 
  User, 
  BookOpen,
  GraduationCap,
  ExternalLink,
  Copy,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Certificate } from "@/hooks/useCertificates";

interface CertificateViewerProps {
  certificate: Certificate;
  onDownload: (certificateId: string) => Promise<void>;
  onShare?: (certificateId: string) => void;
  onBack?: () => void;
  className?: string;
}

export function CertificateViewer({ 
  certificate, 
  onDownload, 
  onShare,
  onBack,
  className 
}: CertificateViewerProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await onDownload(certificate.id);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(certificate.certificateUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy URL:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "course":
        return <GraduationCap className="h-6 w-6" />;
      case "module":
        return <BookOpen className="h-6 w-6" />;
      default:
        return <Award className="h-6 w-6" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "course":
        return "bg-blue-100 text-blue-800";
      case "module":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "course":
        return "Certificado de Curso";
      case "module":
        return "Certificado de Módulo";
      default:
        return "Certificado";
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack}>
              ← Volver
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {getTypeLabel(certificate.type)}
            </h1>
            <p className="text-muted-foreground">
              {certificate.course.title}
              {certificate.module && ` • ${certificate.module.title}`}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          {onShare && (
            <Button variant="outline" size="sm" onClick={() => onShare(certificate.id)}>
              <Share2 className="h-4 w-4 mr-2" />
              Compartir
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleDownload}
            disabled={isDownloading}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            {isDownloading ? (
              <>
                <Download className="h-4 w-4 mr-2 animate-pulse" />
                Descargando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Descargar PDF
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Certificate Display */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 min-h-[600px] relative">
            {/* Certificate Border */}
            <div className="absolute inset-4 border-4 border-yellow-400 rounded-lg"></div>
            <div className="absolute inset-8 border-2 border-yellow-300 rounded-lg"></div>
            
            {/* Certificate Content */}
            <div className="relative z-10 p-12 h-full flex flex-col items-center justify-center text-center">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center justify-center mb-4">
                  <Award className="h-16 w-16 text-yellow-600" />
                </div>
                <h2 className="text-4xl font-bold text-gray-800 mb-2">
                  CERTIFICADO DE COMPLETACIÓN
                </h2>
                <div className="w-32 h-1 bg-yellow-600 mx-auto"></div>
              </div>

              {/* Student Name */}
              <div className="mb-8">
                <p className="text-lg text-gray-600 mb-2">Se certifica que</p>
                <h3 className="text-3xl font-bold text-gray-800 mb-2">
                  {certificate.student.name}
                </h3>
                <p className="text-lg text-gray-600">
                  ha completado exitosamente el {certificate.type === "course" ? "curso" : "módulo"}
                </p>
              </div>

              {/* Course/Module Title */}
              <div className="mb-8">
                <h4 className="text-2xl font-semibold text-gray-800 mb-2">
                  {certificate.course.title}
                </h4>
                {certificate.module && (
                  <p className="text-xl text-gray-600">
                    Módulo: {certificate.module.title}
                  </p>
                )}
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 w-full max-w-2xl">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Calendar className="h-5 w-5 text-gray-600 mr-2" />
                    <span className="font-semibold text-gray-700">Fecha de Completación</span>
                  </div>
                  <p className="text-gray-600">{formatDate(certificate.issuedAt)}</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <User className="h-5 w-5 text-gray-600 mr-2" />
                    <span className="font-semibold text-gray-700">Instructor</span>
                  </div>
                  <p className="text-gray-600">
                    {certificate.course.instructor?.name || "Sistema Emplea y Emprende"}
                  </p>
                </div>
              </div>

              {/* Certificate ID */}
              <div className="mt-8">
                <p className="text-sm text-gray-500 mb-2">ID del Certificado</p>
                <p className="text-lg font-mono text-gray-700">{certificate.id}</p>
              </div>

              {/* Footer */}
              <div className="mt-12 pt-8 border-t border-yellow-300 w-full">
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <div className="w-24 h-16 bg-gray-200 rounded mb-2 mx-auto"></div>
                    <p className="text-sm text-gray-600">Firma del Instructor</p>
                  </div>
                  <div className="text-center">
                    <div className="w-24 h-16 bg-gray-200 rounded mb-2 mx-auto"></div>
                    <p className="text-sm text-gray-600">Sello Institucional</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certificate Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {getTypeIcon(certificate.type)}
              <span className="ml-2">Información del Certificado</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tipo</span>
                <Badge className={getTypeColor(certificate.type)}>
                  {certificate.type === "course" ? "Curso" : "Módulo"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Emitido el</span>
                <span className="text-sm font-medium">{formatDate(certificate.issuedAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">ID del Certificado</span>
                <span className="text-sm font-mono">{certificate.id}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5" />
              <span className="ml-2">Información del Estudiante</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Nombre</span>
                <span className="text-sm font-medium">{certificate.student.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Email</span>
                <span className="text-sm font-medium">{certificate.student.email}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Certificate URL */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ExternalLink className="h-5 w-5" />
            <span className="ml-2">URL del Certificado</span>
          </CardTitle>
          <CardDescription>
            Comparte este enlace para verificar la autenticidad del certificado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={certificate.certificateUrl}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyUrl}
            >
              {isCopied ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  Copiar
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
