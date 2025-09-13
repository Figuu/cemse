"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Award, 
  Download, 
  ExternalLink, 
  Calendar, 
  User, 
  BookOpen,
  GraduationCap,
  Share2,
  Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Certificate } from "@/hooks/useCertificates";

interface CertificateCardProps {
  certificate: Certificate;
  onDownload: (certificateId: string) => Promise<void>;
  onView: (certificateId: string) => void;
  onShare?: (certificateId: string) => void;
  showActions?: boolean;
  className?: string;
}

export function CertificateCard({ 
  certificate, 
  onDownload, 
  onView,
  onShare,
  showActions = true,
  className 
}: CertificateCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await onDownload(certificate.id);
    } finally {
      setIsDownloading(false);
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
        return <GraduationCap className="h-5 w-5" />;
      case "module":
        return <BookOpen className="h-5 w-5" />;
      default:
        return <Award className="h-5 w-5" />;
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
        return "Curso";
      case "module":
        return "Módulo";
      default:
        return type;
    }
  };

  return (
    <Card className={cn("hover:shadow-lg transition-all duration-200 group", className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              {getTypeIcon(certificate.type)}
            </div>
            <div>
              <CardTitle className="text-lg">{certificate.course.title}</CardTitle>
              {certificate.module && (
                <CardDescription className="mt-1">
                  Módulo: {certificate.module.title}
                </CardDescription>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getTypeColor(certificate.type)}>
              {getTypeLabel(certificate.type)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Certificate Info */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>Emitido para: {certificate.student.name}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Emitido el: {formatDate(certificate.issuedAt)}</span>
          </div>

          {certificate.course.instructor && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Instructor: {certificate.course.instructor.name}</span>
            </div>
          )}
        </div>

        {/* Certificate Preview */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4 border-2 border-dashed border-yellow-200">
          <div className="text-center space-y-2">
            <Award className="h-12 w-12 text-yellow-600 mx-auto" />
            <h3 className="font-semibold text-yellow-800">Certificado de Completación</h3>
            <p className="text-sm text-yellow-700">
              {certificate.type === "course" ? "Curso" : "Módulo"} completado exitosamente
            </p>
            <div className="text-xs text-yellow-600">
              ID: {certificate.id}
            </div>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView(certificate.id)}
              >
                <Eye className="h-4 w-4 mr-1" />
                Ver
              </Button>
              {onShare && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onShare(certificate.id)}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={handleDownload}
                disabled={isDownloading}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                {isDownloading ? (
                  <>
                    <Download className="h-4 w-4 mr-1 animate-pulse" />
                    Descargando...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-1" />
                    Descargar
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Certificate URL */}
        <div className="text-xs text-muted-foreground break-all">
          <span className="font-medium">URL:</span> {certificate.certificateUrl}
        </div>
      </CardContent>
    </Card>
  );
}
