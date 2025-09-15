"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  Building2, 
  User, 
  Calendar,
  ExternalLink,
  Target
} from "lucide-react";
import { MessageInterface } from "./MessageInterface";
import { useMessages } from "@/hooks/useMessages";

interface YouthApplicationChatProps {
  applicationId: string;
  youthName: string;
  companyName: string;
  companyId: string;
  youthId: string;
  className?: string;
}

export function YouthApplicationChat({
  applicationId,
  youthName,
  companyName,
  companyId,
  youthId,
  className
}: YouthApplicationChatProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get recent messages for this youth application
  const { data: messagesData } = useMessages({
    recipientId: youthId,
    contextType: 'YOUTH_APPLICATION',
    contextId: applicationId,
  });

  const messages = messagesData?.messages || [];
  const recentMessage = messages[0]; // Most recent message

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MessageSquare className="h-5 w-5 text-green-600" />
            <div>
              <CardTitle className="text-lg">Chat de Solicitud Abierta</CardTitle>
              <CardDescription>
                Comunicación sobre la solicitud abierta de {youthName}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
              Solicitud Abierta
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Contraer" : "Expandir"}
            </Button>
          </div>
        </div>

        {/* Application Context */}
        <div className="bg-green-50 rounded-lg p-3 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Empresa:</span>
              <span>{companyName}</span>
            </div>
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Joven:</span>
              <span>{youthName}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Tipo:</span>
              <span>Solicitud Abierta</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">ID Solicitud:</span>
              <span className="font-mono text-xs">{applicationId}</span>
            </div>
          </div>
        </div>

        {/* Recent Message Preview */}
        {recentMessage && !isExpanded && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-900">
                Último mensaje
              </span>
              <span className="text-xs text-green-700">
                {new Date(recentMessage.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-green-800 line-clamp-2">
              {recentMessage.content}
            </p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-green-700">
                De: {recentMessage.sender.name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(true)}
                className="text-green-600 hover:text-green-800"
              >
                Ver conversación
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardHeader>

      {isExpanded && (
        <CardContent>
          <MessageInterface
            recipientId={youthId}
            contextType="YOUTH_APPLICATION"
            contextId={applicationId}
            className="h-[500px]"
          />
        </CardContent>
      )}
    </Card>
  );
}
