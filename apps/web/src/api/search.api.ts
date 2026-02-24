import apiClient from './client';

export interface SearchResult {
  type: 'community' | 'user' | 'event' | 'task';
  id: string;
  title: string;
  subtitle: string | null;
  avatarUrl: string | null;
  score: number;
}

export const searchApi = {
  search: (query: string, limit?: number): Promise<SearchResult[]> =>
    apiClient.get('/search', { params: { q: query, limit } }).then((r) => r.data.data ?? r.data ?? []),
};
