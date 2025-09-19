"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageCircle, 
  Send, 
  X, 
  Minimize2,
  Loader2,
  Check,
  CheckCheck,
  UserPlus,
  Users,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useMessages, useSendMessage } from "@/hooks/useMessages";
import { useSession } from "next-auth/react";
import { useReceivedConnections, useAcceptedConnections } from "@/hooks/useEntrepreneurshipConnections";
import { toast } from "sonner";

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize: () => void;
  recipientId?: string;
  recipientName?: string;
  recipientAvatar?: string;
  entrepreneurshipId?: string;
}

export function ChatSidebar({
  isOpen,
  onClose,
  onMinimize,
  recipientId,
  recipientName,
  recipientAvatar,
  entrepreneurshipId,
}: ChatSidebarProps) {
  const { data: session } = useSession();
  const [message, setMessage] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState("requests");
  const [selectedChat, setSelectedChat] = useState<{
    recipientId: string;
    recipientName: string;
    recipientAvatar?: string;
    entrepreneurshipId?: string;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get connection data
  const { connections: receivedConnections, updateConnection, isUpdating } = useReceivedConnections();
  const { connections: acceptedConnections } = useAcceptedConnections();

  // Get messages for selected chat
  const { 
    data: messagesData, 
    isLoading: messagesLoading,
    refetch: refetchMessages 
  } = useMessages({
    recipientId: selectedChat?.recipientId,
    contextType: "ENTREPRENEURSHIP",
    contextId: selectedChat?.entrepreneurshipId,
  });

  const messages = messagesData?.messages || [];

  // Send message mutation
  const sendMessageMutation = useSendMessage();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Filter pending connections
  const pendingConnections = receivedConnections.filter(conn => conn.status === "PENDING");

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || sendMessageMutation.isPending || !selectedChat) {
      return;
    }

    const messageText = message.trim();
    setMessage("");

    try {
      await sendMessageMutation.mutateAsync({
        recipientId: selectedChat.recipientId,
        content: messageText,
        contextType: "ENTREPRENEURSHIP",
        contextId: selectedChat.entrepreneurshipId,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Error al enviar mensaje", {
        description: "No se pudo enviar el mensaje. Intenta nuevamente.",
      });
      // Restore message if sending failed
      setMessage(messageText);
    }
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
    onMinimize();
  };

  const handleAcceptConnection = async (connectionId: string) => {
    try {
      await updateConnection({ connectionId, status: "ACCEPTED" });
      toast.success("Conexión aceptada");
    } catch (error) {
      console.error("Error accepting connection:", error);
      toast.error("Error al aceptar conexión");
    }
  };

  const handleDeclineConnection = async (connectionId: string) => {
    try {
      await updateConnection({ connectionId, status: "DECLINED" });
      toast.success("Conexión rechazada");
    } catch (error) {
      console.error("Error declining connection:", error);
      toast.error("Error al rechazar conexión");
    }
  };

  const handleSelectChat = (connection: any) => {
    // Determine which user is the other party (not the current user)
    const isCurrentUserRequester = connection.requesterId === session?.user?.id;
    const otherUser = isCurrentUserRequester ? connection.addressee : connection.requester;
    
    setSelectedChat({
      recipientId: otherUser.id, // This should be the user ID, not profile ID
      recipientName: otherUser.name,
      recipientAvatar: otherUser.image,
      entrepreneurshipId: undefined
    });
    setActiveTab("chats");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isOwnMessage = (senderId: string) => {
    return senderId === session?.user?.id;
  };

  if (!isOpen) return null;

  return (
    <div className={cn(
      "fixed right-0 top-0 h-screen bg-white border-l shadow-lg transition-all duration-300 z-50 flex flex-col",
      isMinimized ? "w-16" : "w-96"
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
          <div className="flex items-center justify-between p-4 border-b bg-muted/50 flex-shrink-0">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-6 w-6" />
              <div>
                <h3 className="font-medium text-sm">Mensajes</h3>
                <p className="text-xs text-muted-foreground">Red de Emprendimientos</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMinimize}
                className="h-8 w-8 p-0"
              >
                <Minimize2 className="h-4 w-4" />
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
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
            <div className="px-4 pt-4 flex-shrink-0">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="requests" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Solicitudes
                  {pendingConnections.length > 0 && (
                    <Badge variant="destructive" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {pendingConnections.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="chats" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Chats
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Connection Requests Tab */}
            <TabsContent value="requests" className="flex-1 m-0">
              <ScrollArea className="h-full p-4">
                {pendingConnections.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <UserPlus className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No tienes solicitudes pendientes
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingConnections.map((connection) => (
                      <div key={connection.id} className="border rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={connection.requester.image} />
                            <AvatarFallback>
                              {getInitials(connection.requester.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm">
                              {connection.requester.name}
                            </h4>
                            {connection.message && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {connection.message}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-3">
                              <Button
                                size="sm"
                                onClick={() => handleAcceptConnection(connection.id)}
                                disabled={isUpdating}
                                className="h-7 px-3 text-xs"
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Aceptar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeclineConnection(connection.id)}
                                disabled={isUpdating}
                                className="h-7 px-3 text-xs"
                              >
                                <X className="h-3 w-3 mr-1" />
                                Rechazar
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            {/* Chats Tab */}
            <TabsContent value="chats" className="flex-1 m-0 min-h-0">
              {selectedChat ? (
                <div className="flex flex-col h-full min-h-0">
                  {/* Chat Header */}
                  <div className="flex items-center gap-3 p-4 border-b bg-muted/50 flex-shrink-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={selectedChat.recipientAvatar} />
                      <AvatarFallback>
                        {getInitials(selectedChat.recipientName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{selectedChat.recipientName}</h4>
                      <p className="text-xs text-muted-foreground">Emprendedor</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedChat(null)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 min-h-0">
                    <ScrollArea className="h-full p-4">
                    {messagesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <MessageCircle className="h-12 w-12 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Inicia una conversación con {selectedChat.recipientName}
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
                                <AvatarImage src={selectedChat.recipientAvatar} />
                                <AvatarFallback className="text-xs">
                                  {getInitials(selectedChat.recipientName)}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            
                            <div className={cn(
                              "max-w-[70%] space-y-1",
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
                  <div className="p-4 border-t flex-shrink-0">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={`Escribe un mensaje a ${selectedChat.recipientName}...`}
                        className="min-h-[40px] max-h-[120px] resize-none"
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
                        className="px-3"
                      >
                        {sendMessageMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </form>
                  </div>
                </div>
              ) : (
                <ScrollArea className="h-full p-4">
                  {acceptedConnections.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Users className="h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No tienes conexiones aceptadas
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {acceptedConnections.map((connection) => {
                        // Determine which user is the other party (not the current user)
                        const isCurrentUserRequester = connection.requesterId === session?.user?.id;
                        const otherUser = isCurrentUserRequester ? connection.addressee : connection.requester;
                        
                        return (
                          <div
                            key={connection.id}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                            onClick={() => handleSelectChat(connection)}
                          >
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={otherUser.image} />
                              <AvatarFallback>
                                {getInitials(otherUser.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">
                                {otherUser.name}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                Emprendedor
                              </p>
                            </div>
                            <MessageCircle className="h-4 w-4 text-muted-foreground" />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}


