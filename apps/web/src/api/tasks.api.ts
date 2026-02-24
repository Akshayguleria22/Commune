import apiClient from './client';

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
  tags?: string[];
  assigneeIds?: string[];
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
  tags?: string[];
}

export const tasksApi = {
  list: (communityId: string, params?: { status?: string; limit?: number; cursor?: string }) =>
    apiClient.get(`/communities/${communityId}/tasks`, { params }).then((r) => r.data.data ?? r.data),

  getById: (communityId: string, taskId: string) =>
    apiClient.get(`/communities/${communityId}/tasks/${taskId}`).then((r) => r.data.data ?? r.data),

  create: (communityId: string, data: CreateTaskPayload) =>
    apiClient.post(`/communities/${communityId}/tasks`, data).then((r) => r.data.data ?? r.data),

  update: (communityId: string, taskId: string, data: UpdateTaskPayload) =>
    apiClient.patch(`/communities/${communityId}/tasks/${taskId}`, data).then((r) => r.data.data ?? r.data),

  getComments: (communityId: string, taskId: string) =>
    apiClient.get(`/communities/${communityId}/tasks/${taskId}/comments`).then((r) => r.data.data ?? r.data),

  addComment: (communityId: string, taskId: string, data: { content: string; parentId?: string }) =>
    apiClient.post(`/communities/${communityId}/tasks/${taskId}/comments`, data).then((r) => r.data.data ?? r.data),
};
