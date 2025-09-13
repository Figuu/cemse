"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  UserPlus, 
  Check, 
  X, 
  MessageCircle, 
  MoreHorizontal,
  UserCheck,
  Clock,
  UserX
} from "lucide-react";
import { User, ConnectionStatus } from "@/hooks/useEntrepreneurshipConnections";
import { useEntrepreneurshipConnections } from "@/hooks/useEntrepreneurshipConnections";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface UserCardProps {
  user: User;
  currentUserId?: string;
  onConnect?: (userId: string) => void;
  onViewProfile?: (user: User) => void;
  onMessage?: (user: User) => void;
  variant?: "default" | "compact" | "detailed";
}

const connectionStatusIcons: Record<ConnectionStatus, any> = {
  PENDING: Clock,
  ACCEPTED: UserCheck,
  DECLINED: UserX,
  BLOCKED: UserX,
};

const connectionStatusLabels: Record<ConnectionStatus, string> = {
  PENDING: "Pendiente",
  ACCEPTED: "Conectado",
  DECLINED: "Rechazado",
  BLOCKED: "Bloqueado",
};

const connectionStatusColors: Record<ConnectionStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  ACCEPTED: "bg-green-100 text-green-800",
  DECLINED: "bg-red-100 text-red-800",
  BLOCKED: "bg-gray-100 text-gray-800",
};

export function UserCard({ 
  user, 
  currentUserId,
  onConnect, 
  onViewProfile,
  onMessage,
  variant = "default" 
}: UserCardProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const { createConnection, updateConnection, deleteConnection } = useEntrepreneurshipConnections();

  const handleConnect = async () => {
    if (!currentUserId) return;
    
    setIsConnecting(true);
    try {
      await createConnection({ addresseeId: user.id });
      if (onConnect) {
        onConnect(user.id);
      }
    } catch (error) {
      console.error("Error connecting:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleAcceptConnection = async () => {
    if (!user.connectionStatus) return;
    
    try {
      await updateConnection({ 
        connectionId: user.connectionStatus.id, 
        status: "ACCEPTED" 
      });
    } catch (error) {
      console.error("Error accepting connection:", error);
    }
  };

  const handleDeclineConnection = async () => {
    if (!user.connectionStatus) return;
    
    try {
      await updateConnection({ 
        connectionId: user.connectionStatus.id, 
        status: "DECLINED" 
      });
    } catch (error) {
      console.error("Error declining connection:", error);
    }
  };

  const handleDeleteConnection = async () => {
    if (!user.connectionStatus) return;
    
    try {
      await deleteConnection(user.connectionStatus.id);
    } catch (error) {
      console.error("Error deleting connection:", error);
    }
  };

  const getConnectionButton = () => {
    if (!user.connectionStatus) {
      return (
        <Button
          onClick={handleConnect}
          disabled={isConnecting}
          size="sm"
          className="flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          {isConnecting ? "Conectando..." : "Conectar"}
        </Button>
      );
    }

    const { status, isRequester } = user.connectionStatus;
    const IconComponent = connectionStatusIcons[status];

    if (status === "PENDING") {
      if (isRequester) {
        return (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Enviado
            </Badge>
            <Button
              onClick={handleDeleteConnection}
              variant="outline"
              size="sm"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        );
      } else {
        return (
          <div className="flex items-center gap-2">
            <Button
              onClick={handleAcceptConnection}
              size="sm"
              className="flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              Aceptar
            </Button>
            <Button
              onClick={handleDeclineConnection}
              variant="outline"
              size="sm"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        );
      }
    }

    if (status === "ACCEPTED") {
      return (
        <div className="flex items-center gap-2">
          <Badge className={`flex items-center gap-1 ${connectionStatusColors[status]}`}>
            <IconComponent className="h-3 w-3" />
            {connectionStatusLabels[status]}
          </Badge>
          {onMessage && (
            <Button
              onClick={() => onMessage(user)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Mensaje
            </Button>
          )}
        </div>
      );
    }

    return (
      <Badge className={`flex items-center gap-1 ${connectionStatusColors[status]}`}>
        <IconComponent className="h-3 w-3" />
        {connectionStatusLabels[status]}
      </Badge>
    );
  };

  if (variant === "compact") {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.image} />
              <AvatarFallback>
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{user.name}</h3>
              <p className="text-xs text-muted-foreground">
                {user._count.entrepreneurshipPosts} publicaciones
              </p>
            </div>
            <div className="flex-shrink-0">
              {getConnectionButton()}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === "detailed") {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.image} />
                <AvatarFallback>
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <p className="text-xs text-muted-foreground">
                  Se unió {formatDistanceToNow(new Date(user.createdAt), { 
                    addSuffix: true, 
                    locale: es 
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getConnectionButton()}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewProfile?.(user)}
                className="h-8 w-8 p-0"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
                <span>{user._count.entrepreneurshipPosts} publicaciones</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.image} />
            <AvatarFallback>
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{user.name}</h3>
            <p className="text-xs text-muted-foreground">
              {user._count.entrepreneurshipPosts} publicaciones
            </p>
            <p className="text-xs text-muted-foreground">
              Se unió {formatDistanceToNow(new Date(user.createdAt), { 
                addSuffix: true, 
                locale: es 
              })}
            </p>
          </div>
          <div className="flex-shrink-0">
            {getConnectionButton()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
