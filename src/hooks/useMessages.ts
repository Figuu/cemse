import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  messageType: string;
  isRead: boolean;
  contextType: 'JOB_APPLICATION' | 'YOUTH_APPLICATION' | 'ENTREPRENEURSHIP' | 'GENERAL';
  contextId?: string;
  createdAt: string;
  updatedAt: string;
  sender: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  };
  recipient: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  };
}

export interface Conversation {
  id: string;
  otherUser: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  };
  contextType: 'JOB_APPLICATION' | 'YOUTH_APPLICATION' | 'ENTREPRENEURSHIP' | 'GENERAL';
  contextId?: string;
  lastMessage: {
    id: string;
    content: string;
    messageType: string;
    isRead: boolean;
    createdAt: string;
    sender: {
      id: string;
      name: string;
      role: string;
      avatar?: string;
    };
  };
  unreadCount: number;
  totalMessages: number;
}

interface MessagesResponse {
  success: boolean;
  messages: Message[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

interface ConversationsResponse {
  success: boolean;
  conversations: Conversation[];
}

// Hook for fetching messages
export function useMessages(params?: {
  contextType?: string;
  contextId?: string;
  recipientId?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery<MessagesResponse>({
    queryKey: ['messages', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      
      if (params?.contextType) searchParams.set('contextType', params.contextType);
      if (params?.contextId) searchParams.set('contextId', params.contextId);
      if (params?.recipientId) searchParams.set('recipientId', params.recipientId);
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());

      const response = await fetch(`/api/messages?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });
}

// Hook for fetching conversations
export function useConversations(params?: {
  contextType?: string;
  contextId?: string;
}) {
  return useQuery<ConversationsResponse>({
    queryKey: ['conversations', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      
      if (params?.contextType) searchParams.set('contextType', params.contextType);
      if (params?.contextId) searchParams.set('contextId', params.contextId);

      const response = await fetch(`/api/conversations?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });
}

// Hook for sending messages
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageData: {
      recipientId: string;
      content: string;
      messageType?: string;
      contextType?: string;
      contextId?: string;
    }) => {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch messages and conversations
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

// Hook for updating messages (mark as read, edit content)
export function useUpdateMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ messageId, updates }: { messageId: string; updates: { content?: string; isRead?: boolean } }) => {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update message');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch messages and conversations
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

// Hook for deleting messages
export function useDeleteMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId: string) => {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete message');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch messages and conversations
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

// Hook for marking messages as read
export function useMarkAsRead() {
  const updateMessage = useUpdateMessage();

  return (messageId: string) => {
    updateMessage.mutate({ messageId, updates: { isRead: true } });
  };
}

// Hook for real-time messaging (WebSocket simulation with polling)
export function useRealtimeMessages(params?: {
  contextType?: string;
  contextId?: string;
  recipientId?: string;
}) {
  const messagesQuery = useMessages(params);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Simulate WebSocket connection with polling
    const interval = setInterval(() => {
      messagesQuery.refetch();
    }, 5000); // Poll every 5 seconds

    setIsConnected(true);

    return () => {
      clearInterval(interval);
      setIsConnected(false);
    };
  }, [messagesQuery]);

  return {
    ...messagesQuery,
    isConnected,
  };
}
