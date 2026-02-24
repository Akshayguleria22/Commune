import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi, type CreateEventPayload } from '../../../api/events.api';

export function useEvents(communityId: string, params?: { status?: string; type?: string }) {
  return useQuery({
    queryKey: ['events', communityId, params],
    queryFn: () => eventsApi.list(communityId, params),
    enabled: !!communityId,
  });
}

export function useEvent(communityId: string, eventId: string) {
  return useQuery({
    queryKey: ['event', communityId, eventId],
    queryFn: () => eventsApi.getById(communityId, eventId),
    enabled: !!communityId && !!eventId,
  });
}

export function useCreateEvent(communityId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEventPayload) => eventsApi.create(communityId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events', communityId] }),
  });
}

export function useRsvp(communityId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, status }: { eventId: string; status: 'going' | 'maybe' | 'not_going' }) =>
      eventsApi.rsvp(communityId, eventId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events', communityId] }),
  });
}
