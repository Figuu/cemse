import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ConnectionStatus } from "@prisma/client";

export interface EntrepreneurshipConnection {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: ConnectionStatus;
  message?: string;
  requestedAt: string;
  acceptedAt?: string;
  requester: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  addressee: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  createdAt: string;
  _count: {
    entrepreneurshipPosts: number;
  };
  connectionStatus?: {
    id: string;
    status: ConnectionStatus;
    isRequester: boolean;
  } | null;
}

export interface CreateConnectionData {
  addresseeId: string;
  message?: string;
}

export interface ConnectionsFilters {
  page?: number;
  limit?: number;
  status?: ConnectionStatus;
  type?: "sent" | "received" | "all";
}

export interface UsersFilters {
  page?: number;
  limit?: number;
  search?: string;
  excludeConnected?: boolean;
}

export function useEntrepreneurshipConnections(filters: ConnectionsFilters = {}) {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["entrepreneurship-connections", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.status) params.append("status", filters.status);
      if (filters.type) params.append("type", filters.type);

      const response = await fetch(`/api/entrepreneurship/connections?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch connections");
      }
      return response.json();
    },
  });

  const createConnectionMutation = useMutation({
    mutationFn: async (data: CreateConnectionData) => {
      const response = await fetch("/api/entrepreneurship/connections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create connection");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entrepreneurship-connections"] });
      queryClient.invalidateQueries({ queryKey: ["entrepreneurship-users"] });
    },
  });

  const updateConnectionMutation = useMutation({
    mutationFn: async ({ connectionId, status }: { connectionId: string; status: ConnectionStatus }) => {
      const response = await fetch(`/api/entrepreneurship/connections/${connectionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update connection");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entrepreneurship-connections"] });
      queryClient.invalidateQueries({ queryKey: ["entrepreneurship-users"] });
    },
  });

  const deleteConnectionMutation = useMutation({
    mutationFn: async (connectionId: string) => {
      const response = await fetch(`/api/entrepreneurship/connections/${connectionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete connection");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entrepreneurship-connections"] });
      queryClient.invalidateQueries({ queryKey: ["entrepreneurship-users"] });
    },
  });

  return {
    connections: data?.connections || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
    createConnection: createConnectionMutation.mutateAsync,
    isCreating: createConnectionMutation.isPending,
    updateConnection: updateConnectionMutation.mutateAsync,
    isUpdating: updateConnectionMutation.isPending,
    deleteConnection: deleteConnectionMutation.mutateAsync,
    isDeleting: deleteConnectionMutation.isPending,
  };
}

export function useEntrepreneurshipUsers(filters: UsersFilters = {}) {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["entrepreneurship-users", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.search) params.append("search", filters.search);
      if (filters.excludeConnected) params.append("excludeConnected", "true");

      const response = await fetch(`/api/entrepreneurship/users?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      return response.json();
    },
  });

  return {
    users: data?.users || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
  };
}

export function useConnection(connectionId: string) {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["entrepreneurship-connection", connectionId],
    queryFn: async () => {
      const response = await fetch(`/api/entrepreneurship/connections/${connectionId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch connection");
      }
      return response.json();
    },
    enabled: !!connectionId,
  });

  return {
    connection: data,
    isLoading,
    error,
    refetch,
  };
}

// Specialized hooks for different connection types
export function useSentConnections() {
  return useEntrepreneurshipConnections({ type: "sent" });
}

export function useReceivedConnections() {
  return useEntrepreneurshipConnections({ type: "received" });
}

export function useAcceptedConnections() {
  return useEntrepreneurshipConnections({ status: "ACCEPTED" });
}

export function usePendingConnections() {
  return useEntrepreneurshipConnections({ status: "PENDING" });
}

export function useAvailableUsers() {
  return useEntrepreneurshipUsers({ excludeConnected: true });
}
