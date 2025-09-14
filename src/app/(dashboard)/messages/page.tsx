"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  Building2, 
  User, 
  Target,
  Search,
  Filter
} from "lucide-react";
import { MessageInterface } from "@/components/messaging/MessageInterface";
import { useConversations } from "@/hooks/useMessages";

export default function MessagesPage() {
  const [selectedTab, setSelectedTab] = useState("all");

  // Get all conversations
  const { data: allConversationsData } = useConversations();
  
  // Get job application conversations
  const { data: jobConversationsData } = useConversations({
    contextType: 'JOB_APPLICATION'
  });
  
  // Get youth application conversations
  const { data: youthConversationsData } = useConversations({
    contextType: 'YOUTH_APPLICATION'
  });
  
  // Get entrepreneurship conversations
  const { data: entrepreneurshipConversationsData } = useConversations({
    contextType: 'ENTREPRENEURSHIP'
  });

  const allConversations = allConversationsData?.conversations || [];
  const jobConversations = jobConversationsData?.conversations || [];
  const youthConversations = youthConversationsData?.conversations || [];
  const entrepreneurshipConversations = entrepreneurshipConversationsData?.conversations || [];

  const getTotalUnreadCount = (conversations: Array<{ unreadCount: number }>) => {
    return conversations.reduce((total, conv) => total + conv.unreadCount, 0);
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mensajes</h1>
          <p className="text-muted-foreground">
            Gestiona todas tus conversaciones y comunicaciones
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Search className="h-4 w-4 mr-2" />
            Buscar
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversaciones</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allConversations.length}</div>
            <p className="text-xs text-muted-foreground">
              {getTotalUnreadCount(allConversations)} sin leer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solicitudes de Trabajo</CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobConversations.length}</div>
            <p className="text-xs text-muted-foreground">
              {getTotalUnreadCount(jobConversations)} sin leer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solicitudes Abiertas</CardTitle>
            <User className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{youthConversations.length}</div>
            <p className="text-xs text-muted-foreground">
              {getTotalUnreadCount(youthConversations)} sin leer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emprendimiento</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{entrepreneurshipConversations.length}</div>
            <p className="text-xs text-muted-foreground">
              {getTotalUnreadCount(entrepreneurshipConversations)} sin leer
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Messages Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Conversaciones</CardTitle>
          <CardDescription>
            Selecciona una conversación para comenzar a chatear
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all" className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4" />
                <span>Todas</span>
                {getTotalUnreadCount(allConversations) > 0 && (
                  <Badge variant="destructive" className="ml-1">
                    {getTotalUnreadCount(allConversations)}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="jobs" className="flex items-center space-x-2">
                <Building2 className="h-4 w-4" />
                <span>Trabajo</span>
                {getTotalUnreadCount(jobConversations) > 0 && (
                  <Badge variant="destructive" className="ml-1">
                    {getTotalUnreadCount(jobConversations)}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="youth" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Jóvenes</span>
                {getTotalUnreadCount(youthConversations) > 0 && (
                  <Badge variant="destructive" className="ml-1">
                    {getTotalUnreadCount(youthConversations)}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="entrepreneurship" className="flex items-center space-x-2">
                <Target className="h-4 w-4" />
                <span>Emprendimiento</span>
                {getTotalUnreadCount(entrepreneurshipConversations) > 0 && (
                  <Badge variant="destructive" className="ml-1">
                    {getTotalUnreadCount(entrepreneurshipConversations)}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <MessageInterface contextType="GENERAL" className="h-[600px]" />
            </TabsContent>

            <TabsContent value="jobs" className="mt-4">
              <MessageInterface contextType="JOB_APPLICATION" className="h-[600px]" />
            </TabsContent>

            <TabsContent value="youth" className="mt-4">
              <MessageInterface contextType="YOUTH_APPLICATION" className="h-[600px]" />
            </TabsContent>

            <TabsContent value="entrepreneurship" className="mt-4">
              <MessageInterface contextType="ENTREPRENEURSHIP" className="h-[600px]" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
