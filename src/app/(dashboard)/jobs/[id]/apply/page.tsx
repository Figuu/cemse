"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  Briefcase, 
  MessageCircle,
  Calendar,
  MapPin,
  Building2,
  User,
  Mail,
  Phone,
  Send
} from "lucide-react";
import Link from "next/link";
import { useJobById, useCreateJobApplication } from "@/hooks/useJobs";
import { useMessages, useSendMessage } from "@/hooks/useMessages";
import { JobApplicationForm } from "@/components/jobs/JobApplicationForm";
import { JobPosting } from "@/types/company";

export default function JobApplicationPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const jobId = params.id as string;
  
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [applicationError, setApplicationError] = useState<string | null>(null);
  const [applicationSuccess, setApplicationSuccess] = useState(false);

  // Get job details
  const { data: job, isLoading: jobLoading, error: jobError } = useJobById(jobId);

  console.log("Apply page - Job data:", job);
  console.log("Apply page - Job company ownerId:", job?.company?.ownerId);

  // Get messages with the company (assuming we can get company info from job)
  const { data: messagesData, error: messagesError } = useMessages({
    recipientId: job?.company?.ownerId,
    contextType: "JOB_APPLICATION",
    contextId: jobId,
    enabled: !!job?.company?.ownerId,
  });

  console.log("Apply page - Messages data:", messagesData);
  console.log("Apply page - Messages error:", messagesError);

  const sendMessageMutation = useSendMessage();
  
  // Get the company ID for the application submission
  const companyId = job?.company?.id;
  
  // Initialize the job application mutation
  const createApplicationMutation = useCreateJobApplication(companyId || "", jobId);

  const handleSendMessage = () => {
    console.log("handleSendMessage - Called with:", { messageText, ownerId: job?.company?.ownerId, jobId });
    
    if (!messageText.trim() || !job?.company?.ownerId) {
      console.log("handleSendMessage - Validation failed:", { 
        hasMessage: !!messageText.trim(), 
        hasOwnerId: !!job?.company?.ownerId 
      });
      return;
    }
    
    console.log("handleSendMessage - Sending message mutation");
    sendMessageMutation.mutate({
      recipientId: job.company.ownerId,
      content: messageText,
      contextType: "JOB_APPLICATION",
      contextId: jobId,
    });
    
    setMessageText("");
  };

  const handleApplicationSubmit = async (applicationData: Record<string, unknown>) => {
    if (!companyId) {
      setApplicationError("No se pudo obtener la información de la empresa");
      return;
    }

    setApplicationError(null);
    setApplicationSuccess(false);

    try {
      console.log("Submitting application:", applicationData);
      
      await createApplicationMutation.mutateAsync(applicationData);
      
      setApplicationSuccess(true);
      setShowApplicationForm(false);
      
      // Show success message for a few seconds
      setTimeout(() => {
        setApplicationSuccess(false);
      }, 5000);
      
    } catch (error) {
      console.error("Error submitting application:", error);
      setApplicationError(
        error instanceof Error 
          ? error.message 
          : "Error al enviar la aplicación. Por favor, inténtalo de nuevo."
      );
    }
  };

  if (jobLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/jobs">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Cargando...</h1>
            <p className="text-muted-foreground">Obteniendo detalles del trabajo</p>
          </div>
        </div>
      </div>
    );
  }

  if (jobError || !job) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/jobs">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Error</h1>
            <p className="text-muted-foreground">No se pudo cargar el trabajo</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
      {/* Header */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:gap-4 sm:space-y-0">
        <Link href="/jobs">
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-bold sm:text-2xl">{job.title}</h1>
          <p className="text-sm text-muted-foreground sm:text-base">en {job.company.name}</p>
        </div>
      </div>

      {/* Success/Error Messages */}
      {applicationSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-green-500 rounded-full flex-shrink-0"></div>
            <p className="text-green-800 font-medium text-sm sm:text-base">¡Aplicación enviada exitosamente!</p>
          </div>
          <p className="text-green-700 text-xs sm:text-sm mt-1">
            Tu aplicación ha sido enviada a {job.company.name}. Te contactaremos pronto.
          </p>
        </div>
      )}

      {applicationError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-red-500 rounded-full flex-shrink-0"></div>
            <p className="text-red-800 font-medium text-sm sm:text-base">Error al enviar aplicación</p>
          </div>
          <p className="text-red-700 text-xs sm:text-sm mt-1">{applicationError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Job Details */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col space-y-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                    <AvatarImage src={job.company.logo} />
                    <AvatarFallback>
                      <Building2 className="h-5 w-5 sm:h-6 sm:w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold sm:text-xl truncate">{job.company.name}</h2>
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="truncate">{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Badge variant={job.isActive ? "default" : "secondary"} className="w-fit">
                  {job.isActive ? "Activo" : "Inactivo"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-3 sm:space-y-4">
              <div>
                <h3 className="font-medium mb-2 text-sm sm:text-base">Descripción</h3>
                <p className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap">
                  {job.description}
                </p>
              </div>

              {job.requirements && job.requirements.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2 text-sm sm:text-base">Requisitos</h3>
                  <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                    {job.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary flex-shrink-0">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {job.benefits && job.benefits.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2 text-sm sm:text-base">Beneficios</h3>
                  <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                    {job.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary flex-shrink-0">•</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-3 sm:space-y-4">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Acciones</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-3">
              <Button 
                className="w-full"
                onClick={() => setShowApplicationForm(true)}
                size="sm"
              >
                <Briefcase className="h-4 w-4 mr-2" />
                Aplicar al Trabajo
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setIsChatModalOpen(true)}
                size="sm"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Contactar Empresa
              </Button>
            </CardContent>
          </Card>

          {/* Job Stats */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Estadísticas</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vistas:</span>
                <span className="font-medium">{job.totalViews || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Aplicaciones:</span>
                <span className="font-medium">{job.totalApplications || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Publicado:</span>
                <span className="font-medium">
                  {Math.ceil((Date.now() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60 * 24))} días
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Application Form Modal */}
      {showApplicationForm && (
        <JobApplicationForm
          job={job}
          onClose={() => {
            setShowApplicationForm(false);
            setApplicationError(null);
          }}
          onSubmit={handleApplicationSubmit}
          isLoading={createApplicationMutation.isPending}
          currentUser={session?.user}
        />
      )}

      {/* Chat Modal */}
      <Dialog open={isChatModalOpen} onOpenChange={setIsChatModalOpen}>
        <DialogContent className="max-w-2xl h-[80vh] sm:h-[600px] flex flex-col p-2 sm:p-6">
          <DialogHeader className="p-2 sm:p-0">
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="truncate">Conversación con {job.company.name}</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 flex flex-col">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 p-2 sm:p-4 border rounded-lg bg-muted/20">
              {messagesData?.messages?.length === 0 ? (
                <div className="text-center text-muted-foreground py-6 sm:py-8">
                  <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm sm:text-base">No hay mensajes aún. ¡Inicia la conversación!</p>
                </div>
              ) : (
                messagesData?.messages?.map((message) => {
                  const isFromCompany = message.senderId === job.company.ownerId;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isFromCompany ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[70%] p-2 sm:p-3 rounded-lg ${
                          isFromCompany
                            ? 'bg-background border'
                            : 'bg-primary text-primary-foreground'
                        }`}
                      >
                        <p className="text-xs sm:text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          isFromCompany ? 'text-muted-foreground' : 'text-primary-foreground/70'
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
            <div className="flex items-center gap-2 pt-3 sm:pt-4 border-t">
              <Input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Escribe tu mensaje..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage();
                  }
                }}
                className="flex-1 text-sm"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!messageText.trim() || sendMessageMutation.isPending}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setMessageText("Hola! Me interesa mucho esta posición. ¿Podríamos programar una entrevista?");
                }}
                className="text-xs"
              >
                <span className="hidden sm:inline">Solicitar entrevista</span>
                <span className="sm:hidden">Entrevista</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setMessageText("Hola! Tengo algunas preguntas sobre la posición. ¿Podrías ayudarme?");
                }}
                className="text-xs"
              >
                <span className="hidden sm:inline">Hacer preguntas</span>
                <span className="sm:hidden">Preguntas</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsChatModalOpen(false)}
                className="text-xs"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}