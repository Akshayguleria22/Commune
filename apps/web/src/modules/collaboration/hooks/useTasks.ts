import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/client';

export const useTasks = (communityId: string, status?: string) => {
  return useQuery({
    queryKey: ['tasks', communityId, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      const res = await apiClient.get(`/communities/${communityId}/tasks?${params.toString()}`);
      return res.data.data;
    },
    enabled: !!communityId,
  });
};

export const useTask = (taskId: string) => {
  return useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      const res = await apiClient.get(`/communities/_/tasks/${taskId}`);
      return res.data.data;
    },
    enabled: !!taskId,
  });
};

export const useCreateTask = (communityId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; description?: string; priority?: string; tags?: string[]; assigneeIds?: string[] }) => {
      const res = await apiClient.post(`/communities/${communityId}/tasks`, data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', communityId] });
    },
  });
};

export const useUpdateTask = (communityId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, data }: { taskId: string; data: Record<string, any> }) => {
      const res = await apiClient.patch(`/communities/${communityId}/tasks/${taskId}`, data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', communityId] });
    },
  });
};

export const useTaskComments = (taskId: string) => {
  return useQuery({
    queryKey: ['task-comments', taskId],
    queryFn: async () => {
      const res = await apiClient.get(`/communities/_/tasks/${taskId}/comments`);
      return res.data.data;
    },
    enabled: !!taskId,
  });
};
