import apiClient from './client';

export interface CreateEventPayload {
  title: string;
  description?: string;
  type: 'online' | 'offline' | 'hybrid';
  location?: string;
  meetingUrl?: string;
  startsAt: string;
  endsAt: string;
  maxAttendees?: number;
  tags?: string[];
}

export interface UpdateEventPayload {
  title?: string;
  description?: string;
  type?: 'online' | 'offline' | 'hybrid';
  status?: string;
  location?: string;
  meetingUrl?: string;
  startsAt?: string;
  endsAt?: string;
  maxAttendees?: number;
  tags?: string[];
}

export const eventsApi = {
  list: (communityId: string, params?: { status?: string; type?: string; limit?: number; cursor?: string }) =>
    apiClient.get(`/communities/${communityId}/events`, { params }).then((r) => r.data.data ?? r.data),

  getById: (communityId: string, eventId: string) =>
    apiClient.get(`/communities/${communityId}/events/${eventId}`).then((r) => r.data.data ?? r.data),

  create: (communityId: string, data: CreateEventPayload) =>
    apiClient.post(`/communities/${communityId}/events`, data).then((r) => r.data.data ?? r.data),

  update: (communityId: string, eventId: string, data: UpdateEventPayload) =>
    apiClient.patch(`/communities/${communityId}/events/${eventId}`, data).then((r) => r.data.data ?? r.data),

  delete: (communityId: string, eventId: string) =>
    apiClient.delete(`/communities/${communityId}/events/${eventId}`),

  rsvp: (communityId: string, eventId: string, status: 'going' | 'maybe' | 'not_going') =>
    apiClient.post(`/communities/${communityId}/events/${eventId}/rsvp`, { status }).then((r) => r.data.data ?? r.data),

  getRsvps: (communityId: string, eventId: string) =>
    apiClient.get(`/communities/${communityId}/events/${eventId}/rsvps`).then((r) => r.data.data ?? r.data),

  feedback: (communityId: string, eventId: string, data: { rating: number; comment?: string }) =>
    apiClient.post(`/communities/${communityId}/events/${eventId}/feedback`, data).then((r) => r.data.data ?? r.data),
};
