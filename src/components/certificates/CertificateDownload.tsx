"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  FileText, 
  CheckCircle, 
  Loader2,
  AlertCircle,
  Award
} from "lucide-react";
import { useCertificate } from "@/hooks/useCertificate";

interface CertificateDownloadProps {
  courseId: string;
  courseTitle: string;
  isCompleted: boolean;
  hasCertification: boolean;
}

export function CertificateDownload({ 
  courseId, 
  courseTitle,
  isCompleted,
  hasCertification 
}: CertificateDownloadProps) {
  const {
    hasCertificate,
    certificateUrl,
    isCompleted: certIsCompleted,
    hasCertification: certHasCertification,
    isLoading,
    isGenerating,
    error,
    generateCertificate,
    downloadCertificate,
  } = useCertificate(courseId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Verificando certificado...</span>
        </CardContent>
      </Card>
    );
  }

  // Don't show certificate section if course doesn't have certification
  if (!hasCertification || !certHasCertification) {
    return null;
  }

  // Don't show certificate section if course is not completed
  if (!isCompleted || !certIsCompleted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Award className="h-5 w-5 mr-2 text-yellow-500" />
            Certificado de Completación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-muted-foreground">
              Completa el curso al 100% para obtener tu certificado
            </p>
            <Badge variant="outline" className="mt-2">
              Progreso: {Math.round((certIsCompleted ? 100 : 0))}%
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Award className="h-5 w-5 mr-2 text-yellow-500" />
          Certificado de Completación
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
              <span className="text-sm text-red-700">
                {error instanceof Error ? error.message : String(error)}
              </span>
            </div>
          </div>
        )}

        {hasCertificate ? (
          <div className="text-center py-4">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">¡Certificado Disponible!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Has completado exitosamente el curso "{courseTitle}" y tu certificado está listo para descargar.
            </p>
            <Button onClick={downloadCertificate} className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              Descargar Certificado PDF
            </Button>
          </div>
        ) : (
          <div className="text-center py-4">
            <FileText className="h-12 w-12 text-blue-500 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Generar Certificado</h3>
            <p className="text-sm text-muted-foreground mb-4">
              ¡Felicidades! Has completado el curso. Genera tu certificado oficial.
            </p>
            <Button 
              onClick={generateCertificate} 
              disabled={isGenerating}
              className="w-full sm:w-auto"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Award className="h-4 w-4 mr-2" />
                  Generar Certificado
                </>
              )}
            </Button>
          </div>
        )}

        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Estado del curso:</span>
            <Badge variant="default" className="bg-green-500">
              Completado
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground mt-1">
            <span>Certificación:</span>
            <Badge variant="outline">
              Disponible
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
