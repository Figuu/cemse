"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft, 
  MessageCircle,
  Calendar,
  MapPin,
  Heart,
  Download,
  ExternalLink,
  Eye
} from "lucide-react";
import { 
  useYouthApplication
} from "@/hooks/useYouthApplications";
import { YouthApplicationStatusLabels, CompanyInterestStatus } from "@/types/youth-application";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

export default function TalentDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const applicationId = params.id as string;
  const [isShowingInterest, setIsShowingInterest] = useState(false);

  const { data: application, isLoading, error } = useYouthApplication(applicationId);

  const handleShowInterest = async () => {
    if (isShowingInterest) return;
    
    setIsShowingInterest(true);
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
    } finally {
      setIsShowingInterest(false);
    }
  };

  const handleContact = () => {
    // TODO: Open chat modal or redirect to messages
    console.log("Contact youth:", application?.youthProfileId);
    toast.info("Funcionalidad de chat próximamente disponible");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">Perfil no encontrado</h3>
          <p className="text-muted-foreground mb-4">
            El perfil que buscas no existe o no está disponible.
          </p>
          <Button onClick={() => router.push("/talent")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Descubrir Talento
          </Button>
        </div>
      </div>
    );
  }

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

  const hasShownInterest = application.companyInterests && application.companyInterests.length > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
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
            <h1 className="text-2xl font-bold text-foreground">
              {application.title}
            </h1>
            <p className="text-muted-foreground">
              Por {application.youthProfile.firstName} {application.youthProfile.lastName}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleContact}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Contactar
          </Button>
          <Button 
            size="sm"
            onClick={handleShowInterest}
            disabled={isShowingInterest || hasShownInterest}
            variant={hasShownInterest ? "secondary" : "default"}
          >
            <Heart className="h-4 w-4 mr-2" />
            {hasShownInterest ? "Ya mostraste interés" : "Mostrar Interés"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Candidate Profile */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={application.youthProfile.avatarUrl} />
                    <AvatarFallback>
                      {application.youthProfile.firstName?.[0]}{application.youthProfile.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl">
                      {application.youthProfile.firstName} {application.youthProfile.lastName}
                    </CardTitle>
                    <p className="text-muted-foreground">
                      {application.youthProfile.user.email}
                    </p>
                    {application.youthProfile.address && (
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {application.youthProfile.address}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={
                    application.status === "ACTIVE" ? "default" :
                    application.status === "PAUSED" ? "secondary" :
                    "destructive"
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
                      Privado
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <h4 className="font-semibold mb-2">Descripción</h4>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {application.description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          {(application.cvFile || application.cvUrl || application.coverLetterFile || application.coverLetterUrl) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Documentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {application.cvFile && (
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Download className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">CV/Resume</p>
                          <p className="text-sm text-muted-foreground">{application.cvFile}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Descargar
                      </Button>
                    </div>
                  )}
                  
                  {application.cvUrl && (
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <ExternalLink className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">CV/Resume (URL)</p>
                          <p className="text-sm text-muted-foreground truncate max-w-xs">
                            {application.cvUrl}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(application.cvUrl, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ver
                      </Button>
                    </div>
                  )}

                  {application.coverLetterFile && (
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Download className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Carta de Presentación</p>
                          <p className="text-sm text-muted-foreground">{application.coverLetterFile}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Descargar
                      </Button>
                    </div>
                  )}
                  
                  {application.coverLetterUrl && (
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <ExternalLink className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Carta de Presentación (URL)</p>
                          <p className="text-sm text-muted-foreground truncate max-w-xs">
                            {application.coverLetterUrl}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(application.coverLetterUrl, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ver
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estadísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Vistas</span>
                  <span className="font-semibold">{application.viewsCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Intereses</span>
                  <span className="font-semibold">{application._count?.companyInterests || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Creado</span>
                  <span className="font-semibold">
                    {formatDistanceToNow(new Date(application.createdAt), { 
                      addSuffix: true, 
                      locale: es 
                    })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{application.youthProfile.user.email}</span>
                </div>
                {application.youthProfile.phone && (
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{application.youthProfile.phone}</span>
                  </div>
                )}
                {application.youthProfile.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{application.youthProfile.address}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Interest Status */}
          {hasShownInterest && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tu Interés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="default" className="w-full justify-center">
                    <Heart className="h-3 w-3 mr-1" />
                    Interés Mostrado
                  </Badge>
                  <p className="text-sm text-muted-foreground text-center">
                    Ya mostraste interés en este candidato
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
