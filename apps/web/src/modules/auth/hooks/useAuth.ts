import { useQuery } from '@tanstack/react-query';
import { authApi } from '../../../api/auth.api';

export const authKeys = {
  me: ['auth', 'me'] as const,
};

/** Fetch current user profile from API */
export function useMe() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: () => authApi.getMe(),
    retry: false,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
