import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8090';

console.log('[API] Base URL:', API_BASE_URL);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('[API] Request:', config.method?.toUpperCase(), config.url);
  return config;
});

// Response interceptor: handle 401, token refresh
let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (error: unknown) => void }[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (token) {
      resolve(token);
    } else {
      reject(error);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    console.log('[API] Response:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('[API] 401 received for:', originalRequest.url);

      if (isRefreshing) {
        console.log('[API] Already refreshing, queuing request:', originalRequest.url);
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          console.log('[API] No refresh token found, redirecting to login');
          throw new Error('No refresh token');
        }

        console.log('[API] Token refresh triggered');
        const { data } = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
          refreshToken,
        });

        const newAccessToken = data.data.accessToken;
        const newRefreshToken = data.data.refreshToken;

        console.log('[API] Token refresh successful, new tokens saved');
        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        // Decode new JWT and update user in localStorage with fresh roles/permissions
        try {
          const payload = jwtDecode<{ sub: string; email: string; roles?: string; permissions?: string }>(newAccessToken);
          const existingUser = JSON.parse(localStorage.getItem('user') || '{}');
          const updatedUser = {
            ...existingUser,
            id: payload.sub,
            email: payload.email,
            roles: payload.roles ? payload.roles.split(',') : [],
            permissions: payload.permissions ? payload.permissions.split(',') : [],
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          console.log('[API] User updated after refresh, roles:', updatedUser.roles);
          // Notify auth context about the token refresh
          window.dispatchEvent(new CustomEvent('auth:token-refreshed'));
        } catch (decodeErr) {
          console.log('[API] Failed to decode refreshed token:', decodeErr);
        }

        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.log('[API] Refresh failed, clearing tokens and redirecting to login');
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    console.log('[API] Error:', error.response?.status, error.config?.url, error.response?.data?.message);
    return Promise.reject(error);
  }
);

export default apiClient;
