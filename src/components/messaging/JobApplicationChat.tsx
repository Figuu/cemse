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
  FileText,
  ExternalLink
} from "lucide-react";
import { MessageInterface } from "./MessageInterface";
import { useMessages } from "@/hooks/useMessages";

interface JobApplicationChatProps {
  applicationId: string;
  jobTitle: string;
  companyName: string;
  candidateName: string;
  companyId: string;
  candidateId: string;
  className?: string;
}

export function JobApplicationChat({
  applicationId,
  jobTitle,
  companyName,
  candidateName,
  className
}: JobApplicationChatProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get recent messages for this job application
  const { data: messagesData } = useMessages({
    contextType: 'JOB_APPLICATION',
    contextId: applicationId,
  });

  const messages = messagesData?.messages || [];
  const recentMessage = messages[0]; // Most recent message

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <div>
              <CardTitle className="text-lg">Chat de Solicitud</CardTitle>
              <CardDescription>
                Comunicación sobre {jobTitle} en {companyName}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              Solicitud de Trabajo
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
        <div className="bg-gray-50 rounded-lg p-3 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Empresa:</span>
              <span>{companyName}</span>
            </div>
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Candidato:</span>
              <span>{candidateName}</span>
            </div>
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Puesto:</span>
              <span>{jobTitle}</span>
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
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">
                Último mensaje
              </span>
              <span className="text-xs text-blue-700">
                {new Date(recentMessage.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-blue-800 line-clamp-2">
              {recentMessage.content}
            </p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-blue-700">
                De: {recentMessage.sender.name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(true)}
                className="text-blue-600 hover:text-blue-800"
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
            contextType="JOB_APPLICATION"
            contextId={applicationId}
            className="h-[500px]"
          />
        </CardContent>
      )}
    </Card>
  );
}
