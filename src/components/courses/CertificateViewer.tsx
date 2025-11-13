"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  Download,
  User,
  BookOpen,
  GraduationCap,
  ExternalLink,
  Copy,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Certificate } from "@/hooks/useCertificates";
import { CertificatePreview } from "@/components/certificates/CertificatePreview";

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

  // Ensure we have the full URL for the PDF viewer
  const pdfUrl = certificate.certificateUrl.startsWith('http')
    ? certificate.certificateUrl
    : `${window.location.origin}${certificate.certificateUrl}`;

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
      </div>

      {/* Certificate Display - React Preview */}
      <Card className="overflow-hidden">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Vista Previa del Certificado</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver PDF
                </a>
              </Button>
              <Button
                size="sm"
                onClick={handleDownload}
                disabled={isDownloading}
                className="bg-blue-600 hover:bg-blue-700"
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
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="max-w-3xl mx-auto">
              <CertificatePreview certificate={certificate} />
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

      {/* Certificate Verification Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="h-5 w-5" />
            <span className="ml-2">Verificación del Certificado</span>
          </CardTitle>
          <CardDescription>
            Este certificado es válido y puede ser verificado en el sistema de gestión académica de Emplea Emprende
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">ID de Verificación</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-mono font-medium">{certificate.id}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(certificate.id);
                    setIsCopied(true);
                    setTimeout(() => setIsCopied(false), 2000);
                  }}
                >
                  {isCopied ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Este ID puede ser usado para verificar la autenticidad del certificado
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
