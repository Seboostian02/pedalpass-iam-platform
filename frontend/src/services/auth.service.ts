import apiClient from '@/lib/api-client';
import type { ApiResponse } from '@/types/api';
import type { LoginRequest, LoginResponse, RegisterRequest } from '@/types/auth';
import type { AdminCreateUserRequest } from '@/types/user';

export const authService = {
  login: async (request: LoginRequest): Promise<LoginResponse> => {
    console.log('[AuthService] Login attempt for:', request.email);
    const { data } = await apiClient.post<ApiResponse<LoginResponse>>('/api/v1/auth/login', request);
    console.log('[AuthService] Login response success:', data.success);
    if (!data.success) throw new Error(data.message || 'Login failed');
    return data.data!;
  },

  register: async (request: RegisterRequest): Promise<LoginResponse> => {
    console.log('[AuthService] Register attempt for:', request.email);
    const { data } = await apiClient.post<ApiResponse<LoginResponse>>('/api/v1/auth/register', request);
    console.log('[AuthService] Register response success:', data.success);
    if (!data.success) throw new Error(data.message || 'Registration failed');
    return data.data!;
  },

  refresh: async (refreshToken: string): Promise<LoginResponse> => {
    console.log('[AuthService] Refreshing token');
    const { data } = await apiClient.post<ApiResponse<LoginResponse>>('/api/v1/auth/refresh', { refreshToken });
    console.log('[AuthService] Refresh response success:', data.success);
    if (!data.success) throw new Error(data.message || 'Token refresh failed');
    return data.data!;
  },

  logout: async (): Promise<void> => {
    console.log('[AuthService] Logout request');
    await apiClient.post('/api/v1/auth/logout');
    console.log('[AuthService] Logout successful');
  },

  adminCreateUser: async (request: AdminCreateUserRequest): Promise<void> => {
    console.log('[AuthService] Admin create user for:', request.email);
    const { data } = await apiClient.post<ApiResponse<void>>('/api/v1/auth/admin/create-user', request);
    if (!data.success) throw new Error(data.message || 'Failed to create user');
  },
};
