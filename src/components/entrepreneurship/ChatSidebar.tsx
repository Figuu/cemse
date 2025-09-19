"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Send, 
  X, 
  Minimize2,
  Loader2,
  Check,
  CheckCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useMessages, useSendMessage } from "@/hooks/useMessages";
import { useSession } from "next-auth/react";

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize: () => void;
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
  entrepreneurshipId?: string;
}

export function ChatSidebar({
  isOpen,
  onClose,
  onMinimize,
  recipientId,
  recipientName,
  recipientAvatar,
  entrepreneurshipId,
}: ChatSidebarProps) {
  const { data: session } = useSession();
  const [message, setMessage] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get messages for this conversation
  const { 
    data: messages = [], 
    isLoading: messagesLoading,
    refetch: refetchMessages 
  } = useMessages({
    recipientId,
    contextType: "ENTREPRENEURSHIP",
    contextId: entrepreneurshipId,
  });

  // Send message mutation
  const sendMessageMutation = useSendMessage();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || sendMessageMutation.isPending) {
      return;
    }

    const messageText = message.trim();
    setMessage("");

    try {
      await sendMessageMutation.mutateAsync({
        recipientId,
        content: messageText,
        contextType: "ENTREPRENEURSHIP",
        contextId: entrepreneurshipId,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      // Restore message if sending failed
      setMessage(messageText);
    }
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
    onMinimize();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isOwnMessage = (senderId: string) => {
    return senderId === session?.user?.id;
  };

  if (!isOpen) return null;

  return (
    <div className={cn(
      "fixed right-0 top-0 h-full bg-white border-l shadow-lg transition-all duration-300 z-50",
      isMinimized ? "w-16" : "w-96"
    )}>
      {isMinimized ? (
        // Minimized state
        <div className="h-full flex flex-col items-center justify-center space-y-4 p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMinimize}
            className="h-8 w-8 p-0"
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        // Expanded state
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-muted/50">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={recipientAvatar} />
                <AvatarFallback>
                  {getInitials(recipientName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-sm">{recipientName}</h3>
                <p className="text-xs text-muted-foreground">Emprendedor</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMinimize}
                className="h-8 w-8 p-0"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            {messagesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Inicia una conversación con {recipientName}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex gap-2",
                      isOwnMessage(msg.senderId) ? "justify-end" : "justify-start"
                    )}
                  >
                    {!isOwnMessage(msg.senderId) && (
                      <Avatar className="h-6 w-6 mt-1">
                        <AvatarImage src={recipientAvatar} />
                        <AvatarFallback className="text-xs">
                          {getInitials(recipientName)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={cn(
                      "max-w-[70%] space-y-1",
                      isOwnMessage(msg.senderId) && "flex flex-col items-end"
                    )}>
                      <div
                        className={cn(
                          "rounded-lg px-3 py-2 text-sm",
                          isOwnMessage(msg.senderId)
                            ? "bg-blue-600 text-white"
                            : "bg-muted"
                        )}
                      >
                        {msg.content}
                      </div>
                      <div className={cn(
                        "flex items-center gap-1 text-xs text-muted-foreground",
                        isOwnMessage(msg.senderId) ? "flex-row-reverse" : "flex-row"
                      )}>
                        <span>
                          {formatDistanceToNow(new Date(msg.createdAt), { 
                            addSuffix: true, 
                            locale: es 
                          })}
                        </span>
                        {isOwnMessage(msg.senderId) && (
                          <div className="flex items-center">
                            {msg.readAt ? (
                              <CheckCheck className="h-3 w-3 text-blue-600" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {isOwnMessage(msg.senderId) && (
                      <Avatar className="h-6 w-6 mt-1">
                        <AvatarImage src={session?.user?.image} />
                        <AvatarFallback className="text-xs">
                          {getInitials(session?.user?.name || "Yo")}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 border-t">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Escribe un mensaje a ${recipientName}...`}
                className="min-h-[40px] max-h-[120px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              <Button
                type="submit"
                size="sm"
                disabled={!message.trim() || sendMessageMutation.isPending}
                className="px-3"
              >
                {sendMessageMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


