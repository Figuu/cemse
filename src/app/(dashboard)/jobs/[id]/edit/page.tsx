"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Briefcase, X } from "lucide-react";
import { JobPostingForm } from "@/components/jobs/JobPostingForm";
import { useJob, useUpdateJob } from "@/hooks/useJobs";
import { useSession } from "next-auth/react";
import { useCompanyByUser } from "@/hooks/useCompanies";
import Link from "next/link";

export default function EditJobPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const jobId = params.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);

  // Get the company for the current user
  const { data: company, isLoading: companyLoading } = useCompanyByUser(session?.user?.id || "");
  const { data: job, isLoading: jobLoading } = useJob(company?.id || "", jobId);
  const updateJobMutation = useUpdateJob(company?.id || "", jobId);

  const handleSubmit = async (data: any) => {
    if (!company?.id) return;
    
    setIsSubmitting(true);
    try {
      await updateJobMutation.mutateAsync(data);
      router.push(`/jobs/${jobId}`);
    } catch (error) {
      console.error("Error updating job:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (companyLoading || jobLoading) {
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

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Trabajo no encontrado</h3>
          <p className="text-muted-foreground mb-4">
            El trabajo que buscas no existe o no tienes permisos para editarlo
          </p>
          <Link href="/jobs">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Trabajos
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
        <Link href={`/jobs/${jobId}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Briefcase className="h-8 w-8 text-primary" />
            Editar Trabajo
          </h1>
          <p className="text-muted-foreground">
            Modifica la información del trabajo: {job.title}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Trabajo</CardTitle>
        </CardHeader>
        <CardContent>
          <JobPostingForm
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
            mode="edit"
            job={job}
          />
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg">Consejos para actualizar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Cambios importantes</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Actualiza la descripción si cambian los requisitos</li>
                <li>• Modifica el salario si hay ajustes</li>
                <li>• Cambia la fecha límite si es necesario</li>
                <li>• Actualiza las habilidades requeridas</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Impacto en candidatos</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Los candidatos existentes verán los cambios</li>
                <li>• Considera notificar cambios importantes</li>
                <li>• Revisa las aplicaciones pendientes</li>
                <li>• Mantén la información actualizada</li>
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
                  onClick={() => router.push(`/jobs/${jobId}`)}
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
