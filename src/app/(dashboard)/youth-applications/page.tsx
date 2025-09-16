"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  EyeOff, 
  Edit, 
  Trash2, 
  MessageCircle,
  Calendar,
  Users
} from "lucide-react";
import { 
  useYouthApplications, 
  useDeleteYouthApplication,
  useCreateYouthApplication 
} from "@/hooks/useYouthApplications";
import { YouthApplicationForm } from "@/components/youth-applications/YouthApplicationForm";
import { YouthApplicationStatusLabels } from "@/types/youth-application";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export default function YouthApplicationsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // For now, we'll show all applications (in a real app, you'd filter by user)
  const { data: applicationsData, isLoading, error } = useYouthApplications({
    search: searchTerm,
    status: statusFilter,
  });

  const applications = applicationsData?.applications || [];
  const createApplicationMutation = useCreateYouthApplication();

  const handleDeleteApplication = async (applicationId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta aplicación?")) {
      try {
        const response = await fetch(`/api/youth-applications/${applicationId}`, {
          method: "DELETE",
        });
        
        if (!response.ok) {
          throw new Error("Failed to delete application");
        }
        
        toast.success("Aplicación eliminada exitosamente");
        // Refresh the list
        window.location.reload();
      } catch (error) {
        console.error("Error deleting application:", error);
        toast.error("Error al eliminar la aplicación. Por favor, inténtalo de nuevo.");
      }
    }
  };

  const handleCreateApplication = async (data: any) => {
    try {
      console.log("Creating application with data:", data);
      await createApplicationMutation.mutateAsync(data);
      setShowCreateForm(false);
      toast.success("¡Aplicación creada exitosamente!");
      // The list will automatically refresh due to React Query invalidation
    } catch (error) {
      console.error("Error creating application:", error);
      toast.error("Error al crear la aplicación. Por favor, inténtalo de nuevo.");
    }
  };

  if (session?.user?.role !== "YOUTH") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">Acceso Denegado</h3>
          <p className="text-muted-foreground">
            Solo los usuarios jóvenes pueden acceder a esta página.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Mis Postulaciones
          </h1>
          <p className="text-muted-foreground">
            Gestiona tus aplicaciones y conecta con empresas
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Postulación
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{applications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Activas</p>
                <p className="text-2xl font-bold">
                  {applications.filter(app => app.status === "ACTIVE").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Intereses</p>
                <p className="text-2xl font-bold">
                  {applications.reduce((sum, app) => sum + (app._count?.companyInterests || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar aplicaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="">Todos los estados</option>
          <option value="ACTIVE">Activo</option>
          <option value="PAUSED">Pausado</option>
          <option value="CLOSED">Cerrado</option>
          <option value="HIRED">Contratado</option>
        </select>
      </div>

      {/* Applications List */}
      {isLoading ? (
        <div className="text-center py-8">
          <p>Cargando aplicaciones...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500">Error al cargar las aplicaciones</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No tienes aplicaciones</h3>
          <p className="text-muted-foreground mb-4">
            Crea tu primera aplicación para que las empresas puedan encontrarte
          </p>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Crear Primera Aplicación
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map((application) => (
            <Card key={application.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2 line-clamp-2">
                      {application.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={
                        application.status === "ACTIVE" ? "default" :
                        application.status === "PAUSED" ? "secondary" :
                        application.status === "CLOSED" ? "destructive" :
                        "outline"
                      }>
                        {YouthApplicationStatusLabels[application.status]}
                      </Badge>
                      {application.isPublic ? (
                        <Badge variant="outline" className="text-green-600">
                          <Eye className="h-3 w-3 mr-1" />
                          Público
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-600">
                          <EyeOff className="h-3 w-3 mr-1" />
                          Privado
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {application.description}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDistanceToNow(new Date(application.createdAt), { 
                      addSuffix: true, 
                      locale: es 
                    })}
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    {application._count?.companyInterests || 0} intereses
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => router.push(`/youth-applications/${application.id}`)}
                    className="flex-1"
                  >
                    Ver Detalles
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push(`/youth-applications/${application.id}/edit`)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteApplication(application.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Form Modal */}
      {showCreateForm && (
        <YouthApplicationForm
          mode="create"
          onSubmit={handleCreateApplication}
          onClose={() => setShowCreateForm(false)}
          isLoading={createApplicationMutation.isPending}
        />
      )}
    </div>
  );
}
