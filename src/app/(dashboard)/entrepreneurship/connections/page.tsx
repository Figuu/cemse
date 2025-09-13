"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Plus, 
  Users, 
  UserPlus, 
  UserCheck,
  Clock,
  ArrowLeft,
  MessageCircle,
  UserX
} from "lucide-react";
import { UserCard } from "@/components/entrepreneurship/UserCard";
import { ConnectionCard } from "@/components/entrepreneurship/ConnectionCard";
import { 
  useEntrepreneurshipConnections,
  useEntrepreneurshipUsers,
  useSentConnections,
  useReceivedConnections,
  useAcceptedConnections,
  usePendingConnections,
  useAvailableUsers
} from "@/hooks/useEntrepreneurshipConnections";
import Link from "next/link";

export default function EntrepreneurshipConnectionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Mock current user - in real app, this would come from auth context
  const currentUserId = "user-1";

  // Fetch different types of connections
  const { connections: allConnections, isLoading: allLoading } = useEntrepreneurshipConnections();
  const { connections: sentConnections, isLoading: sentLoading } = useSentConnections();
  const { connections: receivedConnections, isLoading: receivedLoading } = useReceivedConnections();
  const { connections: acceptedConnections, isLoading: acceptedLoading } = useAcceptedConnections();
  const { connections: pendingConnections, isLoading: pendingLoading } = usePendingConnections();
  const { users: availableUsers, isLoading: usersLoading } = useAvailableUsers();

  const handleConnect = (userId: string) => {
    console.log("Connecting to user:", userId);
  };

  const handleViewProfile = (user: any) => {
    console.log("Viewing profile:", user.id);
  };

  const handleMessage = (connection: any) => {
    console.log("Messaging connection:", connection.id);
  };

  const handleDeleteConnection = (connectionId: string) => {
    console.log("Deleting connection:", connectionId);
  };

  const getConnectionsForTab = () => {
    switch (activeTab) {
      case "sent":
        return sentConnections;
      case "received":
        return receivedConnections;
      case "accepted":
        return acceptedConnections;
      case "pending":
        return pendingConnections;
      case "users":
        return availableUsers;
      default:
        return allConnections;
    }
  };

  const getLoadingForTab = () => {
    switch (activeTab) {
      case "sent":
        return sentLoading;
      case "received":
        return receivedLoading;
      case "accepted":
        return acceptedLoading;
      case "pending":
        return pendingLoading;
      case "users":
        return usersLoading;
      default:
        return allLoading;
    }
  };

  const getEmptyMessage = () => {
    switch (activeTab) {
      case "sent":
        return "No has enviado solicitudes de conexión";
      case "received":
        return "No tienes solicitudes de conexión pendientes";
      case "accepted":
        return "No tienes conexiones aceptadas";
      case "pending":
        return "No hay conexiones pendientes";
      case "users":
        return "No hay usuarios disponibles para conectar";
      default:
        return "No hay conexiones";
    }
  };

  const getEmptyAction = () => {
    if (activeTab === "users") {
      return (
        <Button onClick={() => setSearchTerm("")}>
          <Search className="h-4 w-4 mr-2" />
          Buscar Usuarios
        </Button>
      );
    }
    return null;
  };

  const connections = getConnectionsForTab();
  const isLoading = getLoadingForTab();

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/entrepreneurship">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Conexiones
          </h1>
          <p className="text-muted-foreground">
            Conecta con otros jóvenes emprendedores y construye tu red profesional
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <UserCheck className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Conectados</span>
            </div>
            <p className="text-2xl font-bold">{acceptedConnections.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium">Pendientes</span>
            </div>
            <p className="text-2xl font-bold">{pendingConnections.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <UserPlus className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Enviadas</span>
            </div>
            <p className="text-2xl font-bold">{sentConnections.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Disponibles</span>
            </div>
            <p className="text-2xl font-bold">{availableUsers.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar usuarios o conexiones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="accepted">Conectados</TabsTrigger>
          <TabsTrigger value="pending">Pendientes</TabsTrigger>
          <TabsTrigger value="sent">Enviadas</TabsTrigger>
          <TabsTrigger value="received">Recibidas</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-muted rounded-full"></div>
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-muted rounded w-32"></div>
                          <div className="h-3 bg-muted rounded w-24"></div>
                        </div>
                        <div className="h-8 bg-muted rounded w-20"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : connections.length > 0 ? (
              connections.map((connection) => (
                <ConnectionCard
                  key={connection.id}
                  connection={connection}
                  currentUserId={currentUserId}
                  onMessage={handleMessage}
                  onViewProfile={handleViewProfile}
                  onDelete={handleDeleteConnection}
                />
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay conexiones</h3>
                  <p className="text-muted-foreground mb-4">
                    {getEmptyMessage()}
                  </p>
                  {getEmptyAction()}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="accepted" className="space-y-4">
          <div className="space-y-4">
            {acceptedLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-muted rounded-full"></div>
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-muted rounded w-32"></div>
                          <div className="h-3 bg-muted rounded w-24"></div>
                        </div>
                        <div className="h-8 bg-muted rounded w-20"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : acceptedConnections.length > 0 ? (
              acceptedConnections.map((connection) => (
                <ConnectionCard
                  key={connection.id}
                  connection={connection}
                  currentUserId={currentUserId}
                  onMessage={handleMessage}
                  onViewProfile={handleViewProfile}
                  onDelete={handleDeleteConnection}
                />
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay conexiones aceptadas</h3>
                  <p className="text-muted-foreground mb-4">
                    Acepta solicitudes de conexión para verlas aquí
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <div className="space-y-4">
            {pendingLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-muted rounded-full"></div>
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-muted rounded w-32"></div>
                          <div className="h-3 bg-muted rounded w-24"></div>
                        </div>
                        <div className="h-8 bg-muted rounded w-20"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : pendingConnections.length > 0 ? (
              pendingConnections.map((connection) => (
                <ConnectionCard
                  key={connection.id}
                  connection={connection}
                  currentUserId={currentUserId}
                  onMessage={handleMessage}
                  onViewProfile={handleViewProfile}
                  onDelete={handleDeleteConnection}
                />
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay conexiones pendientes</h3>
                  <p className="text-muted-foreground mb-4">
                    Las solicitudes de conexión que envíes aparecerán aquí
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          <div className="space-y-4">
            {sentLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-muted rounded-full"></div>
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-muted rounded w-32"></div>
                          <div className="h-3 bg-muted rounded w-24"></div>
                        </div>
                        <div className="h-8 bg-muted rounded w-20"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : sentConnections.length > 0 ? (
              sentConnections.map((connection) => (
                <ConnectionCard
                  key={connection.id}
                  connection={connection}
                  currentUserId={currentUserId}
                  onMessage={handleMessage}
                  onViewProfile={handleViewProfile}
                  onDelete={handleDeleteConnection}
                />
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No has enviado solicitudes</h3>
                  <p className="text-muted-foreground mb-4">
                    Las solicitudes que envíes aparecerán aquí
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="received" className="space-y-4">
          <div className="space-y-4">
            {receivedLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-muted rounded-full"></div>
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-muted rounded w-32"></div>
                          <div className="h-3 bg-muted rounded w-24"></div>
                        </div>
                        <div className="h-8 bg-muted rounded w-20"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : receivedConnections.length > 0 ? (
              receivedConnections.map((connection) => (
                <ConnectionCard
                  key={connection.id}
                  connection={connection}
                  currentUserId={currentUserId}
                  onMessage={handleMessage}
                  onViewProfile={handleViewProfile}
                  onDelete={handleDeleteConnection}
                />
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No tienes solicitudes recibidas</h3>
                  <p className="text-muted-foreground mb-4">
                    Las solicitudes que recibas aparecerán aquí
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="space-y-4">
            {usersLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-muted rounded-full"></div>
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-muted rounded w-32"></div>
                          <div className="h-3 bg-muted rounded w-24"></div>
                        </div>
                        <div className="h-8 bg-muted rounded w-20"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : availableUsers.length > 0 ? (
              availableUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  currentUserId={currentUserId}
                  onConnect={handleConnect}
                  onViewProfile={handleViewProfile}
                  onMessage={handleMessage}
                />
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay usuarios disponibles</h3>
                  <p className="text-muted-foreground mb-4">
                    Todos los usuarios ya están conectados contigo
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
