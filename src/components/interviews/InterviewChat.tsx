"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Send, 
  MessageSquare, 
  User, 
  Building2,
  Clock,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/utils";
import { Interview } from "@/hooks/useInterviews";

interface InterviewChatProps {
  interview: Interview;
  onSendMessage: (message: string) => Promise<boolean>;
  isLoading?: boolean;
  className?: string;
}

export function InterviewChat({ 
  interview, 
  onSendMessage, 
  isLoading = false,
  className 
}: InterviewChatProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [interview.messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isSending) return;

    const messageText = message.trim();
    setMessage("");
    setIsSending(true);

    try {
      const success = await onSendMessage(messageText);
      if (!success) {
        // Restore message if sending failed
        setMessage(messageText);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessage(messageText);
    } finally {
      setIsSending(false);
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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "COMPANIES":
        return <Building2 className="h-4 w-4" />;
      case "YOUTH":
        return <User className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "COMPANIES":
        return "Empresa";
      case "YOUTH":
        return "Candidato";
      default:
        return role;
    }
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquare className="h-5 w-5 mr-2" />
          Chat de Entrevista
        </CardTitle>
        <CardDescription>
          Comunicación sobre {interview.application.jobTitle} - {interview.application.company}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Messages */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {interview.messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay mensajes</h3>
              <p className="text-muted-foreground">
                Inicia la conversación enviando un mensaje.
              </p>
            </div>
          ) : (
            interview.messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex space-x-3",
                  msg.senderId === interview.application.candidate.id ? "justify-end" : "justify-start"
                )}
              >
                {msg.senderId !== interview.application.candidate.id && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={msg.sender.avatar} />
                    <AvatarFallback>
                      {getInitials(msg.sender.name)}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div
                  className={cn(
                    "max-w-xs lg:max-w-md px-4 py-2 rounded-lg",
                    msg.senderId === interview.application.candidate.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  )}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-medium">
                      {msg.sender.name}
                    </span>
                    <div className="flex items-center space-x-1 text-xs opacity-75">
                      {getRoleIcon(msg.sender.role)}
                      <span>{getRoleLabel(msg.sender.role)}</span>
                    </div>
                  </div>
                  <p className="text-sm">{msg.message}</p>
                  <p className="text-xs opacity-75 mt-1">
                    {formatDateTime(msg.createdAt)}
                  </p>
                </div>

                {msg.senderId === interview.application.candidate.id && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={msg.sender.avatar} />
                    <AvatarFallback>
                      {getInitials(msg.sender.name)}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="space-y-2">
          <div className="flex space-x-2">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe tu mensaje..."
              className="min-h-[60px] resize-none"
              disabled={isSending}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
            <Button
              type="submit"
              disabled={!message.trim() || isSending}
              className="self-end"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Presiona Enter para enviar, Shift+Enter para nueva línea
          </p>
        </form>

        {/* Interview Info */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Entrevista programada para {formatDateTime(interview.scheduledAt)}
              </span>
            </div>
            <div className="text-muted-foreground">
              {interview.duration} minutos
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
