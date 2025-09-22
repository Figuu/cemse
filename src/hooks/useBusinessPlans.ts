import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BusinessPlanData } from '@/lib/businessPlanService';

interface BusinessPlanFilters {
  limit?: number;
  offset?: number;
  status?: string;
}


export function useBusinessPlans(filters: BusinessPlanFilters = {}) {
  return useQuery({
    queryKey: ['businessPlans', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.offset) params.append('offset', filters.offset.toString());
      if (filters.status) params.append('status', filters.status);

      const response = await fetch(`/api/business-plans?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch business plans');
      }
      return response.json();
    },
  });
}

export function useBusinessPlan(id: string) {
  return useQuery({
    queryKey: ['businessPlan', id],
    queryFn: async () => {
      const response = await fetch(`/api/business-plans/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch business plan');
      }
      return response.json();
    },
    enabled: !!id,
  });
}


export function useCreateBusinessPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (businessPlanData: BusinessPlanData) => {
      const response = await fetch('/api/business-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(businessPlanData),
      });

      if (!response.ok) {
        throw new Error('Failed to create business plan');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessPlans'] });
    },
  });
}

export function useUpdateBusinessPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      businessPlanData
    }: { 
      id: string; 
      businessPlanData: BusinessPlanData;
    }) => {
      const response = await fetch(`/api/business-plans/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(businessPlanData),
      });

      if (!response.ok) {
        throw new Error('Failed to update business plan');
      }
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['businessPlans'] });
      queryClient.invalidateQueries({ queryKey: ['businessPlan', variables.id] });
    },
  });
}

export function useDeleteBusinessPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/business-plans/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete business plan');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessPlans'] });
    },
  });
}
