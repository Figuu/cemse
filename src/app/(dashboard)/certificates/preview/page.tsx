"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, RefreshCw } from "lucide-react";

export default function CertificatePreviewPage() {
  const [loading, setLoading] = useState(false);
  const [certificateUrl, setCertificateUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generatePreview = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/certificates/preview');
      const data = await response.json();

      if (data.success && data.certificateUrl) {
        setCertificateUrl(data.certificateUrl);
      } else {
        setError(data.error || 'Failed to generate preview certificate');
      }
    } catch (err) {
      setError('Error generating preview certificate');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Vista Previa de Certificado</h1>
          <p className="text-muted-foreground">
            Genera un certificado de ejemplo para ver cómo se ve el diseño
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Generar Certificado de Prueba</CardTitle>
            <CardDescription>
              Este certificado usa datos de ejemplo para mostrar el diseño y formato
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={generatePreview}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Generar Vista Previa
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <Card className="mb-8 border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {certificateUrl && (
          <Card>
            <CardHeader>
              <CardTitle>Certificado Generado</CardTitle>
              <CardDescription>
                Vista previa del certificado con datos de ejemplo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-100 rounded-lg p-4">
                <iframe
                  src={certificateUrl}
                  className="w-full h-[600px] border-0 rounded"
                  title="Certificate Preview"
                />
              </div>

              <div className="flex gap-4">
                <Button asChild variant="outline" className="flex-1">
                  <a href={certificateUrl} target="_blank" rel="noopener noreferrer">
                    <FileText className="mr-2 h-4 w-4" />
                    Abrir en Nueva Pestaña
                  </a>
                </Button>
                <Button asChild className="flex-1">
                  <a href={certificateUrl} download="certificado-preview.pdf">
                    <Download className="mr-2 h-4 w-4" />
                    Descargar
                  </a>
                </Button>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold mb-2 text-sm">Datos de Ejemplo Utilizados:</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li><strong>Estudiante:</strong> Juan Pérez García</li>
                  <li><strong>Curso:</strong> Desarrollo de Habilidades Blandas y Liderazgo</li>
                  <li><strong>Instructor:</strong> María Rodriguez</li>
                  <li><strong>Nivel:</strong> Intermedio</li>
                  <li><strong>Duración:</strong> 40h 30m</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
