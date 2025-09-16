"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageSquare, 
  X, 
  User, 
  MessageCircle,
  Loader2,
  Check,
  CheckCheck,
  Briefcase,
  FileText,
  Download,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMessages, useSendMessage } from "@/hooks/useMessages";
import { useSession } from "next-auth/react";

interface JobApplicationChatProps {
  jobId: string;
  applicationId: string;
  applicant: {
    id: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    email?: string;
    phone?: string;
  };
  application: {
    id: string;
    status: string;
    appliedAt: string;
    coverLetter?: string;
    cvFile?: string;
    cvUrl?: string;
    coverLetterFile?: string;
    coverLetterUrl?: string;
  };
  onClose: () => void;
  onUpdateStatus?: (status: string) => void;
}

export function JobApplicationChat({
  jobId,
  applicationId,
  applicant,
  application,
  onClose,
  onUpdateStatus
}: JobApplicationChatProps) {
  const { data: session } = useSession();
  const [showApplicationDetails, setShowApplicationDetails] = useState(false);

  // Fetch messages for this application - only by contextId (jobOfferId)
  const { data: messagesData, isLoading: messagesLoading } = useMessages({
    contextType: 'JOB_APPLICATION',
    contextId: jobId,
  });

  const sendMessage = useSendMessage();

  const messages = messagesData?.messages || [];

  const handleSendMessage = async (e: React.FormEvent, message: string) => {
    e.preventDefault();
    
    if (!message.trim() || sendMessage.isPending) return;

    try {
      await sendMessage.mutateAsync({
        recipientId: applicant.id, // Required for sending, but fetching will show all messages
        content: message.trim(),
        contextType: 'JOB_APPLICATION',
        contextId: jobId,
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT': return 'bg-blue-100 text-blue-800';
      case 'UNDER_REVIEW': return 'bg-yellow-100 text-yellow-800';
      case 'PRE_SELECTED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'HIRED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'SENT': return 'Enviada';
      case 'UNDER_REVIEW': return 'En Revisión';
      case 'PRE_SELECTED': return 'Pre-seleccionado';
      case 'REJECTED': return 'Rechazada';
      case 'HIRED': return 'Contratado';
      default: return status;
    }
  };

  const applicantName = `${applicant.firstName || ''} ${applicant.lastName || ''}`.trim() || 'Candidato';

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white border-l shadow-lg z-50">
      <div className="flex flex-col h-full">
        {/* Chat Header */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-semibold">Chat con Candidato</h3>
                <p className="text-sm text-muted-foreground">
                  {applicantName}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Chat Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
            {/* Application Header */}
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={applicant.avatarUrl} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">{applicantName}</h4>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(application.status)} variant="secondary">
                      {getStatusLabel(application.status)}
                    </Badge>
                    <p className="text-sm text-muted-foreground">Candidato</p>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowApplicationDetails(!showApplicationDetails)}
                className="mt-2"
              >
                {showApplicationDetails ? 'Ocultar Detalles' : 'Ver Detalles de Aplicación'}
              </Button>
            </div>

            {/* Application Details */}
            {showApplicationDetails && (
              <div className="p-4 border-b bg-gray-50 max-h-64 overflow-y-auto">
                <h5 className="font-medium mb-3">Detalles de la Aplicación</h5>
                
                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <div className="text-sm">
                    <span className="font-medium">Email:</span> {applicant.email}
                  </div>
                  {applicant.phone && (
                    <div className="text-sm">
                      <span className="font-medium">Teléfono:</span> {applicant.phone}
                    </div>
                  )}
                  <div className="text-sm">
                    <span className="font-medium">Aplicó:</span> {formatDateTime(application.appliedAt)}
                  </div>
                </div>

                {/* Cover Letter */}
                {application.coverLetter && (
                  <div className="mb-4">
                    <h6 className="font-medium text-sm mb-2">Carta de Presentación</h6>
                    <div className="text-sm text-muted-foreground bg-white p-3 rounded border max-h-32 overflow-y-auto">
                      {application.coverLetter}
                    </div>
                  </div>
                )}

                {/* Documents */}
                <div className="space-y-2">
                  <h6 className="font-medium text-sm">Documentos</h6>
                  {application.cvFile && (
                    <div className="flex items-center justify-between p-2 bg-white rounded border">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">CV/Resume</span>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Descargar
                      </Button>
                    </div>
                  )}
                  {application.cvUrl && (
                    <div className="flex items-center justify-between p-2 bg-white rounded border">
                      <div className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">CV/Resume (URL)</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(application.cvUrl, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                    </div>
                  )}
                  {application.coverLetterFile && (
                    <div className="flex items-center justify-between p-2 bg-white rounded border">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Carta de Presentación</span>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Descargar
                      </Button>
                    </div>
                  )}
                  {application.coverLetterUrl && (
                    <div className="flex items-center justify-between p-2 bg-white rounded border">
                      <div className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Carta de Presentación (URL)</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(application.coverLetterUrl, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messagesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Inicia la conversación</h3>
                    <p className="text-muted-foreground text-sm">
                      Envía tu primer mensaje a {applicantName}.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isOwnMessage = msg.senderId === session?.user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex gap-3",
                          isOwnMessage ? "justify-end" : "justify-start"
                        )}
                      >
                        <div className={cn(
                          "flex gap-3 max-w-[80%]",
                          isOwnMessage ? "flex-row-reverse" : "flex-row"
                        )}>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={isOwnMessage ? session?.user?.profile?.avatarUrl : applicant.avatarUrl} />
                            <AvatarFallback>
                              {isOwnMessage ? getInitials(`${session?.user?.name || 'Yo'}`) : <User className="h-4 w-4" />}
                            </AvatarFallback>
                          </Avatar>
                          <div className={cn(
                            "rounded-lg px-3 py-2",
                            isOwnMessage 
                              ? "bg-blue-600 text-white" 
                              : "bg-gray-100"
                          )}>
                            <p className="text-sm">{msg.content}</p>
                            <div className={cn(
                              "flex items-center gap-1 mt-1 text-xs",
                              isOwnMessage ? "text-blue-100" : "text-muted-foreground"
                            )}>
                              <span>{formatDateTime(msg.createdAt)}</span>
                              {isOwnMessage && (
                                <span>
                                  {msg.readAt ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t p-4">
              <form onSubmit={(e) => {
                const input = e.currentTarget.querySelector('input') as HTMLInputElement;
                if (input) {
                  handleSendMessage(e, input.value);
                  input.value = '';
                }
              }} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Escribe tu mensaje..."
                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      const input = e.currentTarget;
                      handleSendMessage(e, input.value);
                      input.value = '';
                    }
                  }}
                />
                <Button 
                  type="submit" 
                  disabled={sendMessage.isPending}
                  size="sm"
                >
                  {sendMessage.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MessageCircle className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
