"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Briefcase, X } from "lucide-react";
import { JobPostingForm } from "@/components/jobs/JobPostingForm";
import { useCreateJob } from "@/hooks/useJobs";
import { useSession } from "next-auth/react";
import { useCompanyByUser } from "@/hooks/useCompanies";
import Link from "next/link";

export default function CreateJobPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);

  // Get the company for the current user
  const { data: company, isLoading: companyLoading } = useCompanyByUser(session?.user?.id || "");
  const createJobMutation = useCreateJob(company?.id || "");

  const handleSubmit = async (data: any) => {
    if (!company?.id) return;
    
    setIsSubmitting(true);
    try {
      const newJob = await createJobMutation.mutateAsync(data);
      router.push(`/jobs/${newJob.id}`);
    } catch (error) {
      console.error("Error creating job:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (companyLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-pulse space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 bg-muted rounded"></div>
            <div className="h-8 w-32 bg-muted rounded"></div>
          </div>
          <div className="space-y-6">
            <div className="h-64 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Empresa no encontrada</h3>
          <p className="text-muted-foreground mb-4">
            Primero necesitas crear o configurar tu empresa
          </p>
          <Link href="/company">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Ir a Mi Empresa
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/jobs">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Briefcase className="h-8 w-8 text-primary" />
            Crear Nuevo Trabajo
          </h1>
          <p className="text-muted-foreground">
            Publica un nuevo trabajo para {company.name}
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
              <span className="font-medium">Información del Trabajo</span>
            </div>
            <div className="flex-1 h-px bg-muted mx-4"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <span className="text-muted-foreground">Requisitos y Beneficios</span>
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
          <CardTitle>Información del Trabajo</CardTitle>
        </CardHeader>
        <CardContent>
          <JobPostingForm
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
                <li>• Título del trabajo</li>
                <li>• Descripción detallada</li>
                <li>• Ubicación y modalidad de trabajo</li>
                <li>• Tipo de empleo y nivel de experiencia</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Consejos para un buen trabajo</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Usa un título claro y atractivo</li>
                <li>• Describe las responsabilidades específicas</li>
                <li>• Lista los requisitos técnicos necesarios</li>
                <li>• Incluye beneficios y oportunidades de crecimiento</li>
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
                  onClick={() => router.push("/jobs")}
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
