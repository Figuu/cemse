"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Check, 
  X, 
  MessageCircle, 
  MoreHorizontal,
  UserCheck,
  Clock,
  UserX,
  Trash2
} from "lucide-react";
import { EntrepreneurshipConnection, ConnectionStatus } from "@/hooks/useEntrepreneurshipConnections";
import { useEntrepreneurshipConnections } from "@/hooks/useEntrepreneurshipConnections";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface ConnectionCardProps {
  connection: EntrepreneurshipConnection;
  currentUserId?: string;
  onMessage?: (connection: EntrepreneurshipConnection) => void;
  onViewProfile?: (userId: string) => void;
  onDelete?: (connectionId: string) => void;
  variant?: "default" | "compact";
}

const connectionStatusIcons: Record<ConnectionStatus, React.ComponentType<{ className?: string }>> = {
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

export function ConnectionCard({ 
  connection, 
  currentUserId,
  onMessage,
  onViewProfile,
  onDelete,
  variant = "default" 
}: ConnectionCardProps) {
  const { updateConnection, deleteConnection } = useEntrepreneurshipConnections();

  const isRequester = connection.requesterId === currentUserId;
  const otherUser = isRequester ? connection.addressee : connection.requester;
  const IconComponent = connectionStatusIcons[connection.status];

  const handleAcceptConnection = async () => {
    try {
      await updateConnection({ 
        connectionId: connection.id, 
        status: "ACCEPTED" 
      });
    } catch (error) {
      console.error("Error accepting connection:", error);
    }
  };

  const handleDeclineConnection = async () => {
    try {
      await updateConnection({ 
        connectionId: connection.id, 
        status: "DECLINED" 
      });
    } catch (error) {
      console.error("Error declining connection:", error);
    }
  };

  const handleDeleteConnection = async () => {
    if (confirm("¿Estás seguro de que quieres eliminar esta conexión?")) {
      try {
        await deleteConnection(connection.id);
        if (onDelete) {
          onDelete(connection.id);
        }
      } catch (error) {
        console.error("Error deleting connection:", error);
      }
    }
  };

  const getConnectionActions = () => {
    if (connection.status === "PENDING") {
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
              <Trash2 className="h-4 w-4" />
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

    if (connection.status === "ACCEPTED") {
      return (
        <div className="flex items-center gap-2">
          <Badge className={`flex items-center gap-1 ${connectionStatusColors[connection.status]}`}>
            <IconComponent className="h-3 w-3" />
            {connectionStatusLabels[connection.status]}
          </Badge>
          {onMessage && (
            <Button
              onClick={() => onMessage(connection)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Mensaje
            </Button>
          )}
          <Button
            onClick={handleDeleteConnection}
            variant="outline"
            size="sm"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <Badge className={`flex items-center gap-1 ${connectionStatusColors[connection.status]}`}>
          <IconComponent className="h-3 w-3" />
          {connectionStatusLabels[connection.status]}
        </Badge>
        <Button
          onClick={handleDeleteConnection}
          variant="outline"
          size="sm"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  if (variant === "compact") {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={otherUser.image} />
              <AvatarFallback>
                {otherUser.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{otherUser.name}</h3>
              <p className="text-xs text-muted-foreground">
                {isRequester ? "Solicitud enviada" : "Solicitud recibida"}
              </p>
              {connection.message && (
                <p className="text-xs text-muted-foreground truncate">
                  &ldquo;{connection.message}&rdquo;
                </p>
              )}
            </div>
            <div className="flex-shrink-0">
              {getConnectionActions()}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={otherUser.image} />
              <AvatarFallback>
                {otherUser.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{otherUser.name}</h3>
              <p className="text-sm text-muted-foreground">{otherUser.email}</p>
              <p className="text-xs text-muted-foreground">
                {isRequester ? "Solicitud enviada" : "Solicitud recibida"} •{" "}
                {formatDistanceToNow(new Date(connection.requestedAt), { 
                  addSuffix: true, 
                  locale: es 
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getConnectionActions()}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewProfile?.(otherUser.id)}
              className="h-8 w-8 p-0"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {connection.message && (
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">
              &ldquo;{connection.message}&rdquo;
            </p>
          </div>
        )}
        {connection.acceptedAt && (
          <p className="text-xs text-muted-foreground mt-2">
            Aceptado {formatDistanceToNow(new Date(connection.acceptedAt), { 
              addSuffix: true, 
              locale: es 
            })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
