"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Save, 
  X
} from "lucide-react";
import { 
  useYouthApplication, 
  useUpdateYouthApplication 
} from "@/hooks/useYouthApplications";
import { YouthApplicationForm } from "@/components/youth-applications/YouthApplicationForm";
import { toast } from "sonner";

export default function EditYouthApplicationPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const applicationId = params.id as string;
  const [showExitDialog, setShowExitDialog] = useState(false);

  const { data: application, isLoading, error } = useYouthApplication(applicationId);
  const updateApplicationMutation = useUpdateYouthApplication(applicationId);

  const handleSubmit = async (data: any) => {
    try {
      console.log("Updating application with data:", data);
      await updateApplicationMutation.mutateAsync(data);
      toast.success("¡Aplicación actualizada exitosamente!");
      router.push(`/youth-applications/${applicationId}`);
    } catch (error) {
      console.error("Error updating application:", error);
      toast.error("Error al actualizar la aplicación. Por favor, inténtalo de nuevo.");
    }
  };

  const handleExit = () => {
    router.push(`/youth-applications/${applicationId}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p>Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">Aplicación no encontrada</h3>
          <p className="text-muted-foreground mb-4">
            La aplicación que buscas no existe o no tienes permisos para editarla.
          </p>
          <Button onClick={() => router.push("/youth-applications")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Mis Aplicaciones
          </Button>
        </div>
      </div>
    );
  }

  // Check if user owns this application
  if (session?.user?.id !== application.youthProfileId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">Acceso Denegado</h3>
          <p className="text-muted-foreground mb-4">
            No tienes permisos para editar esta aplicación.
          </p>
          <Button onClick={() => router.push("/youth-applications")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Mis Aplicaciones
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowExitDialog(true)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Editar Aplicación
            </h1>
            <p className="text-muted-foreground">
              Modifica los detalles de tu aplicación
            </p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <YouthApplicationForm
        mode="edit"
        initialData={{
          title: application.title,
          description: application.description,
          cvFile: application.cvFile,
          coverLetterFile: application.coverLetterFile,
          cvUrl: application.cvUrl,
          coverLetterUrl: application.coverLetterUrl,
          isPublic: application.isPublic,
        }}
        onSubmit={handleSubmit}
        onClose={() => setShowExitDialog(true)}
        isLoading={updateApplicationMutation.isPending}
      />

      {/* Exit Confirmation Dialog */}
      {showExitDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Salir sin guardar</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                ¿Estás seguro de que quieres salir? Los cambios no guardados se perderán.
              </p>
              <div className="flex items-center gap-2">
                <Button 
                  variant="destructive" 
                  onClick={handleExit}
                  className="flex-1"
                >
                  Salir sin guardar
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowExitDialog(false)}
                  className="flex-1"
                >
                  Continuar editando
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
