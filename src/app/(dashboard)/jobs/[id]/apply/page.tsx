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
import { useJobById } from "@/hooks/useJobs";
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
    // TODO: Implement job application submission
    console.log("Submitting application:", applicationData);
    setShowApplicationForm(false);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/jobs">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{job.title}</h1>
          <p className="text-muted-foreground">en {job.company.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Job Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={job.company.logo} />
                    <AvatarFallback>
                      <Building2 className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-semibold">{job.company.name}</h2>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(job.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
                <Badge variant={job.isActive ? "default" : "secondary"}>
                  {job.isActive ? "Activo" : "Inactivo"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Descripción</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {job.description}
                </p>
              </div>

              {job.requirements && job.requirements.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Requisitos</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {job.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {job.benefits && job.benefits.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Beneficios</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {job.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
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
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full"
                onClick={() => setShowApplicationForm(true)}
              >
                <Briefcase className="h-4 w-4 mr-2" />
                Aplicar al Trabajo
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setIsChatModalOpen(true)}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Contactar Empresa
              </Button>
            </CardContent>
          </Card>

          {/* Job Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estadísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
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
          onClose={() => setShowApplicationForm(false)}
          onSubmit={handleApplicationSubmit}
        />
      )}

      {/* Chat Modal */}
      <Dialog open={isChatModalOpen} onOpenChange={setIsChatModalOpen}>
        <DialogContent className="max-w-2xl h-[600px] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Conversación con {job.company.name}
            </DialogTitle>
          </DialogHeader>
          
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
                  const isFromCompany = message.senderId === job.company.ownerId;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isFromCompany ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          isFromCompany
                            ? 'bg-background border'
                            : 'bg-primary text-primary-foreground'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
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
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 pt-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setMessageText("Hola! Me interesa mucho esta posición. ¿Podríamos programar una entrevista?");
                }}
              >
                Solicitar entrevista
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setMessageText("Hola! Tengo algunas preguntas sobre la posición. ¿Podrías ayudarme?");
                }}
              >
                Hacer preguntas
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
        </DialogContent>
      </Dialog>
    </div>
  );
}