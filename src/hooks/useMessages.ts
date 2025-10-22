import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  messageType: string;
  contextType: "JOB_APPLICATION" | "YOUTH_APPLICATION" | "ENTREPRENEURSHIP" | "GENERAL";
  contextId?: string;
  createdAt: string;
  readAt?: string;
  isRead: boolean;
  sender: {
    userId: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    role?: string;
  };
  recipient: {
    userId: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    role?: string;
  };
}

export interface SendMessageData {
  recipientId: string;
  content: string;
  contextType: "JOB_APPLICATION" | "YOUTH_APPLICATION" | "ENTREPRENEURSHIP" | "GENERAL";
  contextId?: string;
}

export interface Conversation {
  id: string;
  otherUser: {
    id: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    name: string;
    role: string;
    avatar: string;
  };
  lastMessage?: {
    content: string;
    createdAt: string;
    readAt?: string;
    isRead: boolean;
  };
  unreadCount: number;
  contextId?: string;
  contextType?: string;
}

export function useMessages({
  recipientId,
  contextType,
  contextId,
  enabled = true,
}: {
  recipientId?: string;
  contextType?: string;
  contextId?: string;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ["messages", recipientId, contextType, contextId],
    queryFn: async (): Promise<{ messages: Message[]; pagination: any }> => {
      const params = new URLSearchParams();
      if (recipientId) params.append("recipientId", recipientId);
      if (contextType) params.append("contextType", contextType);
      if (contextId) params.append("contextId", contextId);

      console.log("useMessages - Fetching messages with params:", { recipientId, contextType, contextId });
      const url = `/api/messages?${params.toString()}`;
      console.log("useMessages - Fetching from URL:", url);

      const response = await fetch(url);
      console.log("useMessages - Response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("useMessages - Error response:", response.status, errorText);
        throw new Error(`Failed to fetch messages: ${response.status} ${errorText}`);
      }
      const data = await response.json();
      console.log("useMessages - Received data:", data);
      console.log("useMessages - Messages count:", data.messages?.length || 0);
      return data;
    },
    enabled: enabled && (!!recipientId || !!contextType),
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SendMessageData): Promise<Message> => {
      console.log("useSendMessage - Sending message:", data);
      
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      console.log("useSendMessage - Response status:", response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error("useSendMessage - Error response:", response.status, error);
        throw new Error(error.error || "Failed to send message");
      }

      const result = await response.json();
      console.log("useSendMessage - Message sent successfully:", result);
      return result;
    },
    onSuccess: (newMessage, variables) => {
      // Invalidate and refetch messages for this conversation
      queryClient.invalidateQueries({
        queryKey: ["messages", variables.recipientId, variables.contextType, variables.contextId],
      });
    },
  });
}

export function useConversations({
  contextType,
  contextId,
}: {
  contextType?: string;
  contextId?: string;
} = {}) {
  return useQuery({
    queryKey: ["conversations", contextType, contextId],
    queryFn: async (): Promise<{ conversations: Conversation[] }> => {
      const params = new URLSearchParams();
      if (contextType) params.append("contextType", contextType);
      if (contextId) params.append("contextId", contextId);
      
      const response = await fetch(`/api/messages/conversations?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch conversations");
      }
      const data = await response.json();
      return data;
    },
    refetchInterval: 10000, // Refetch every 10 seconds
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId: string): Promise<void> => {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isRead: true }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to mark message as read");
      }
    },
    onSuccess: () => {
      // Invalidate messages queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}