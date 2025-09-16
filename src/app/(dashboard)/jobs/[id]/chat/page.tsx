"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft, 
  Briefcase, 
  MapPin, 
  Calendar, 
  Clock, 
  Building2,
  MessageCircle,
  Loader2,
  Check,
  CheckCheck,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMessages, useSendMessage } from "@/hooks/useMessages";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export default function JobChatPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  // Mock job data - in real app, this would come from an API
  const [job, setJob] = useState({
    id: jobId,
    title: "Desarrollador Frontend",
    company: {
      name: "Tech Company",
      logo: "/placeholder-company.png"
    },
    location: "Cochabamba, Bolivia",
    employmentType: "FULL_TIME",
    experienceLevel: "MID_LEVEL",
    description: "Buscamos un desarrollador frontend con experiencia en React y TypeScript...",
    createdAt: new Date().toISOString()
  });

  // Mock company data - in real app, this would come from an API
  const [company, setCompany] = useState({
    id: "company-1",
    name: "Tech Company",
    logo: "/placeholder-company.png"
  });

  // Fetch messages for this job application - only by contextId (jobOfferId)
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
        recipientId: company.id, // Required for sending, but fetching will show all messages
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

  if (messagesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 mr-96">
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
                  {job.title}
                </h1>
                <p className="text-muted-foreground">
                  {job.company.name}
                </p>
              </div>
            </div>
          </div>

          {/* Job Details */}
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
                    <CardTitle className="text-lg">
                      {job.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {job.company.name}
                    </p>
                  </div>
                </div>
                <Badge variant="outline">
                  Aplicado
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Tiempo Completo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Nivel Intermedio</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Descripción</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {job.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Chat Sidebar */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white border-l shadow-lg z-50">
        <div className="flex flex-col h-full">
          {/* Chat Header */}
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MessageCircle className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-semibold">Chat con Empresa</h3>
                  <p className="text-sm text-muted-foreground">
                    {company.name}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Content */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full flex flex-col">
              {/* Company Header */}
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={company.logo} />
                    <AvatarFallback>
                      <Building2 className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{company.name}</h4>
                    <p className="text-sm text-muted-foreground">Empresa</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Inicia la conversación</h3>
                      <p className="text-muted-foreground text-sm">
                        Envía tu primer mensaje a {company.name}.
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
                              <AvatarImage src={isOwnMessage ? session?.user?.profile?.avatarUrl : company.logo} />
                              <AvatarFallback>
                                {isOwnMessage ? getInitials(`${session?.user?.name || 'Yo'}`) : <Building2 className="h-4 w-4" />}
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
              </div>

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
    </div>
  );
}