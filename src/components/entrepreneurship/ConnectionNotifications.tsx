"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Bell, 
  UserPlus, 
  Check, 
  X, 
  MessageCircle 
} from "lucide-react";
import { useReceivedConnections } from "@/hooks/useEntrepreneurshipConnections";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

interface ConnectionNotificationsProps {
  onOpenChat?: (recipientId: string, recipientName: string, recipientAvatar?: string, entrepreneurshipId?: string) => void;
}

export function ConnectionNotifications({ onOpenChat }: ConnectionNotificationsProps) {
  const { data: session } = useSession();
  const { connections, updateConnection, isUpdating } = useReceivedConnections();
  const [isOpen, setIsOpen] = useState(false);

  // Filter pending connections
  const pendingConnections = connections.filter(conn => conn.status === "PENDING");

  const handleAcceptConnection = async (connectionId: string) => {
    try {
      await updateConnection({ connectionId, status: "ACCEPTED" });
    } catch (error) {
      console.error("Error accepting connection:", error);
    }
  };

  const handleDeclineConnection = async (connectionId: string) => {
    try {
      await updateConnection({ connectionId, status: "DECLINED" });
    } catch (error) {
      console.error("Error declining connection:", error);
    }
  };

  const handleChatWithConnection = (connection: any) => {
    if (onOpenChat) {
      onOpenChat(
        connection.requester.id,
        connection.requester.name,
        connection.requester.image,
        undefined // No specific entrepreneurship context for general connections
      );
    }
    setIsOpen(false);
  };

  if (!session?.user?.id) return null;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {pendingConnections.length > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {pendingConnections.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="px-2 py-1.5">
          <h4 className="font-medium">Solicitudes de Conexión</h4>
          <p className="text-sm text-muted-foreground">
            {pendingConnections.length} solicitudes pendientes
          </p>
        </div>
        
        {pendingConnections.length === 0 ? (
          <div className="px-2 py-4 text-center">
            <p className="text-sm text-muted-foreground">
              No tienes solicitudes pendientes
            </p>
          </div>
        ) : (
          <>
            <DropdownMenuSeparator />
            <div className="max-h-64 overflow-y-auto">
              {pendingConnections.map((connection) => (
                <div key={connection.id} className="px-2 py-2">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={connection.requester.image} />
                      <AvatarFallback>
                        {connection.requester.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {connection.requester.name}
                      </p>
                      {connection.message && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {connection.message}
                        </p>
                      )}
                      <div className="flex items-center gap-1 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAcceptConnection(connection.id)}
                          disabled={isUpdating}
                          className="h-6 px-2 text-xs"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Aceptar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeclineConnection(connection.id)}
                          disabled={isUpdating}
                          className="h-6 px-2 text-xs"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Rechazar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleChatWithConnection(connection)}
                          className="h-6 px-2 text-xs"
                        >
                          <MessageCircle className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}




