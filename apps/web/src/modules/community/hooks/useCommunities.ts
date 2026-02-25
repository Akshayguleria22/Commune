import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { communitiesApi, type CreateCommunityPayload, type PaginationParams } from '../../../api/communities.api';

export const communityKeys = {
  all: ['communities'] as const,
  lists: () => [...communityKeys.all, 'list'] as const,
  list: (params?: PaginationParams & { tags?: string }) => [...communityKeys.lists(), params] as const,
  details: () => [...communityKeys.all, 'detail'] as const,
  detail: (slug: string) => [...communityKeys.details(), slug] as const,
  members: (id: string) => [...communityKeys.all, 'members', id] as const,
  contributions: (id: string) => [...communityKeys.all, 'contributions', id] as const,
};

/** Fetch all public communities */
export function useCommunities(params?: PaginationParams & { tags?: string }) {
  return useQuery({
    queryKey: communityKeys.list(params),
    queryFn: () => communitiesApi.list(params),
  });
}

/** Fetch a single community by slug */
export function useCommunity(slug: string) {
  return useQuery({
    queryKey: communityKeys.detail(slug),
    queryFn: () => communitiesApi.getBySlug(slug),
    enabled: !!slug,
  });
}

/** Fetch members of a community */
export function useCommunityMembers(id: string, params?: PaginationParams) {
  return useQuery({
    queryKey: communityKeys.members(id),
    queryFn: () => communitiesApi.getMembers(id, params),
    enabled: !!id,
  });
}

/** Fetch contribution heatmap */
export function useCommunityContributions(id: string, params?: { userId?: string; days?: number }) {
  return useQuery({
    queryKey: communityKeys.contributions(id),
    queryFn: () => communitiesApi.getContributions(id, params),
    enabled: !!id,
  });
}

/** Create a new community */
export function useCreateCommunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCommunityPayload) => communitiesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.lists() });
    },
  });
}

/** Update an existing community */
export function useUpdateCommunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => communitiesApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: communityKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: communityKeys.all });
      message.success('Community updated');
    },
    onError: () => {
      message.error('Failed to update community');
    }
  });
}

/** Join a community */
export function useJoinCommunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => communitiesApi.join(id),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: communityKeys.all });
      if (data?.status === 'pending') {
        message.info('Join request sent! Waiting for approval.');
      } else {
        message.success('Joined community!');
      }
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || 'Failed to join community');
    },
  });
}

/** Leave a community */
export function useLeaveCommunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => communitiesApi.leave(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.all });
      message.success('Left community');
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || 'Failed to leave community');
    },
  });
}
