"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MapPin, 
  Calendar, 
  Users, 
  Eye,
  Star,
  ExternalLink,
  UserPlus,
  MessageCircle
} from "lucide-react";
import { useEntrepreneurships, EntrepreneurshipsFilters } from "@/hooks/useEntrepreneurships";
import { useEntrepreneurshipConnections } from "@/hooks/useEntrepreneurshipConnections";
import { useSession } from "next-auth/react";
import { BusinessStage } from "@prisma/client";
import { EntrepreneurshipDetailsModal } from "./EntrepreneurshipDetailsModal";
import { ConnectionRequestModal } from "./ConnectionRequestModal";
import { ConnectionActions } from "./ConnectionActions";
import { ChatSidebar } from "./ChatSidebar";

interface EntrepreneurshipGridProps {
  filters: EntrepreneurshipsFilters;
}

const businessStageLabels: Record<BusinessStage, string> = {
  IDEA: "Idea",
  STARTUP: "Startup",
  GROWING: "Crecimiento",
  ESTABLISHED: "Establecido",
};

const businessStageColors: Record<BusinessStage, string> = {
  IDEA: "bg-blue-100 text-blue-800",
  STARTUP: "bg-green-100 text-green-800",
  GROWING: "bg-yellow-100 text-yellow-800",
  ESTABLISHED: "bg-purple-100 text-purple-800",
};

export function EntrepreneurshipGrid({ filters }: EntrepreneurshipGridProps) {
  const { data: session } = useSession();
  const { entrepreneurships, isLoading, error } = useEntrepreneurships(filters);
  const { connections } = useEntrepreneurshipConnections();
  const [selectedEntrepreneurshipId, setSelectedEntrepreneurshipId] = useState<string | null>(null);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  } | null>(null);
  const [selectedEntrepreneurshipName, setSelectedEntrepreneurshipName] = useState<string>("");

  // Helper function to get connection status
  const getConnectionStatus = (ownerUserId: string) => {
    if (!session?.user?.id || ownerUserId === session.user.id) return null;
    
    return connections.find(conn => 
      (conn.requesterId === session.user.id || conn.addresseeId === session.user.id) &&
      (conn.requesterId === ownerUserId || conn.addresseeId === ownerUserId)
    );
  };

  // Helper function to handle connection request
  const handleConnectionRequest = (entrepreneurship: any) => {
    setSelectedUser({
      id: entrepreneurship.owner.userId, // Use userId instead of profile id
      firstName: entrepreneurship.owner.firstName,
      lastName: entrepreneurship.owner.lastName,
      avatarUrl: entrepreneurship.owner.avatarUrl
    });
    setSelectedEntrepreneurshipName(entrepreneurship.name);
    setShowConnectionModal(true);
  };

  // Helper function to handle chat - now handled by the main chat sidebar
  const handleChat = (entrepreneurship: any) => {
    // Chat functionality is now handled by the main chat sidebar
    // This function can be used for future enhancements if needed
  };


  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Error al cargar los emprendimientos</p>
      </div>
    );
  }

  if (entrepreneurships.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No se encontraron emprendimientos</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {entrepreneurships.map((entrepreneurship) => (
        <Card key={entrepreneurship.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={entrepreneurship.logo} />
                  <AvatarFallback>
                    {entrepreneurship.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg line-clamp-1">
                    {entrepreneurship.name}
                  </CardTitle>
                  <CardDescription className="flex items-center text-sm">
                    <span>{entrepreneurship.owner.firstName} {entrepreneurship.owner.lastName}</span>
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {entrepreneurship.description}
            </p>

            <div className="flex items-center justify-between">
              <Badge 
                variant="secondary" 
                className={businessStageColors[entrepreneurship.businessStage]}
              >
                {businessStageLabels[entrepreneurship.businessStage]}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {entrepreneurship.category}
              </span>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{entrepreneurship.municipality}, {entrepreneurship.department}</span>
              </div>
              
              {entrepreneurship.founded && (
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Fundado en {new Date(entrepreneurship.founded).getFullYear()}</span>
                </div>
              )}

              {entrepreneurship.employees && (
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{entrepreneurship.employees} empleados</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  <span>{entrepreneurship.viewsCount}</span>
                </div>
                {entrepreneurship.rating && Number(entrepreneurship.rating) > 0 && (
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1 fill-current text-yellow-400" />
                    <span>{Number(entrepreneurship.rating).toFixed(1)}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {entrepreneurship.website && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={entrepreneurship.website} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                <Button size="sm" onClick={() => setSelectedEntrepreneurshipId(entrepreneurship.id)}>
                  Ver Detalles
                </Button>
              </div>
            </div>

            {/* Connection Actions */}
            {session?.user?.id && (
              <div className="pt-3 border-t">
                <ConnectionActions
                  connectionStatus={getConnectionStatus(entrepreneurship.owner.userId)?.status || null}
                  isOwnEntrepreneurship={session.user.id === entrepreneurship.owner.userId}
                  onConnect={() => handleConnectionRequest(entrepreneurship)}
                  onChat={() => handleChat(entrepreneurship)}
                />
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {selectedEntrepreneurshipId && (
        <EntrepreneurshipDetailsModal
          entrepreneurshipId={selectedEntrepreneurshipId}
          isOpen={!!selectedEntrepreneurshipId}
          onClose={() => setSelectedEntrepreneurshipId(null)}
        />
      )}

      {showConnectionModal && selectedUser && (
        <ConnectionRequestModal
          isOpen={showConnectionModal}
          onClose={() => {
            setShowConnectionModal(false);
            setSelectedUser(null);
            setSelectedEntrepreneurshipName("");
          }}
          targetUser={selectedUser}
          entrepreneurshipName={selectedEntrepreneurshipName}
        />
      )}
    </div>
  );
}