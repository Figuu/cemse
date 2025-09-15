"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, MessageCircle, Send, User, Building2 } from "lucide-react";
import { useJobById } from "@/hooks/useJobs";
import { useSession } from "next-auth/react";
import { useMessages } from "@/hooks/useMessages";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export default function JobChatPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const jobId = params.id as string;
  const [message, setMessage] = useState("");

  const { data: job, isLoading: jobLoading } = useJobById(jobId);
  const { data: messagesData, isLoading: messagesLoading } = useMessages({
    contextType: "JOB_APPLICATION",
    contextId: jobId,
  });

  const messages = messagesData?.messages || [];

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !job?.company?.id) return;

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: message,
          recipientId: job.company.id, // This should be the company owner's user ID
          contextType: "JOB_APPLICATION",
          contextId: jobId,
        }),
      });

      if (response.ok) {
        setMessage("");
        // Messages will be refetched automatically due to React Query
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (jobLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-pulse space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 bg-muted rounded"></div>
            <div className="h-8 w-32 bg-muted rounded"></div>
          </div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Trabajo no encontrado</h3>
          <p className="text-muted-foreground mb-4">
            El trabajo que buscas no existe o no está disponible
          </p>
          <Link href="/jobs">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Trabajos
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!job.isApplied) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aplicación requerida</h3>
          <p className="text-muted-foreground mb-4">
            Necesitas aplicar a este trabajo antes de poder chatear con la empresa
          </p>
          <div className="flex gap-2 justify-center">
            <Link href={`/jobs/${jobId}/apply`}>
              <Button>
                Aplicar Ahora
              </Button>
            </Link>
            <Link href={`/jobs/${jobId}`}>
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/jobs/${jobId}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageCircle className="h-8 w-8 text-primary" />
            Chat con {job.company?.name}
          </h1>
          <p className="text-muted-foreground">
            Conversación sobre tu aplicación para {job.title}
          </p>
        </div>
      </div>

      {/* Chat Messages */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {job.company?.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 overflow-y-auto space-y-4 mb-4">
            {messagesLoading ? (
              <div className="text-center text-muted-foreground">
                Cargando mensajes...
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No hay mensajes aún. ¡Inicia la conversación!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderId === session?.user?.id ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.senderId === session?.user?.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {(msg.sender.firstName || "") + " " + (msg.sender.lastName || "")}
                      </span>
                    </div>
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {formatDistanceToNow(new Date(msg.createdAt), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe tu mensaje..."
              className="flex-1"
            />
            <Button type="submit" disabled={!message.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Application Status */}
      {job.application && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Estado de tu aplicación</h4>
                <p className="text-sm text-muted-foreground">
                  Aplicaste el {new Date(job.application.appliedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {job.application.status === "SENT" ? "Enviada" : job.application.status}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
