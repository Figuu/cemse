"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Building2, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle,
  Lightbulb
} from "lucide-react";
import { StartupRegistrationForm } from "@/components/startups/StartupRegistrationForm";
import { useStartups, CreateStartupData } from "@/hooks/useStartups";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function StartupRegistrationPage() {
  const router = useRouter();
  const { createStartup } = useStartups();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (data: CreateStartupData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await createStartup(data);
      
      if (result) {
        setSubmitSuccess(true);
        // Redirect to startup details page after 2 seconds
        setTimeout(() => {
          router.push(`/startups/${result.id}`);
        }, 2000);
      } else {
        setSubmitError("Error al crear la startup. Por favor, intenta nuevamente.");
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Error inesperado");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-green-700 mb-2">
              ¡Startup Creada Exitosamente!
            </h1>
            <p className="text-muted-foreground mb-6">
              Tu startup ha sido registrada y está siendo procesada. 
              Serás redirigido a la página de detalles en unos momentos.
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => router.push("/entrepreneurship")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Emprendimientos
              </Button>
              <Button onClick={() => router.push("/startups/my")}>
                <Building2 className="h-4 w-4 mr-2" />
                Ver Mi Startup
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={["YOUTH"]}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Registrar Startup</h1>
            <p className="text-muted-foreground">
              Crea tu perfil de startup y comparte tu visión con la comunidad
            </p>
          </div>
        </div>

        {/* Success Message */}
        {submitSuccess && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Tu startup ha sido creada exitosamente. Serás redirigido en unos momentos.
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {submitError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {submitError}
            </AlertDescription>
          </Alert>
        )}

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-blue-600" />
              Información de tu Startup
            </CardTitle>
            <CardDescription>
              Completa todos los campos requeridos para registrar tu startup. 
              Puedes editar esta información más tarde.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StartupRegistrationForm
              onSubmit={handleSubmit}
              isLoading={isSubmitting}
              mode="create"
            />
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">¿Necesitas ayuda?</CardTitle>
            <CardDescription>
              Aquí tienes algunos consejos para completar tu registro
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Información Básica</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Elige un nombre memorable y único</li>
                  <li>• Describe claramente qué hace tu startup</li>
                  <li>• Selecciona la categoría más apropiada</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Contacto</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Proporciona al menos un método de contacto</li>
                  <li>• Incluye tu sitio web si lo tienes</li>
                  <li>• Verifica que los enlaces funcionen</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Negocio</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Sé honesto sobre la etapa actual</li>
                  <li>• Incluye información financiera si es relevante</li>
                  <li>• Describe tu modelo de negocio claramente</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Medios</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Usa imágenes de alta calidad</li>
                  <li>• Incluye enlaces a redes sociales</li>
                  <li>• Mantén la consistencia visual</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
