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
  Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMessages, useConversations, useSendMessage } from "@/hooks/useMessages";
import { useSession } from "next-auth/react";
import { JobPosting } from "@/types/company";

interface JobChatInterfaceProps {
  jobId: string;
  className?: string;
  children: React.ReactNode;
  selectedApplicationId?: string | null;
  onOpenChat?: (applicationId: string) => void;
  applications?: Array<{
    id: string;
    applicant: {
      id: string;
      firstName?: string;
      lastName?: string;
      avatarUrl?: string;
    };
    status: string;
    appliedAt: string;
  }>;
}

interface ApplicationWithMessages {
  id: string;
  applicantName: string;
  applicantId: string;
  avatarUrl?: string;
  lastMessage?: {
    content: string;
    createdAt: string;
    readAt?: string;
  };
  unreadCount: number;
  hasMessages: boolean;
  status: string;
  appliedAt: string;
}

export function JobChatInterface({ 
  jobId, 
  className,
  children,
  selectedApplicationId,
  onOpenChat,
  applications = []
}: JobChatInterfaceProps) {
  const { data: session } = useSession();
  const [showChat, setShowChat] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithMessages | null>(null);
  const [applicationsWithMessages, setApplicationsWithMessages] = useState<ApplicationWithMessages[]>([]);

  // Fetch conversations for this job
  const { data: conversationsData, isLoading: conversationsLoading } = useConversations({
    contextType: 'JOB_APPLICATION',
    contextId: jobId,
  });

  // Fetch messages for selected application
  const { data: messagesData, isLoading: messagesLoading } = useMessages({
    recipientId: selectedApplication?.applicantId || selectedApplicationId,
    contextType: 'JOB_APPLICATION',
    contextId: jobId,
  });

  const sendMessage = useSendMessage();

  // Process conversations to get applications with messages
  useEffect(() => {
    if (conversationsData?.conversations) {
      const applicationsWithMsgs = conversationsData.conversations.map((conv: any) => {
        return {
          id: conv.otherUser.id,
          applicantName: `${conv.otherUser.firstName || ''} ${conv.otherUser.lastName || ''}`.trim() || 'Candidato',
          applicantId: conv.otherUser.id,
          avatarUrl: conv.otherUser.avatarUrl,
          lastMessage: conv.lastMessage,
          unreadCount: conv.unreadCount,
          hasMessages: true,
          status: 'APPLIED', // Default status
          appliedAt: conv.lastMessage?.createdAt || new Date().toISOString(),
        };
      });
      
      setApplicationsWithMessages(applicationsWithMsgs);
    }
  }, [conversationsData]);

  // Handle external selectedApplicationId prop
  useEffect(() => {
    if (selectedApplicationId) {
      // First try to find in existing applications with messages
      let application = applicationsWithMessages.find(a => a.id === selectedApplicationId);
      
      if (application) {
        setSelectedApplication(application);
        setShowChat(true);
      } else {
        // If not found in messages, try to find in applications list
        const applicationData = applications.find(app => app.id === selectedApplicationId);
        if (applicationData) {
          const applicationFromList = {
            id: applicationData.id,
            applicantName: `${applicationData.applicant.firstName || ''} ${applicationData.applicant.lastName || ''}`.trim() || 'Candidato',
            applicantId: applicationData.applicant.id,
            avatarUrl: applicationData.applicant.avatarUrl,
            hasMessages: false,
            unreadCount: 0,
            status: applicationData.status,
            appliedAt: applicationData.appliedAt,
          };
          setSelectedApplication(applicationFromList);
          setShowChat(true);
        }
      }
    }
  }, [selectedApplicationId, applicationsWithMessages, applications]);

  const messages = messagesData?.messages || [];

  const handleSendMessage = async (e: React.FormEvent, message: string) => {
    e.preventDefault();
    
    if (!message.trim() || !selectedApplication || sendMessage.isPending) return;

    try {
      await sendMessage.mutateAsync({
        recipientId: selectedApplication.applicantId,
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

  return (
    <div className={cn("flex h-screen bg-gray-50", className)}>
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${showChat ? 'mr-96' : ''}`}>
        {children}
      </div>

      {/* Chat Sidebar */}
      {showChat && (
        <div className="fixed right-0 top-0 h-full w-96 bg-white border-l shadow-lg z-50">
          <div className="flex flex-col h-full">
            {/* Chat Header */}
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  <div>
                    <h3 className="font-semibold">Chat con Candidatos</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedApplication ? `Conversando con ${selectedApplication.applicantName}` : 'Selecciona un candidato'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowChat(false);
                    setSelectedApplication(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Chat Content */}
            <div className="flex-1 overflow-hidden">
              {!selectedApplication ? (
                // Application List
                <div className="h-full flex flex-col">
                  <div className="p-4 border-b">
                    <h4 className="font-medium">Candidatos que han aplicado</h4>
                  </div>
                  <ScrollArea className="flex-1">
                    <div className="p-2 space-y-2">
                      {conversationsLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin" />
                          <span className="ml-2 text-sm text-muted-foreground">Cargando aplicaciones...</span>
                        </div>
                      ) : applicationsWithMessages.length === 0 ? (
                        <div className="text-center py-8">
                          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">No hay conversaciones</h3>
                          <p className="text-muted-foreground text-sm">
                            Los candidatos aparecerán aquí cuando apliquen a tu trabajo.
                          </p>
                          <div className="mt-4 text-xs text-muted-foreground">
                            Las conversaciones se crean cuando un candidato envía su primera aplicación.
                          </div>
                        </div>
                      ) : (
                        applicationsWithMessages.map((application) => (
                          <Card
                            key={application.id}
                            className={cn(
                              "cursor-pointer transition-colors hover:bg-gray-100",
                              selectedApplication?.id === application.id && "bg-blue-50 border-blue-200"
                            )}
                            onClick={() => setSelectedApplication(application)}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={application.avatarUrl} />
                                  <AvatarFallback>
                                    <User className="h-4 w-4" />
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium truncate">{application.applicantName}</p>
                                    <Badge className={getStatusColor(application.status)} variant="secondary">
                                      {getStatusLabel(application.status)}
                                    </Badge>
                                  </div>
                                  {application.lastMessage && (
                                    <p className="text-sm text-muted-foreground truncate">
                                      {application.lastMessage.content}
                                    </p>
                                  )}
                                </div>
                                <div className="flex flex-col items-end space-y-1">
                                  {application.unreadCount > 0 && (
                                    <Badge variant="destructive" className="text-xs">
                                      {application.unreadCount}
                                    </Badge>
                                  )}
                                  {application.lastMessage && (
                                    <span className="text-xs text-muted-foreground">
                                      {formatDateTime(application.lastMessage.createdAt)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>
              ) : (
                // Individual Chat
                <div className="h-full flex flex-col">
                  {/* Application Header */}
                  <div className="p-4 border-b bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={selectedApplication.avatarUrl} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{selectedApplication.applicantName}</h4>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(selectedApplication.status)} variant="secondary">
                            {getStatusLabel(selectedApplication.status)}
                          </Badge>
                          <p className="text-sm text-muted-foreground">Candidato</p>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedApplication(null)}
                      className="mt-2"
                    >
                      ← Volver a la lista
                    </Button>
                  </div>

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
                            Envía tu primer mensaje a {selectedApplication.applicantName}.
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
                                  <AvatarImage src={isOwnMessage ? session?.user?.profile?.avatarUrl : selectedApplication.avatarUrl} />
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
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chat Toggle Button */}
      <Button
        onClick={() => setShowChat(!showChat)}
        className="fixed bottom-6 right-6 z-40 shadow-lg"
        size="lg"
      >
        <MessageSquare className="h-5 w-5 mr-2" />
        {showChat ? 'Cerrar Chat' : 'Abrir Chat'}
      </Button>
    </div>
  );
}
