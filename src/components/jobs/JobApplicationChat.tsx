"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  ExternalLink,
  Send,
  Minimize2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMessages, useSendMessage } from "@/hooks/useMessages";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

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
  const [message, setMessage] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages for this application - by contextId and recipientId
  const { data: messagesData, isLoading: messagesLoading } = useMessages({
    recipientId: applicant.id,
    contextType: 'JOB_APPLICATION',
    contextId: jobId,
  });

  const sendMessageMutation = useSendMessage();

  const messages = messagesData?.messages || [];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || sendMessageMutation.isPending) return;

    const messageText = message.trim();
    setMessage("");

    console.log("JobApplicationChat - Sending message with:", {
      recipientId: applicant.id,
      contextType: 'JOB_APPLICATION',
      contextId: jobId,
    });

    try {
      await sendMessageMutation.mutateAsync({
        recipientId: applicant.id, // Required for sending, but fetching will show all messages
        content: messageText,
        contextType: 'JOB_APPLICATION',
        contextId: jobId,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      // Restore message if sending failed
      setMessage(messageText);
    }
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
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

  const isOwnMessage = (senderId: string) => {
    return senderId === session?.user?.id;
  };

  return (
    <div className={cn(
      "fixed right-0 top-0 h-screen bg-white border-l shadow-lg transition-all duration-300 z-50 flex flex-col",
      isMinimized ? "w-16" : "w-full sm:w-80 lg:w-80 xl:w-96"
    )}>
      {isMinimized ? (
        // Minimized state
        <div className="h-full flex flex-col items-center justify-center space-y-4 p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMinimize}
            className="h-8 w-8 p-0"
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        // Expanded state
        <div className="flex-1 flex flex-col min-h-0">
          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-muted/50 flex-shrink-0">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-xs sm:text-sm truncate">Chat con Empresa</h3>
                <p className="text-xs text-muted-foreground truncate">{applicantName}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMinimize}
                className="h-7 w-7 sm:h-8 sm:w-8 p-0"
              >
                <Minimize2 className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-7 w-7 sm:h-8 sm:w-8 p-0"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>

          {/* Application Header */}
          <div className="flex items-center gap-3 p-4 border-b bg-muted/50 flex-shrink-0">
            <Avatar className="h-8 w-8">
              <AvatarImage src={applicant.avatarUrl} />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h4 className="font-medium text-sm">{applicantName}</h4>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(application.status)} variant="secondary">
                  {getStatusLabel(application.status)}
                </Badge>
                <p className="text-xs text-muted-foreground">Empresa</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowApplicationDetails(!showApplicationDetails)}
              className="h-8 w-8 p-0"
            >
              <Briefcase className="h-4 w-4" />
            </Button>
          </div>

          {/* Application Details */}
          {showApplicationDetails && (
            <div className="p-4 border-b bg-muted/50 max-h-64 overflow-y-auto">
              <h5 className="font-medium mb-3 text-sm">Detalles de la Aplicación</h5>
              
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
                  <span className="font-medium">Aplicó:</span> {formatDistanceToNow(new Date(application.appliedAt), { addSuffix: true, locale: es })}
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
          <div className="flex-1 min-h-0">
            <ScrollArea className="h-full p-2 sm:p-4">
              {messagesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Inicia una conversación con {applicantName}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex gap-2",
                        isOwnMessage(msg.senderId) ? "justify-end" : "justify-start"
                      )}
                    >
                      {!isOwnMessage(msg.senderId) && (
                        <Avatar className="h-6 w-6 mt-1">
                          <AvatarImage src={applicant.avatarUrl} />
                          <AvatarFallback className="text-xs">
                            {getInitials(applicantName)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div className={cn(
                        "max-w-[75%] sm:max-w-[70%] space-y-1",
                        isOwnMessage(msg.senderId) && "flex flex-col items-end"
                      )}>
                        <div
                          className={cn(
                            "rounded-lg px-3 py-2 text-sm",
                            isOwnMessage(msg.senderId)
                              ? "bg-blue-600 text-white"
                              : "bg-muted"
                          )}
                        >
                          {msg.content}
                        </div>
                        <div className={cn(
                          "flex items-center gap-1 text-xs text-muted-foreground",
                          isOwnMessage(msg.senderId) ? "flex-row-reverse" : "flex-row"
                        )}>
                          <span>
                            {formatDistanceToNow(new Date(msg.createdAt), { 
                              addSuffix: true, 
                              locale: es 
                            })}
                          </span>
                          {isOwnMessage(msg.senderId) && (
                            <div className="flex items-center">
                              {msg.readAt ? (
                                <CheckCheck className="h-3 w-3 text-blue-600" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {isOwnMessage(msg.senderId) && (
                        <Avatar className="h-6 w-6 mt-1">
                          <AvatarImage src={session?.user?.profile?.avatarUrl} />
                          <AvatarFallback className="text-xs">
                            {getInitials(session?.user?.name || "Yo")}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Message Input */}
          <div className="p-2 sm:p-4 border-t flex-shrink-0">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Escribe un mensaje a ${applicantName}...`}
                className="min-h-[36px] sm:min-h-[40px] max-h-[100px] sm:max-h-[120px] resize-none text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              <Button
                type="submit"
                size="sm"
                disabled={!message.trim() || sendMessageMutation.isPending}
                className="px-2 sm:px-3 h-9 sm:h-10"
              >
                {sendMessageMutation.isPending ? (
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                ) : (
                  <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                )}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}