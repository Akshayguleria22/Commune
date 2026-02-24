import apiClient from './client';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  username: string;
  displayName: string;
}

export const authApi = {
  login: (data: LoginPayload) =>
    apiClient.post('/auth/login', data).then((r) => r.data.data ?? r.data),

  register: (data: RegisterPayload) =>
    apiClient.post('/auth/register', data).then((r) => r.data.data ?? r.data),

  getMe: () =>
    apiClient.get('/auth/me').then((r) => r.data.data ?? r.data),

  updateProfile: (data: Record<string, unknown>) =>
    apiClient.patch('/auth/me', data).then((r) => r.data.data ?? r.data),

  refresh: (refreshToken: string) =>
    apiClient.post('/auth/refresh', { refreshToken }).then((r) => r.data.data ?? r.data),

  logout: (refreshToken: string) =>
    apiClient.post('/auth/logout', { refreshToken }),
};
