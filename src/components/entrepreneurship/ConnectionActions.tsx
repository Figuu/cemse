"use client";

import { Button } from "@/components/ui/button";
import { UserPlus, MessageCircle } from "lucide-react";
import { EntrepreneurshipConnectionStatus } from "@prisma/client";

interface ConnectionActionsProps {
  connectionStatus: EntrepreneurshipConnectionStatus | null;
  isOwnEntrepreneurship: boolean;
  onConnect: () => void;
  onChat: () => void;
  className?: string;
}

export function ConnectionActions({
  connectionStatus,
  isOwnEntrepreneurship,
  onConnect,
  onChat,
  className = "",
}: ConnectionActionsProps) {
  if (isOwnEntrepreneurship) return null;

  const getButtonInfo = () => {
    if (!connectionStatus) {
      return { showConnect: true, showChat: false, connectText: "Conectar" };
    }

    switch (connectionStatus) {
      case "PENDING":
        return { showConnect: false, showChat: false, connectText: "Solicitud Enviada" };
      case "ACCEPTED":
        return { showConnect: false, showChat: true, connectText: "Conectado" };
      case "DECLINED":
        return { showConnect: true, showChat: false, connectText: "Conectar" };
      default:
        return { showConnect: true, showChat: false, connectText: "Conectar" };
    }
  };

  const { showConnect, showChat, connectText } = getButtonInfo();

  return (
    <div className={`flex items-center space-x-2 w-full ${className}`}>
      {showConnect && (
        <Button
          variant="outline"
          size="sm"
          onClick={onConnect}
          className="flex-1"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          {connectText}
        </Button>
      )}
      {!showConnect && !showChat && (
        <Button
          variant="outline"
          size="sm"
          disabled
          className="flex-1"
        >
          {connectText}
        </Button>
      )}
      {showChat && (
        <Button
          variant="outline"
          size="sm"
          onClick={onChat}
          className="flex-1"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Chatear
        </Button>
      )}
    </div>
  );
}
