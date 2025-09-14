"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, 
  MessageSquare, 
  User, 
  Building2,
  Loader2,
  Search,
  Filter,
  Check,
  CheckCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/utils";
import { useMessages, useConversations, useSendMessage, useMarkAsRead, Conversation } from "@/hooks/useMessages";

interface MessageInterfaceProps {
  contextType?: 'JOB_APPLICATION' | 'YOUTH_APPLICATION' | 'ENTREPRENEURSHIP' | 'GENERAL';
  contextId?: string;
  recipientId?: string;
  className?: string;
}

export function MessageInterface({ 
  contextType = 'GENERAL', 
  contextId, 
  className 
}: MessageInterfaceProps) {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  const { data: conversationsData, isLoading: conversationsLoading } = useConversations({
    contextType,
    contextId,
  });

  // Fetch messages for selected conversation
  const { data: messagesData, isLoading: messagesLoading } = useMessages({
    contextType,
    contextId,
    recipientId: selectedConversation?.otherUser.id,
  });

  const sendMessage = useSendMessage();
  const markAsRead = useMarkAsRead();

  const conversations = conversationsData?.conversations || [];
  const messages = useMemo(() => messagesData?.messages || [], [messagesData?.messages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedConversation && messages.length > 0) {
      const unreadMessages = messages.filter(msg => 
        !msg.isRead && msg.senderId !== selectedConversation.otherUser.id
      );
      
      unreadMessages.forEach(msg => {
        markAsRead(msg.id);
      });
    }
  }, [selectedConversation, messages, markAsRead]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isSending || !selectedConversation) return;

    const messageText = message.trim();
    setMessage("");
    setIsSending(true);

    try {
      await sendMessage.mutateAsync({
        recipientId: selectedConversation.otherUser.id,
        content: messageText,
        messageType: "text",
        contextType,
        contextId,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      // Restore message if sending failed
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
      case "ENTREPRENEUR":
        return "Emprendedor";
      case "INSTRUCTOR":
        return "Instructor";
      case "SUPERADMIN":
        return "Administrador";
      default:
        return role;
    }
  };

  const getContextLabel = (contextType: string) => {
    switch (contextType) {
      case "JOB_APPLICATION":
        return "Solicitud de Trabajo";
      case "YOUTH_APPLICATION":
        return "Solicitud Abierta";
      case "ENTREPRENEURSHIP":
        return "Emprendimiento";
      case "GENERAL":
        return "General";
      default:
        return contextType;
    }
  };

  return (
    <div className={cn("flex h-[600px] border rounded-lg overflow-hidden", className)}>
      {/* Conversations Sidebar */}
      <div className="w-1/3 border-r bg-gray-50">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Conversaciones</h3>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Badge variant="secondary" className="mb-2">
            {getContextLabel(contextType)}
          </Badge>
        </div>

        <ScrollArea className="h-[calc(100%-80px)]">
          <div className="p-2 space-y-2">
            {conversationsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay conversaciones</h3>
                <p className="text-muted-foreground text-sm">
                  Las conversaciones aparecerán aquí cuando recibas mensajes.
                </p>
              </div>
            ) : (
              conversations.map((conversation: Conversation) => (
                <Card
                  key={conversation.id}
                  className={cn(
                    "cursor-pointer transition-colors hover:bg-gray-100",
                    selectedConversation?.id === conversation.id && "bg-blue-50 border-blue-200"
                  )}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conversation.otherUser.avatar} />
                        <AvatarFallback>
                          {getInitials(conversation.otherUser.name)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm truncate">
                            {conversation.otherUser.name}
                          </h4>
                          {conversation.unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          {getRoleIcon(conversation.otherUser.role)}
                          <span>{getRoleLabel(conversation.otherUser.role)}</span>
                        </div>
                        
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {conversation.lastMessage.content}
                        </p>
                        
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(conversation.lastMessage.createdAt)}
                          </span>
                          <div className="flex items-center space-x-1">
                            {conversation.lastMessage.isRead ? (
                              <CheckCheck className="h-3 w-3 text-blue-500" />
                            ) : (
                              <Check className="h-3 w-3 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Message Header */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedConversation.otherUser.avatar} />
                  <AvatarFallback>
                    {getInitials(selectedConversation.otherUser.name)}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <h3 className="font-semibold">{selectedConversation.otherUser.name}</h3>
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    {getRoleIcon(selectedConversation.otherUser.role)}
                    <span>{getRoleLabel(selectedConversation.otherUser.role)}</span>
                  </div>
                </div>
              </div>
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
                    <h3 className="text-lg font-semibold mb-2">No hay mensajes</h3>
                    <p className="text-muted-foreground">
                      Inicia la conversación enviando un mensaje.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex space-x-3",
                        msg.senderId === selectedConversation.otherUser.id ? "justify-start" : "justify-end"
                      )}
                    >
                      {msg.senderId === selectedConversation.otherUser.id && (
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
                          msg.senderId === selectedConversation.otherUser.id
                            ? "bg-gray-100 text-gray-900"
                            : "bg-blue-600 text-white"
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
                        <p className="text-sm">{msg.content}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs opacity-75">
                            {formatDateTime(msg.createdAt)}
                          </p>
                          <div className="flex items-center space-x-1">
                            {msg.isRead ? (
                              <CheckCheck className="h-3 w-3" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                          </div>
                        </div>
                      </div>

                      {msg.senderId !== selectedConversation.otherUser.id && (
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
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t bg-white">
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
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Selecciona una conversación</h3>
              <p className="text-muted-foreground">
                Elige una conversación del panel lateral para comenzar a chatear.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
