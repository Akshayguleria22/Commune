import apiClient from './client';

export const notificationsApi = {
  list: (params?: { limit?: number; cursor?: string }) =>
    apiClient.get('/notifications', { params }).then((r) => r.data.data ?? r.data),

  getUnreadCount: () =>
    apiClient.get('/notifications/unread-count').then((r) => r.data.data ?? r.data),

  markAsRead: (id: string) =>
    apiClient.patch(`/notifications/${id}/read`).then((r) => r.data.data ?? r.data),

  markAllRead: () =>
    apiClient.patch('/notifications/read-all').then((r) => r.data.data ?? r.data),
};
