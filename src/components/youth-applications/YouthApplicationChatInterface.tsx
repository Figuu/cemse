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
  Building2, 
  MessageCircle,
  Loader2,
  Check,
  CheckCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMessages, useConversations, useSendMessage, Conversation } from "@/hooks/useMessages";
import { useSession } from "next-auth/react";

interface YouthApplicationChatInterfaceProps {
  applicationId: string;
  youthId: string;
  className?: string;
  children: React.ReactNode;
  selectedCompanyId?: string | null;
  onOpenChat?: (companyId: string) => void;
  companyInterests?: Array<{
    id: string;
    company: {
      id: string;
      name: string;
      logoUrl?: string;
      ownerId: string;
    };
  }>;
}

interface CompanyWithMessages {
  id: string;
  name: string;
  logoUrl?: string;
  lastMessage?: {
    content: string;
    createdAt: string;
    readAt?: string;
  };
  unreadCount: number;
  hasMessages: boolean;
}

export function YouthApplicationChatInterface({ 
  applicationId, 
  youthId, 
  className,
  children,
  selectedCompanyId,
  onOpenChat,
  companyInterests
}: YouthApplicationChatInterfaceProps) {
  const { data: session } = useSession();
  const [showChat, setShowChat] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanyWithMessages | null>(null);
  const [companiesWithMessages, setCompaniesWithMessages] = useState<CompanyWithMessages[]>([]);

  // Debug logging
  console.log('YouthApplicationChatInterface props:', { selectedCompanyId, onOpenChat });
  console.log('Current internal state - showChat:', showChat, 'selectedCompany:', selectedCompany);
  console.log('companyInterests passed:', companyInterests);

  // Log when props change
  useEffect(() => {
    console.log('=== Props changed in YouthApplicationChatInterface ===');
    console.log('selectedCompanyId:', selectedCompanyId);
    console.log('companyInterests length:', companyInterests?.length);
  }, [selectedCompanyId, companyInterests]);

  // Fetch conversations for this youth application
  const { data: conversationsData, isLoading: conversationsLoading } = useConversations({
    contextType: 'YOUTH_APPLICATION',
    contextId: applicationId,
  });

  // Fetch messages for selected company
  // For youth users, we need to fetch messages where the company is the sender
  // and the youth (current user) is the recipient
  const { data: messagesData, isLoading: messagesLoading } = useMessages({
    recipientId: selectedCompany?.id || selectedCompanyId,
    contextType: 'YOUTH_APPLICATION',
    contextId: applicationId,
  });

  console.log('=== MESSAGE FETCHING DEBUG ===');
  console.log('Message fetching params:', {
    recipientId: selectedCompany?.id || selectedCompanyId,
    contextType: 'YOUTH_APPLICATION',
    contextId: applicationId,
    currentUserId: session?.user?.id
  });
  console.log('Selected company:', selectedCompany);
  console.log('Selected company ID:', selectedCompany?.id);
  console.log('Selected company ID (fallback):', selectedCompanyId);

  const sendMessage = useSendMessage();

  // Process conversations to get companies with messages
  useEffect(() => {
    if (conversationsData?.conversations) {
      console.log('=== CONVERSATIONS DATA DEBUG ===');
      console.log('Raw conversations data:', conversationsData.conversations);
      
      const companies = conversationsData.conversations.map((conv: any) => {
        console.log('Processing conversation:', {
          id: conv.otherUser.id,
          name: `${conv.otherUser.firstName || ''} ${conv.otherUser.lastName || ''}`.trim(),
          lastMessage: conv.lastMessage
        });
        
        return {
          id: conv.otherUser.id,
          name: `${conv.otherUser.firstName || ''} ${conv.otherUser.lastName || ''}`.trim() || 'Empresa',
          logoUrl: conv.otherUser.avatarUrl,
          lastMessage: conv.lastMessage,
          unreadCount: conv.unreadCount,
          hasMessages: true,
        };
      });
      
      console.log('Processed companies:', companies);
      setCompaniesWithMessages(companies);
    }
  }, [conversationsData]);

  // Handle external selectedCompanyId prop
  useEffect(() => {
    console.log('=== selectedCompanyId effect triggered ===');
    console.log('selectedCompanyId:', selectedCompanyId);
    console.log('companiesWithMessages length:', companiesWithMessages.length);
    console.log('companyInterests length:', companyInterests?.length);
    
    if (selectedCompanyId) {
      // First try to find in existing companies with messages
      let company = companiesWithMessages.find(c => c.id === selectedCompanyId);
      
      if (company) {
        console.log('Company found in existing list:', company);
        setSelectedCompany(company);
        setShowChat(true);
      } else {
        // If not found in messages, try to find in company interests
        const companyInterest = companyInterests?.find(interest => interest.company.id === selectedCompanyId);
        if (companyInterest) {
          console.log('Company found in interests:', companyInterest.company);
          console.log('Company ownerId (user ID):', companyInterest.company.ownerId);
          
          // Try to find this company in the conversations by matching the company name
          // This is a fallback - we should ideally have the user ID stored
          const matchingConversation = conversationsData?.conversations?.find((conv: any) => {
            const convName = `${conv.otherUser.firstName || ''} ${conv.otherUser.lastName || ''}`.trim();
            return convName.toLowerCase().includes(companyInterest.company.name.toLowerCase()) ||
                   companyInterest.company.name.toLowerCase().includes(convName.toLowerCase());
          });
          
          if (matchingConversation) {
            console.log('Found matching conversation for company:', matchingConversation);
            const companyFromConversation = {
              id: matchingConversation.otherUser.id, // Use the correct user ID
              name: companyInterest.company.name,
              logoUrl: companyInterest.company.logoUrl,
              hasMessages: true,
              unreadCount: matchingConversation.unreadCount || 0,
              lastMessage: matchingConversation.lastMessage,
            };
            setSelectedCompany(companyFromConversation);
            setShowChat(true);
          } else {
            console.log('No matching conversation found, using ownerId as user ID');
            const companyFromInterest = {
              id: companyInterest.company.ownerId, // Use ownerId (user ID) instead of id (profile ID)
              name: companyInterest.company.name,
              logoUrl: companyInterest.company.logoUrl,
              hasMessages: true, // Assume they have messages since we're opening chat
              unreadCount: 0,
            };
            setSelectedCompany(companyFromInterest);
            setShowChat(true);
          }
        } else {
          // Last resort: create a temporary company object
          console.log('Company not found anywhere, creating temporary object');
          const tempCompany = {
            id: selectedCompanyId,
            name: 'Empresa',
            logoUrl: undefined,
            hasMessages: true,
            unreadCount: 0,
          };
          setSelectedCompany(tempCompany);
          setShowChat(true);
        }
      }
    }
    console.log('=== selectedCompanyId effect completed ===');
  }, [selectedCompanyId, companiesWithMessages, companyInterests, conversationsData]);

  // Force chat to open when selectedCompanyId is provided
  useEffect(() => {
    if (selectedCompanyId && !showChat) {
      console.log('Force opening chat for selectedCompanyId:', selectedCompanyId);
      setShowChat(true);
    }
  }, [selectedCompanyId, showChat]);

  // Handle external onOpenChat function
  const handleExternalOpenChat = (companyId: string) => {
    if (onOpenChat) {
      onOpenChat(companyId);
    } else {
      // Fallback to internal logic
      const company = companiesWithMessages.find(c => c.id === companyId);
      if (company) {
        setSelectedCompany(company);
        setShowChat(true);
      }
    }
  };

  // Listen for custom openChat events
  useEffect(() => {
    const handleOpenChatEvent = (event: CustomEvent) => {
      console.log('Custom openChat event received:', event.detail);
      const { companyId } = event.detail;
      console.log('Looking for company with ID:', companyId);
      console.log('Available companies:', companiesWithMessages);
      console.log('Company interests:', companyInterests);
      
      // First try to find in companies with messages
      let company = companiesWithMessages.find(c => c.id === companyId);
      
      if (company) {
        console.log('Company found in messages, opening chat:', company);
        setSelectedCompany(company);
        setShowChat(true);
      } else {
        // Try to find in company interests
        const companyInterest = companyInterests?.find(interest => interest.company.id === companyId);
        if (companyInterest) {
          console.log('Company found in interests:', companyInterest.company);
          console.log('Company ownerId (user ID):', companyInterest.company.ownerId);
          
          // Try to find this company in the conversations by matching the company name
          const matchingConversation = conversationsData?.conversations?.find((conv: any) => {
            const convName = `${conv.otherUser.firstName || ''} ${conv.otherUser.lastName || ''}`.trim();
            return convName.toLowerCase().includes(companyInterest.company.name.toLowerCase()) ||
                   companyInterest.company.name.toLowerCase().includes(convName.toLowerCase());
          });
          
          if (matchingConversation) {
            console.log('Found matching conversation for company:', matchingConversation);
            const companyFromConversation = {
              id: matchingConversation.otherUser.id, // Use the correct user ID
              name: companyInterest.company.name,
              logoUrl: companyInterest.company.logoUrl,
              hasMessages: true,
              unreadCount: matchingConversation.unreadCount || 0,
              lastMessage: matchingConversation.lastMessage,
            };
            setSelectedCompany(companyFromConversation);
            setShowChat(true);
          } else {
            console.log('No matching conversation found, using ownerId as user ID');
            const companyFromInterest = {
              id: companyInterest.company.ownerId, // Use ownerId (user ID) instead of id (profile ID)
              name: companyInterest.company.name,
              logoUrl: companyInterest.company.logoUrl,
              hasMessages: true,
              unreadCount: 0,
            };
            setSelectedCompany(companyFromInterest);
            setShowChat(true);
          }
        } else {
          console.log('Company not found anywhere');
        }
      }
    };

    window.addEventListener('openChat', handleOpenChatEvent as EventListener);
    return () => {
      window.removeEventListener('openChat', handleOpenChatEvent as EventListener);
    };
  }, [companiesWithMessages, companyInterests, conversationsData]);

  const messages = messagesData?.messages || [];
  
  console.log('Messages data received:', {
    messagesCount: messages.length,
    messages: messages.map(m => ({
      id: m.id,
      senderId: m.senderId,
      recipientId: m.recipientId,
      content: m.content.substring(0, 50) + '...',
      createdAt: m.createdAt
    }))
  });

  const handleSendMessage = async (e: React.FormEvent, message: string) => {
    e.preventDefault();
    
    if (!message.trim() || !selectedCompany || sendMessage.isPending) return;

    try {
      await sendMessage.mutateAsync({
        recipientId: selectedCompany.id,
        content: message.trim(),
        contextType: 'YOUTH_APPLICATION',
        contextId: applicationId,
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

  console.log('=== YouthApplicationChatInterface rendering ===');
  console.log('showChat:', showChat, 'selectedCompany:', selectedCompany);

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
                    <h3 className="font-semibold">Chat con Empresas</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedCompany ? `Conversando con ${selectedCompany.name}` : 'Selecciona una empresa'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowChat(false);
                    setSelectedCompany(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Chat Content */}
            <div className="flex-1 overflow-hidden">
              {!selectedCompany ? (
                // Company List
                <div className="h-full flex flex-col">
                  <div className="p-4 border-b">
                    <h4 className="font-medium">Empresas que han contactado</h4>
                  </div>
                  <ScrollArea className="flex-1">
                    <div className="p-2 space-y-2">
                      {conversationsLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin" />
                          <span className="ml-2 text-sm text-muted-foreground">Cargando conversaciones...</span>
                        </div>
                      ) : companiesWithMessages.length === 0 ? (
                        <div className="text-center py-8">
                          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">No hay conversaciones</h3>
                          <p className="text-muted-foreground text-sm">
                            Las empresas aparecerán aquí cuando te contacten a través de tu aplicación.
                          </p>
                          <div className="mt-4 text-xs text-muted-foreground">
                            Las conversaciones se crean cuando una empresa envía su primer mensaje.
                          </div>
                        </div>
                      ) : (
                        companiesWithMessages.map((company) => (
                          <Card
                            key={company.id}
                            className={cn(
                              "cursor-pointer transition-colors hover:bg-gray-100",
                              selectedCompany?.id === company.id && "bg-blue-50 border-blue-200"
                            )}
                            onClick={() => setSelectedCompany(company)}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={company.logoUrl} />
                                  <AvatarFallback>
                                    <Building2 className="h-4 w-4" />
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">{company.name}</p>
                                  {company.lastMessage && (
                                    <p className="text-sm text-muted-foreground truncate">
                                      {company.lastMessage.content}
                                    </p>
                                  )}
                                </div>
                                <div className="flex flex-col items-end space-y-1">
                                  {company.unreadCount > 0 && (
                                    <Badge variant="destructive" className="text-xs">
                                      {company.unreadCount}
                                    </Badge>
                                  )}
                                  {company.lastMessage && (
                                    <span className="text-xs text-muted-foreground">
                                      {formatDateTime(company.lastMessage.createdAt)}
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
                  {/* Company Header */}
                  <div className="p-4 border-b bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={selectedCompany.logoUrl} />
                        <AvatarFallback>
                          <Building2 className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{selectedCompany.name}</h4>
                        <p className="text-sm text-muted-foreground">Empresa</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCompany(null)}
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
                            Envía tu primer mensaje a {selectedCompany.name}.
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
                                  <AvatarImage src={isOwnMessage ? session?.user?.profile?.avatarUrl : selectedCompany.logoUrl} />
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

