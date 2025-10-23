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
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  MessageCircle,
  Calendar,
  MapPin,
  Users,
  Heart,
  Download,
  ExternalLink
} from "lucide-react";
import { 
  useYouthApplication, 
  useDeleteYouthApplication 
} from "@/hooks/useYouthApplications";
import { YouthApplicationStatusLabels } from "@/types/youth-application";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { YouthApplicationChatInterface } from "@/components/youth-applications/YouthApplicationChatInterface";
import { InterestedCompaniesList } from "@/components/youth-applications/InterestedCompaniesList";

export default function YouthApplicationDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const applicationId = params.id as string;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  const { data: application, isLoading, error } = useYouthApplication(applicationId);

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/youth-applications/${applicationId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete application");
      }
      
      toast.success("Aplicación eliminada exitosamente");
      router.push("/youth-applications");
    } catch (error) {
      console.error("Error deleting application:", error);
      toast.error("Error al eliminar la aplicación. Por favor, inténtalo de nuevo.");
    }
  };

  const handleOpenChat = (companyId: string) => {
    console.log('handleOpenChat called with companyId:', companyId);
    
    // Find the company data from the application's company interests
    const companyInterest = application?.companyInterests?.find(interest => interest.company.id === companyId);
    if (companyInterest) {
      console.log('Found company data:', companyInterest.company);
      // Pass the full company data instead of just the ID
      setSelectedCompanyId(companyInterest.company.id);
      setShowChat(true);
    } else {
      console.log('Company not found in interests, using ID only');
      setSelectedCompanyId(companyId);
      setShowChat(true);
    }
    
    console.log('State set - selectedCompanyId:', companyId, 'showChat: true');
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
            La aplicación que buscas no existe o no tienes permisos para verla.
          </p>
          <Button onClick={() => router.push("/youth-applications")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Mis Aplicaciones
          </Button>
        </div>
      </div>
    );
  }

  const isOwner = session?.user?.id === application.youthProfileId;
  const isCompany = session?.user?.role === "COMPANIES";

  // Debug logging
  console.log('Current state - selectedCompanyId:', selectedCompanyId, 'showChat:', showChat);
  console.log('Application data:', application?.companyInterests?.length, 'interests');

  return (
    <YouthApplicationChatInterface 
      key={`chat-${selectedCompanyId || 'none'}`}
      applicationId={applicationId}
      youthId={application.youthProfileId}
      className="h-screen"
      selectedCompanyId={selectedCompanyId}
      onOpenChat={handleOpenChat}
      companyInterests={application.companyInterests || []}
    >
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.back()}
              className="self-start"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground break-words">
                {application.title}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Por {application.youthProfile.firstName} {application.youthProfile.lastName}
              </p>
            </div>
          </div>
          
          {isOwner && (
            <div className="flex items-center gap-2 flex-wrap">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push(`/youth-applications/${applicationId}/edit`)}
                className="flex-1 sm:flex-none"
              >
                <Edit className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Editar</span>
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => setShowDeleteDialog(true)}
                className="flex-1 sm:flex-none"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Eliminar</span>
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Application Details */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                    <AvatarImage src={application.youthProfile.avatarUrl} />
                    <AvatarFallback>
                      {application.youthProfile.firstName?.[0]}{application.youthProfile.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base sm:text-lg break-words">
                      {application.youthProfile.firstName} {application.youthProfile.lastName}
                    </CardTitle>
                    <p className="text-xs sm:text-sm text-muted-foreground break-all">
                      {application.youthProfile.user.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
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
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
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
                <div className="space-y-3 sm:space-y-4">
                  {application.cvFile && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border rounded-lg">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                          <Download className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm sm:text-base">CV/Currículum</p>
                          <p className="text-xs sm:text-sm text-muted-foreground break-all">{application.cvFile}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="self-start sm:self-auto">
                        <Download className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Descargar</span>
                      </Button>
                    </div>
                  )}
                  
                  {application.cvUrl && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border rounded-lg">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                          <ExternalLink className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm sm:text-base">CV/Currículum (URL)</p>
                          <p className="text-xs sm:text-sm text-muted-foreground break-all">
                            {application.cvUrl}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(application.cvUrl, '_blank')}
                        className="self-start sm:self-auto"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Ver</span>
                      </Button>
                    </div>
                  )}

                  {application.coverLetterFile && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border rounded-lg">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                          <Download className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm sm:text-base">Carta de Presentación</p>
                          <p className="text-xs sm:text-sm text-muted-foreground break-all">{application.coverLetterFile}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="self-start sm:self-auto">
                        <Download className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Descargar</span>
                      </Button>
                    </div>
                  )}
                  
                  {application.coverLetterUrl && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border rounded-lg">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                          <ExternalLink className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm sm:text-base">Carta de Presentación (URL)</p>
                          <p className="text-xs sm:text-sm text-muted-foreground break-all">
                            {application.coverLetterUrl}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(application.coverLetterUrl, '_blank')}
                        className="self-start sm:self-auto"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Ver</span>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Company Interests */}
          <InterestedCompaniesList
            companyInterests={application.companyInterests || []}
            applicationId={applicationId}
            onOpenChat={handleOpenChat}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Estadísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-muted-foreground">Intereses</span>
                  <span className="font-semibold text-sm sm:text-base">{application._count?.companyInterests || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-muted-foreground">Creado</span>
                  <span className="font-semibold text-xs sm:text-sm">
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
              <CardTitle className="text-base sm:text-lg">Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-xs sm:text-sm break-all">{application.youthProfile.user.email}</span>
                </div>
                {application.youthProfile.phone && (
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs sm:text-sm">{application.youthProfile.phone}</span>
                  </div>
                )}
                {application.youthProfile.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs sm:text-sm break-words">{application.youthProfile.address}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {isCompany && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Acciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button 
                    className="w-full"
                    onClick={() => {
                      // TODO: Show interest
                      console.log("Show interest in application:", applicationId);
                    }}
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Mostrar Interés
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      // TODO: Open chat modal
                      console.log("Open chat with youth:", application.youthProfileId);
                    }}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contactar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Confirmar Eliminación</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm sm:text-base text-muted-foreground mb-4">
                ¿Estás seguro de que quieres eliminar esta aplicación? Esta acción no se puede deshacer.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-2">
                <Button 
                  variant="destructive" 
                  onClick={handleDelete}
                  className="w-full sm:flex-1"
                >
                  Eliminar
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteDialog(false)}
                  className="w-full sm:flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      </div>
    </YouthApplicationChatInterface>
  );
}
