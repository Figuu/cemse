"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  MessageCircle, 
  Search, 
  Send,
  Building2,
  User,
  Calendar,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { useMessages, useSendMessage } from "@/hooks/useMessages";
import { useConversations } from "@/hooks/useMessages";

export default function MessagesPage() {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [messageText, setMessageText] = useState("");

  // Get all conversations
  const { data: conversations, isLoading: conversationsLoading } = useConversations();

  // Get messages for selected conversation
  const { data: messagesData } = useMessages({
    recipientId: selectedConversation?.otherUser?.id,
    contextType: selectedConversation?.contextType,
    contextId: selectedConversation?.contextId,
    enabled: !!selectedConversation,
  });

  const sendMessageMutation = useSendMessage();

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return;
    
    sendMessageMutation.mutate({
      recipientId: selectedConversation.otherUser.id,
      content: messageText,
      contextType: selectedConversation.contextType,
      contextId: selectedConversation.contextId,
    });
    
    setMessageText("");
  };

  const handleOpenChat = (conversation: any) => {
    setSelectedConversation(conversation);
    setIsChatModalOpen(true);
  };

  // Use conversations directly since they're already grouped
  const conversationList = conversations?.conversations?.sort((a: any, b: any) => 
    new Date(b.lastMessage?.createdAt || 0).getTime() - new Date(a.lastMessage?.createdAt || 0).getTime()
  ) || [];

  if (conversationsLoading) {
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
            <h1 className="text-2xl font-bold">Mensajes</h1>
            <p className="text-muted-foreground">Cargando conversaciones...</p>
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
          <h1 className="text-2xl font-bold">Mensajes</h1>
          <p className="text-muted-foreground">
            {conversationList.length} conversaciones
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                <Input
                  placeholder="Buscar conversaciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {conversationList.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No tienes conversaciones aún</p>
                  <p className="text-sm">Contacta empresas desde las ofertas de trabajo</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {conversationList
                    .filter((conv: any) => 
                      conv.otherUser.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      conv.otherUser.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      conv.lastMessage?.content?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((conversation: any) => (
                      <div
                        key={conversation.id}
                        className="p-4 hover:bg-muted/50 cursor-pointer border-b last:border-b-0"
                        onClick={() => handleOpenChat(conversation)}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={conversation.otherUser.avatarUrl} />
                            <AvatarFallback>
                              <User className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium truncate">
                                {conversation.otherUser.firstName} {conversation.otherUser.lastName}
                              </h3>
                              <Badge variant="outline" className="text-xs">
                                {conversation.contextType === 'JOB_APPLICATION' ? 'Trabajo' : 'General'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {conversation.lastMessage?.content || 'No hay mensajes'}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {conversation.lastMessage?.createdAt ? new Date(conversation.lastMessage.createdAt).toLocaleDateString() : 'Sin fecha'}
                              </span>
                              {conversation.unreadCount > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chat Preview */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground py-12">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Selecciona una conversación</h3>
                <p>Elige una conversación de la lista para ver los mensajes</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Chat Modal */}
      <Dialog open={isChatModalOpen} onOpenChange={setIsChatModalOpen}>
        <DialogContent className="max-w-2xl h-[600px] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Conversación con {selectedConversation?.otherUser.firstName} {selectedConversation?.otherUser.lastName}
            </DialogTitle>
          </DialogHeader>
          
          {selectedConversation && (
            <div className="flex-1 flex flex-col">
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 p-4 border rounded-lg bg-muted/20">
                {messagesData?.messages?.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No hay mensajes aún. ¡Inicia la conversación!</p>
                  </div>
                ) : (
                  messagesData?.messages?.map((message: any) => {
                    const isFromMe = message.senderId === session?.user?.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-lg ${
                            isFromMe
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-background border'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            isFromMe ? 'text-primary-foreground/70' : 'text-muted-foreground'
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
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}