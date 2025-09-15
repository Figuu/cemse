"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  MessageCircle, 
  Building2,
  Loader2
} from "lucide-react";
import { useConversations } from "@/hooks/useMessages";

interface CompanyInterest {
  id: string;
  status: string;
  interestedAt: string;
  company: {
    id: string;
    name: string;
    logoUrl?: string;
  };
}

interface InterestedCompaniesListProps {
  companyInterests: CompanyInterest[];
  applicationId: string;
  onOpenChat: (companyId: string) => void;
}

interface CompanyWithChatStatus extends CompanyInterest {
  hasMessages: boolean;
  unreadCount: number;
  lastMessage?: {
    content: string;
    createdAt: string;
  };
}

export function InterestedCompaniesList({ 
  companyInterests, 
  applicationId, 
  onOpenChat 
}: InterestedCompaniesListProps) {
  const [companiesWithChatStatus, setCompaniesWithChatStatus] = useState<CompanyWithChatStatus[]>([]);

  // Fetch conversations to check which companies have sent messages
  const { data: conversationsData, isLoading: conversationsLoading } = useConversations({
    contextType: 'YOUTH_APPLICATION',
    contextId: applicationId,
  });

  // Process companies to add chat status
  useEffect(() => {
    if (conversationsData?.conversations) {
      const companiesWithMessages = new Map();
      
      // Create a map of companies that have sent messages
      conversationsData.conversations.forEach((conv: any) => {
        companiesWithMessages.set(conv.otherUser.id, {
          hasMessages: true,
          unreadCount: conv.unreadCount,
          lastMessage: conv.lastMessage,
        });
      });

      // Merge with company interests
      const companies = companyInterests.map(interest => ({
        ...interest,
        hasMessages: companiesWithMessages.has(interest.company.id),
        unreadCount: companiesWithMessages.get(interest.company.id)?.unreadCount || 0,
        lastMessage: companiesWithMessages.get(interest.company.id)?.lastMessage,
      }));

      setCompaniesWithChatStatus(companies);
    } else {
      // If no conversations data, just show companies without chat status
      setCompaniesWithChatStatus(companyInterests.map(interest => ({
        ...interest,
        hasMessages: false,
        unreadCount: 0,
      })));
    }
  }, [companyInterests, conversationsData]);

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (companyInterests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Empresas Interesadas (0)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aún no hay empresas interesadas</h3>
            <p className="text-muted-foreground text-sm">
              Las empresas aparecerán aquí cuando muestren interés en tu aplicación.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Heart className="h-5 w-5" />
          Empresas Interesadas ({companyInterests.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {conversationsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Verificando mensajes...</span>
            </div>
          ) : (
            companiesWithChatStatus.map((interest) => (
              <div key={interest.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={interest.company.logoUrl} />
                    <AvatarFallback>
                      <Building2 className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{interest.company.name}</p>
                      {interest.hasMessages && (
                        <Badge variant="secondary" className="text-xs">
                          <MessageCircle className="h-3 w-3 mr-1" />
                          Ha contactado
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Interesado el {new Date(interest.interestedAt).toLocaleDateString()}
                    </p>
                    {interest.lastMessage && (
                      <p className="text-xs text-muted-foreground truncate max-w-xs">
                        Último mensaje: {interest.lastMessage.content}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {interest.status}
                  </Badge>
                  {interest.hasMessages ? (
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => onOpenChat(interest.company.id)}
                      className="relative"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Chat
                      {interest.unreadCount > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                          {interest.unreadCount}
                        </Badge>
                      )}
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled
                      className="opacity-50"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Sin mensajes
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
