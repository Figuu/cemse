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
  Search, 
  Filter, 
  Eye, 
  MessageCircle,
  Calendar,
  MapPin,
  Heart,
  HeartOff,
  User
} from "lucide-react";
import { 
  useYouthApplications, 
  useCreateInterest 
} from "@/hooks/useYouthApplications";
import { YouthApplicationStatusLabels, CompanyInterestStatus } from "@/types/youth-application";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export default function TalentPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { data: applicationsData, isLoading, error } = useYouthApplications({
    search: searchTerm,
    status: statusFilter,
  });

  const applications = applicationsData?.applications || [];

  const handleShowInterest = async (applicationId: string) => {
    try {
      const response = await fetch(`/api/youth-applications/${applicationId}/interests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: CompanyInterestStatus.INTERESTED,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to show interest");
      }

      toast.success("¡Interés mostrado exitosamente!");
      // Refresh the page to update the UI
      window.location.reload();
    } catch (error) {
      console.error("Error showing interest:", error);
      toast.error("Error al mostrar interés. Por favor, inténtalo de nuevo.");
    }
  };

  if (session?.user?.role !== "COMPANIES") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">Acceso Denegado</h3>
          <p className="text-muted-foreground">
            Solo las empresas pueden acceder a esta página.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Descubre Talento
        </h1>
        <p className="text-muted-foreground">
          Explora aplicaciones de jóvenes talentosos y encuentra el candidato perfecto
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Candidatos Disponibles</p>
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
                <p className="text-sm text-muted-foreground">Aplicaciones Activas</p>
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
                <p className="text-sm text-muted-foreground">Intereses Mostrados</p>
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
              placeholder="Buscar por título, habilidades, experiencia..."
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
        </select>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Más Filtros
        </Button>
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
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay aplicaciones disponibles</h3>
          <p className="text-muted-foreground">
            No se encontraron aplicaciones que coincidan con tus criterios de búsqueda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map((application) => (
            <Card key={application.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={application.youthProfile.avatarUrl} />
                    <AvatarFallback>
                      {application.youthProfile.firstName?.[0]}{application.youthProfile.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1 line-clamp-2">
                      {application.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {application.youthProfile.firstName} {application.youthProfile.lastName}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={
                        application.status === "ACTIVE" ? "default" :
                        application.status === "PAUSED" ? "secondary" :
                        "destructive"
                      }>
                        {YouthApplicationStatusLabels[application.status]}
                      </Badge>
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
                    <Eye className="h-3 w-3" />
                    {application.viewsCount} vistas
                  </div>
                  {application.youthProfile.address && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {application.youthProfile.address}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => router.push(`/talent/${application.id}`)}
                    className="flex-1"
                  >
                    Ver Perfil
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleShowInterest(application.id)}
                    disabled={createInterestMutation.isPending}
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      // TODO: Open chat modal
                      console.log("Open chat with", application.youthProfile.userId);
                    }}
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
