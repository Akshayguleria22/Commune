import apiClient from './client';

export const portfolioApi = {
  getMyPortfolio: () =>
    apiClient.get('/portfolio/me').then((r) => r.data.data ?? r.data),

  updateMyPortfolio: (data: { headline?: string; summary?: string; isPublic?: boolean }) =>
    apiClient.patch('/portfolio/me', data).then((r) => r.data.data ?? r.data),

  addEntry: (data: { type: string; title: string; description?: string }) =>
    apiClient.post('/portfolio/me/entries', data).then((r) => r.data.data ?? r.data),

  addSkill: (data: { name: string; level?: number }) =>
    apiClient.post('/portfolio/me/skills', data).then((r) => r.data.data ?? r.data),

  removeSkill: (skillId: string) =>
    apiClient.delete(`/portfolio/me/skills/${skillId}`),

  getUserPortfolio: (userId: string) =>
    apiClient.get(`/portfolio/user/${userId}`).then((r) => r.data.data ?? r.data),
};
