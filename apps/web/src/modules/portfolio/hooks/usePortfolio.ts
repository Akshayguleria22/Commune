import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { portfolioApi } from '../../../api/portfolio.api';

export function useMyPortfolio() {
  return useQuery({
    queryKey: ['portfolio', 'me'],
    queryFn: () => portfolioApi.getMyPortfolio(),
  });
}

export function useUserPortfolio(userId: string) {
  return useQuery({
    queryKey: ['portfolio', userId],
    queryFn: () => portfolioApi.getUserPortfolio(userId),
    enabled: !!userId,
  });
}

export function useUpdatePortfolio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { headline?: string; summary?: string; isPublic?: boolean }) =>
      portfolioApi.updateMyPortfolio(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['portfolio'] }),
  });
}

export function useAddSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; level?: number }) => portfolioApi.addSkill(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['portfolio'] }),
  });
}

export function useRemoveSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (skillId: string) => portfolioApi.removeSkill(skillId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['portfolio'] }),
  });
}
