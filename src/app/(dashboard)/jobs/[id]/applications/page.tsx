"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Briefcase, 
  Users, 
  Eye, 
  Download,
  MessageCircle,
  Calendar,
  MapPin,
  GraduationCap,
  Star,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  User,
  Mail,
  Phone
} from "lucide-react";
import { useJob, useJobApplications } from "@/hooks/useJobs";
import { useSession } from "next-auth/react";
import { useCompanyByUser } from "@/hooks/useCompanies";
import { ApplicationStatusLabels, ApplicationStatus, JobApplication } from "@/types/company";
import { useMessages, useSendMessage } from "@/hooks/useMessages";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function JobApplicationsPage() {
  const params = useParams();
  const { data: session } = useSession();
  const jobId = params.id as string;
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedProfile, setSelectedProfile] = useState<JobApplication | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedChatUser, setSelectedChatUser] = useState<JobApplication | null>(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [messageText, setMessageText] = useState("");

  // Get the company for the current user
  const { data: company, isLoading: companyLoading } = useCompanyByUser(session?.user?.id || "");
  const { data: job, isLoading: jobLoading } = useJob(company?.id || "", jobId);
  const { data: applicationsData, isLoading: applicationsLoading } = useJobApplications({
    companyId: company?.id,
    jobId: jobId,
  });

  const applications = applicationsData?.applications || [];
  const queryClient = useQueryClient();

  // Status change mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: string; status: ApplicationStatus }) => {
      const response = await fetch(`/api/companies/${company?.id}/jobs/${jobId}/applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update application status');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch applications
      queryClient.invalidateQueries({ queryKey: ['jobApplications', company?.id, jobId] });
    },
  });

  const handleStatusChange = (applicationId: string, status: string) => {
    updateStatusMutation.mutate({ applicationId, status: status as ApplicationStatus });
  };

  const handleContact = (application: JobApplication) => {
    setSelectedChatUser(application);
    setIsChatModalOpen(true);
  };

  const handleViewProfile = (application: JobApplication) => {
    setSelectedProfile(application);
    setIsProfileModalOpen(true);
  };

  // Get messages for the selected chat user
  const { data: messagesData } = useMessages({
    recipientId: selectedChatUser?.applicant.userId,
    contextType: "JOB_APPLICATION",
    contextId: jobId,
    enabled: !!selectedChatUser,
  });

  const sendMessageMutation = useSendMessage();

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedChatUser) return;
    
    sendMessageMutation.mutate({
      recipientId: selectedChatUser.applicant.userId,
      content: messageText,
      contextType: "JOB_APPLICATION",
      contextId: jobId,
    });
    
    setMessageText("");
  };

  // Filter applications
  const filteredApplications = applications.filter(app => {
    const matchesSearch = !searchTerm || 
      app.applicant.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicant.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicant.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (companyLoading || jobLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 bg-muted rounded"></div>
            <div className="h-8 w-32 bg-muted rounded"></div>
          </div>
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="h-3 bg-muted rounded w-full"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
            El trabajo que buscas no existe o no tienes permisos para verlo
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
    <div className="container mx-auto px-4 py-8">
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
            <Users className="h-8 w-8 text-primary" />
            Aplicaciones - {job.title}
          </h1>
          <p className="text-muted-foreground">
            Gestiona las aplicaciones recibidas para este trabajo
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Total</span>
            </div>
            <p className="text-2xl font-bold">{applications.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium">Pendientes</span>
            </div>
            <p className="text-2xl font-bold">
              {applications.filter(app => app.status === "SENT").length}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Entrevistados</span>
            </div>
            <p className="text-2xl font-bold">
              {applications.filter(app => app.status === "PRE_SELECTED").length}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Contratados</span>
            </div>
            <p className="text-2xl font-bold">
              {applications.filter(app => app.status === "HIRED").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Buscar y Filtrar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-md"
                />
              </div>
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-input rounded-md"
              >
                <option value="all">Todos los estados</option>
                {Object.entries(ApplicationStatusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-input rounded-md"
              >
                <option value="newest">Más recientes</option>
                <option value="oldest">Más antiguos</option>
                <option value="name">Nombre A-Z</option>
                <option value="status">Por estado</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Aplicaciones ({filteredApplications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {applicationsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                      <div className="h-3 bg-muted rounded w-full"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredApplications.length > 0 ? (
            <div className="space-y-4">
              {filteredApplications.map((application) => (
                <Card key={application.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={application.applicant.avatarUrl} />
                          <AvatarFallback>
                            {application.applicant.firstName?.[0]}{application.applicant.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">
                              {application.applicant.firstName} {application.applicant.lastName}
                            </h3>
                            <Badge variant={
                              application.status === "HIRED" ? "default" :
                              application.status === "PRE_SELECTED" ? "secondary" :
                              application.status === "REJECTED" ? "destructive" :
                              "outline"
                            }>
                              {ApplicationStatusLabels[application.status]}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {application.applicant.user.email}
                          </p>
                          {application.coverLetter && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {application.coverLetter}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Aplicó el {new Date(application.appliedAt).toLocaleDateString()}
                            </div>
 @                            {application.applicant.address && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {application.applicant.address}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                       <div className="flex items-center gap-2">
                         {application.resume && (
                           <Button variant="outline" size="sm">
                             <Download className="h-4 w-4 mr-2" />
                             CV
                           </Button>
                         )}
                         <Button 
                           variant="outline" 
                           size="sm"
                           onClick={() => handleContact(application)}
                         >
                           <MessageCircle className="h-4 w-4 mr-2" />
                           Contactar
                         </Button>
                         <Button 
                           size="sm"
                           onClick={() => handleViewProfile(application)}
                         >
                           Ver Perfil
                         </Button>
                         
                         {/* Status Change Buttons */}
                         <div className="flex items-center gap-1">
                           {application.status === "SENT" && (
                             <Button 
                               variant="outline" 
                               size="sm"
                               onClick={() => handleStatusChange(application.id, "UNDER_REVIEW")}
                               disabled={updateStatusMutation.isPending}
                             >
                               <Eye className="h-4 w-4 mr-1" />
                               Revisar
                             </Button>
                           )}
                           {application.status === "UNDER_REVIEW" && (
                             <>
                               <Button 
                                 variant="outline" 
                                 size="sm"
                                 onClick={() => handleStatusChange(application.id, "PRE_SELECTED")}
                                 disabled={updateStatusMutation.isPending}
                               >
                                 <CheckCircle className="h-4 w-4 mr-1" />
                                 Pre-seleccionar
                               </Button>
                               <Button 
                                 variant="destructive" 
                                 size="sm"
                                 onClick={() => handleStatusChange(application.id, "REJECTED")}
                                 disabled={updateStatusMutation.isPending}
                               >
                                 <XCircle className="h-4 w-4 mr-1" />
                                 Rechazar
                               </Button>
                             </>
                           )}
                           {application.status === "PRE_SELECTED" && (
                             <>
                               <Button 
                                 variant="default" 
                                 size="sm"
                                 onClick={() => handleStatusChange(application.id, "HIRED")}
                                 disabled={updateStatusMutation.isPending}
                               >
                                 <Star className="h-4 w-4 mr-1" />
                                 Contratar
                               </Button>
                               <Button 
                                 variant="destructive" 
                                 size="sm"
                                 onClick={() => handleStatusChange(application.id, "REJECTED")}
                                 disabled={updateStatusMutation.isPending}
                               >
                                 <XCircle className="h-4 w-4 mr-1" />
                                 Rechazar
                               </Button>
                             </>
                           )}
                         </div>
                       </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm || statusFilter !== "all" ? "No se encontraron aplicaciones" : "No hay aplicaciones"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all" 
                  ? "Intenta ajustar tus filtros de búsqueda"
                  : "Las aplicaciones aparecerán aquí cuando los candidatos se postulen"
                }
              </p>
              {(searchTerm || statusFilter !== "all") && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                >
                  Limpiar Filtros
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Modal */}
      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Perfil del Candidato
            </DialogTitle>
          </DialogHeader>
          
          {selectedProfile && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedProfile.applicant.avatarUrl} />
                  <AvatarFallback className="text-lg">
                    {selectedProfile.applicant.firstName?.[0]}{selectedProfile.applicant.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">
                    {selectedProfile.applicant.firstName} {selectedProfile.applicant.lastName}
                  </h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {selectedProfile.applicant.user.email}
                    </div>
                    {selectedProfile.applicant.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {selectedProfile.applicant.phone}
                      </div>
                    )}
                  </div>
                  {selectedProfile.applicant.address && (
                    <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {selectedProfile.applicant.address}
                    </div>
                  )}
                </div>
                <Badge variant={
                  selectedProfile.status === "HIRED" ? "default" :
                  selectedProfile.status === "PRE_SELECTED" ? "secondary" :
                  selectedProfile.status === "REJECTED" ? "destructive" :
                  "outline"
                }>
                  {ApplicationStatusLabels[selectedProfile.status]}
                </Badge>
              </div>

              {/* Application Details */}
              <div className="space-y-4">
                <h4 className="font-medium text-lg">Detalles de la Aplicación</h4>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Fecha de Aplicación:</span>
                    <p className="font-medium">
                      {new Date(selectedProfile.appliedAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Estado:</span>
                    <p className="font-medium">{ApplicationStatusLabels[selectedProfile.status]}</p>
                  </div>
                </div>

                {selectedProfile.coverLetter && (
                  <div>
                    <span className="text-muted-foreground text-sm">Carta de Presentación:</span>
                    <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{selectedProfile.coverLetter}</p>
                    </div>
                  </div>
                )}

                {selectedProfile.notes && (
                  <div>
                    <span className="text-muted-foreground text-sm">Notas Internas:</span>
                    <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{selectedProfile.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t">
                <Button 
                  onClick={() => {
                    setIsProfileModalOpen(false);
                    handleContact(selectedProfile);
                  }}
                  className="flex-1"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contactar
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setIsProfileModalOpen(false)}
                >
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Chat Modal */}
      <Dialog open={isChatModalOpen} onOpenChange={setIsChatModalOpen}>
        <DialogContent className="max-w-2xl h-[600px] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Conversación con {selectedChatUser?.applicant.firstName} {selectedChatUser?.applicant.lastName}
            </DialogTitle>
          </DialogHeader>
          
          {selectedChatUser && (
            <div className="flex-1 flex flex-col">
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 p-4 border rounded-lg bg-muted/20">
                {messagesData?.messages?.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No hay mensajes aún. ¡Inicia la conversación!</p>
                  </div>
                ) : (
                  messagesData?.messages?.map((message) => {
                    const isFromApplicant = message.senderId === selectedChatUser?.applicant.userId;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isFromApplicant ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-lg ${
                            isFromApplicant
                              ? 'bg-background border'
                              : 'bg-primary text-primary-foreground'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            isFromApplicant ? 'text-muted-foreground' : 'text-primary-foreground/70'
                          }`}>
                            {new Date(message.createdAt).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message Input */}
              <div className="flex items-center gap-2 pt-4 border-t">
                <Input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Escribe tu mensaje..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage();
                    }
                  }}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || sendMessageMutation.isPending}
                >
                  {sendMessageMutation.isPending ? "Enviando..." : "Enviar"}
                </Button>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setMessageText("Hola! Gracias por tu interés en la posición. ¿Podrías contarme más sobre tu experiencia?");
                  }}
                >
                  Mensaje de bienvenida
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setMessageText("Nos gustaría programar una entrevista contigo. ¿Qué horarios te funcionan mejor?");
                  }}
                >
                  Programar entrevista
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsChatModalOpen(false)}
                >
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
