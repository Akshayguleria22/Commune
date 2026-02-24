import apiClient from './client';

export interface CreateCommunityPayload {
  name: string;
  slug: string;
  description?: string;
  visibility?: 'public' | 'private';
  tags?: string[];
}

export interface UpdateCommunityPayload {
  name?: string;
  description?: string;
  visibility?: 'public' | 'private';
  tags?: string[];
}

export interface PaginationParams {
  limit?: number;
  cursor?: string;
}

export const communitiesApi = {
  list: (params?: PaginationParams & { tags?: string }) =>
    apiClient.get('/communities', { params }).then((r) => r.data.data ?? r.data),

  getBySlug: (slug: string) =>
    apiClient.get(`/communities/${slug}`).then((r) => r.data.data ?? r.data),

  create: (data: CreateCommunityPayload) =>
    apiClient.post('/communities', data).then((r) => r.data.data ?? r.data),

  update: (id: string, data: UpdateCommunityPayload) =>
    apiClient.patch(`/communities/${id}`, data).then((r) => r.data.data ?? r.data),

  join: (id: string) =>
    apiClient.post(`/communities/${id}/join`).then((r) => r.data.data ?? r.data),

  leave: (id: string) =>
    apiClient.post(`/communities/${id}/leave`).then((r) => r.data.data ?? r.data),

  getMembers: (id: string, params?: PaginationParams) =>
    apiClient.get(`/communities/${id}/members`, { params }).then((r) => r.data.data ?? r.data),

  getContributions: (id: string, params?: { userId?: string; days?: number }) =>
    apiClient.get(`/communities/${id}/contributions`, { params }).then((r) => r.data.data ?? r.data),
};
