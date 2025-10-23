import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  YouthApplication, 
  YouthApplicationCompanyInterest,
  CreateYouthApplicationData,
  UpdateYouthApplicationData,
  CreateInterestData,
  UpdateInterestData
} from "@/types/youth-application";

export function useYouthApplications({
  page = 1,
  limit = 10,
  search = "",
  status = "",
  sortBy = "createdAt",
  sortOrder = "desc",
  myApplications = false,
}: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
  myApplications?: boolean;
} = {}) {
  return useQuery({
    queryKey: ["youth-applications", page, limit, search, status, sortBy, sortOrder, myApplications],
    queryFn: async (): Promise<{ applications: YouthApplication[]; pagination: any }> => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (search) params.append("search", search);
      if (status) params.append("status", status);
      if (sortBy) params.append("sortBy", sortBy);
      if (sortOrder) params.append("sortOrder", sortOrder);
      if (myApplications) params.append("myApplications", "true");

      const response = await fetch(`/api/youth-applications?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch youth applications");
      }
      return response.json();
    },
  });
}

export function useYouthApplication(id: string) {
  return useQuery({
    queryKey: ["youth-application", id],
    queryFn: async (): Promise<YouthApplication> => {
      const response = await fetch(`/api/youth-applications/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch youth application");
      }
      return response.json();
    },
    enabled: !!id,
  });
}

export function useCreateYouthApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateYouthApplicationData): Promise<YouthApplication> => {
      const response = await fetch("/api/youth-applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create youth application");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["youth-applications"] });
    },
  });
}

export function useUpdateYouthApplication(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateYouthApplicationData): Promise<YouthApplication> => {
      const response = await fetch(`/api/youth-applications/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update youth application");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["youth-application", id] });
      queryClient.invalidateQueries({ queryKey: ["youth-applications"] });
    },
  });
}

export function useDeleteYouthApplication(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      const response = await fetch(`/api/youth-applications/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete youth application");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["youth-applications"] });
    },
  });
}

export function useYouthApplicationInterests(applicationId: string) {
  return useQuery({
    queryKey: ["youth-application-interests", applicationId],
    queryFn: async (): Promise<{ interests: YouthApplicationCompanyInterest[] }> => {
      const response = await fetch(`/api/youth-applications/${applicationId}/interests`);
      if (!response.ok) {
        throw new Error("Failed to fetch interests");
      }
      return response.json();
    },
    enabled: !!applicationId,
  });
}

export function useCreateInterest(applicationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateInterestData): Promise<YouthApplicationCompanyInterest> => {
      const response = await fetch(`/api/youth-applications/${applicationId}/interests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create interest");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["youth-application-interests", applicationId] });
      queryClient.invalidateQueries({ queryKey: ["youth-application", applicationId] });
    },
  });
}

export function useUpdateInterest(applicationId: string, interestId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateInterestData): Promise<YouthApplicationCompanyInterest> => {
      const response = await fetch(`/api/youth-applications/${applicationId}/interests/${interestId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update interest");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["youth-application-interests", applicationId] });
      queryClient.invalidateQueries({ queryKey: ["youth-application", applicationId] });
    },
  });
}

export function useDeleteInterest(applicationId: string, interestId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      const response = await fetch(`/api/youth-applications/${applicationId}/interests/${interestId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete interest");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["youth-application-interests", applicationId] });
      queryClient.invalidateQueries({ queryKey: ["youth-application", applicationId] });
    },
  });
}
