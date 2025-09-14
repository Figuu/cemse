"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2, X } from "lucide-react";
import { CompanyProfileForm } from "@/components/companies/CompanyProfileForm";
import { useCreateCompany } from "@/hooks/useCompanies";
import { Company } from "@/types/company";
import Link from "next/link";

export default function CreateCompanyPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);

  const createCompanyMutation = useCreateCompany();

  const handleSubmit = async (data: Partial<Company>) => {
    setIsSubmitting(true);
    try {
      const newCompany = await createCompanyMutation.mutateAsync(data);
      router.push(`/companies/${newCompany.id}`);
    } catch (error) {
      console.error("Error creating company:", error);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/companies">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            Crear Nueva Empresa
          </h1>
          <p className="text-muted-foreground">
            Completa la información de tu empresa para comenzar
          </p>
        </div>
      </div>

      {/* Progress Indicator */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <span className="font-medium">Información Básica</span>
            </div>
            <div className="flex-1 h-px bg-muted mx-4"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <span className="text-muted-foreground">Verificación</span>
            </div>
            <div className="flex-1 h-px bg-muted mx-4"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <span className="text-muted-foreground">Publicación</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Información de la Empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <CompanyProfileForm
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
            mode="create"
          />
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg">¿Necesitas ayuda?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Información Requerida</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Nombre de la empresa</li>
                <li>• Descripción básica</li>
                <li>• Industria y ubicación</li>
                <li>• Información de contacto</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Consejos</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Usa una descripción clara y atractiva</li>
                <li>• Agrega tecnologías relevantes</li>
                <li>• Incluye beneficios para empleados</li>
                <li>• Sube un logo profesional</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exit Dialog */}
      {showExitDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <X className="h-5 w-5 text-red-500" />
                ¿Salir sin guardar?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowExitDialog(false)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => router.push("/companies")}
                >
                  Salir sin guardar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
