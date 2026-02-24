import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/client';

// ===== Communities =====
export const useCommunities = (tags?: string) => {
  return useQuery({
    queryKey: ['communities', tags],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (tags) params.set('tags', tags);
      const res = await apiClient.get(`/communities?${params.toString()}`);
      return res.data.data;
    },
  });
};

export const useMyCommunities = () => {
  return useQuery({
    queryKey: ['my-communities'],
    queryFn: async () => {
      const res = await apiClient.get('/communities/mine');
      return res.data.data;
    },
  });
};

export const useCommunity = (slug: string) => {
  return useQuery({
    queryKey: ['community', slug],
    queryFn: async () => {
      const res = await apiClient.get(`/communities/${slug}`);
      return res.data.data;
    },
    enabled: !!slug,
  });
};

export const useCommunityMembers = (communityId: string) => {
  return useQuery({
    queryKey: ['community-members', communityId],
    queryFn: async () => {
      const res = await apiClient.get(`/communities/${communityId}/members`);
      return res.data.data;
    },
    enabled: !!communityId,
  });
};

export const useCreateCommunity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      slug: string;
      description?: string;
      visibility?: string;
      tags?: string[];
    }) => {
      const res = await apiClient.post('/communities', data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      queryClient.invalidateQueries({ queryKey: ['my-communities'] });
    },
  });
};

export const useJoinCommunity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (communityId: string) => {
      const res = await apiClient.post(`/communities/${communityId}/join`);
      return res.data.data;
    },
    onSuccess: (_data, _communityId) => {
      queryClient.invalidateQueries({ queryKey: ['community'] });
      queryClient.invalidateQueries({ queryKey: ['my-communities'] });
    },
  });
};

export const useLeaveCommunity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (communityId: string) => {
      await apiClient.post(`/communities/${communityId}/leave`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community'] });
      queryClient.invalidateQueries({ queryKey: ['my-communities'] });
    },
  });
};

export const useContributions = (communityId: string, userId?: string) => {
  return useQuery({
    queryKey: ['contributions', communityId, userId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (userId) params.set('userId', userId);
      const res = await apiClient.get(`/communities/${communityId}/contributions?${params.toString()}`);
      return res.data.data;
    },
    enabled: !!communityId,
  });
};
