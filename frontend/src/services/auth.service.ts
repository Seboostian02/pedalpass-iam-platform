import axios from 'axios';
import apiClient from '@/lib/api-client';
import type { ApiResponse } from '@/types/api';
import type { ChangePasswordRequest, ForgotPasswordRequest, LoginRequest, LoginResponse, RegisterRequest, ResetPasswordRequest } from '@/types/auth';
import type { AdminCreateUserRequest } from '@/types/user';

function extractErrorMessage(error: unknown, fallback: string): never {
  if (axios.isAxiosError(error) && error.response?.data?.message) {
    throw new Error(error.response.data.message);
  }
  throw new Error(error instanceof Error ? error.message : fallback);
}

export const authService = {
  login: async (request: LoginRequest): Promise<LoginResponse> => {
    try {
      console.log('[AuthService] Login attempt for:', request.email);
      const { data } = await apiClient.post<ApiResponse<LoginResponse>>('/api/v1/auth/login', request);
      console.log('[AuthService] Login response success:', data.success);
      if (!data.success) throw new Error(data.message || 'Login failed');
      return data.data!;
    } catch (error) {
      extractErrorMessage(error, 'Login failed');
    }
  },

  register: async (request: RegisterRequest): Promise<LoginResponse> => {
    try {
      console.log('[AuthService] Register attempt for:', request.email);
      const { data } = await apiClient.post<ApiResponse<LoginResponse>>('/api/v1/auth/register', request);
      console.log('[AuthService] Register response success:', data.success);
      if (!data.success) throw new Error(data.message || 'Registration failed');
      return data.data!;
    } catch (error) {
      extractErrorMessage(error, 'Registration failed');
    }
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

  changePassword: async (request: ChangePasswordRequest): Promise<void> => {
    const { data } = await apiClient.put<ApiResponse<void>>('/api/v1/auth/change-password', request);
    if (!data.success) throw new Error(data.message || 'Failed to change password');
  },

  forgotPassword: async (request: ForgotPasswordRequest): Promise<void> => {
    try {
      const { data } = await apiClient.post<ApiResponse<void>>('/api/v1/auth/password/forgot', request);
      if (!data.success) throw new Error(data.message || 'Request failed');
    } catch (error) {
      extractErrorMessage(error, 'Failed to send reset link');
    }
  },

  validateResetToken: async (token: string): Promise<void> => {
    try {
      const { data } = await apiClient.get<ApiResponse<void>>(`/api/v1/auth/password/validate-token?token=${token}`);
      if (!data.success) throw new Error(data.message || 'Invalid token');
    } catch (error) {
      extractErrorMessage(error, 'Invalid or expired reset link');
    }
  },

  resetPassword: async (request: ResetPasswordRequest): Promise<void> => {
    try {
      const { data } = await apiClient.post<ApiResponse<void>>('/api/v1/auth/password/reset', request);
      if (!data.success) throw new Error(data.message || 'Password reset failed');
    } catch (error) {
      extractErrorMessage(error, 'Failed to reset password');
    }
  },
};
