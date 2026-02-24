import apiClient from './client';

export const messagingApi = {
  // Friends
  sendFriendRequest: (addresseeId: string) =>
    apiClient.post('/messaging/friends/request', { addresseeId }).then((r) => r.data.data ?? r.data),

  respondToRequest: (friendshipId: string, accept: boolean) =>
    apiClient.post(`/messaging/friends/${friendshipId}/respond`, { accept }).then((r) => r.data.data ?? r.data),

  getFriends: () =>
    apiClient.get('/messaging/friends').then((r) => r.data.data ?? r.data),

  getPendingRequests: () =>
    apiClient.get('/messaging/friends/pending').then((r) => r.data.data ?? r.data),

  removeFriend: (friendshipId: string) =>
    apiClient.delete(`/messaging/friends/${friendshipId}`).then((r) => r.data.data ?? r.data),

  // DM Conversations
  getDMChannels: () =>
    apiClient.get('/messaging/dm/channels').then((r) => r.data.data ?? r.data),

  getOrCreateDmChannel: (friendId: string) =>
    apiClient.post('/messaging/dm/channel', { friendId }).then((r) => r.data.data ?? r.data),

  getMessages: (channelId: string, params?: { limit?: number; before?: string }) =>
    apiClient.get(`/messaging/dm/${channelId}/messages`, { params }).then((r) => r.data.data ?? r.data),

  sendMessage: (channelId: string, content: string) =>
    apiClient.post(`/messaging/dm/${channelId}/messages`, { content }).then((r) => r.data.data ?? r.data),
};
