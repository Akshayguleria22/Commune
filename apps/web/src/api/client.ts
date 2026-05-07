import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../stores/auth.store';
import { useUIStore } from '../stores/ui.store';
import { getOrCreateGuestId } from '../shared/utils/guest';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

let guestLoginPromise: Promise<string | null> | null = null;

const ensureGuestSession = async () => {
  if (guestLoginPromise) return guestLoginPromise;
  guestLoginPromise = (async () => {
    const guestId = getOrCreateGuestId();
    const response = await axios.post(`${API_BASE_URL}/auth/guest`, { guestId });
    const data = response.data.data ?? response.data;
    useAuthStore.getState().setAuth(data.user, data.accessToken, data.refreshToken);
    return data.accessToken as string;
  })().finally(() => {
    guestLoginPromise = null;
  });
  return guestLoginPromise;
};

const waitForServer = async () => {
  const maxAttempts = 8;
  const delayMs = 1500;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      await axios.get(`${API_BASE_URL}/health`, { timeout: 8000 });
      return true;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  return false;
};

const isServerStartingError = (error: AxiosError) => {
  if (!error.response) return true;
  const status = error.response.status;
  return status === 502 || status === 503 || status === 504;
};

// Request interceptor — attach JWT
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — handle 401 with refresh
apiClient.interceptors.response.use(
  (response) => {
    useUIStore.getState().setServerStarting(false);
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean; _retryServer?: boolean };

    if (isServerStartingError(error) && !originalRequest._retryServer) {
      originalRequest._retryServer = true;
      useUIStore.getState().setServerStarting(true);
      const serverReady = await waitForServer();
      if (serverReady) {
        return apiClient(originalRequest);
      }
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) throw new Error('No refresh token');

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        useAuthStore.getState().setTokens(accessToken, newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch {
        try {
          const guestToken = await ensureGuestSession();
          if (guestToken) {
            originalRequest.headers.Authorization = `Bearer ${guestToken}`;
            return apiClient(originalRequest);
          }
        } catch {
          // Fall through to logout
        }
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
