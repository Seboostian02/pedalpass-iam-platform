import apiClient from '@/lib/api-client';
import type { ApiResponse, Page, PaginationParams } from '@/types/api';
import type { UserResponse, CreateUserRequest, UpdateUserRequest } from '@/types/user';

export const userService = {
  getUsers: async (params: PaginationParams = {}): Promise<Page<UserResponse>> => {
    console.log('[UserService] Fetching users, params:', params);
    const { data } = await apiClient.get<ApiResponse<Page<UserResponse>>>('/api/v1/users', { params });
    console.log('[UserService] Response:', data.data?.totalElements, 'total users');
    if (!data.success) throw new Error(data.message);
    return data.data!;
  },

  getUserById: async (id: string): Promise<UserResponse> => {
    console.log('[UserService] Fetching user:', id);
    const { data } = await apiClient.get<ApiResponse<UserResponse>>(`/api/v1/users/${id}`);
    console.log('[UserService] User fetched:', data.data?.email);
    if (!data.success) throw new Error(data.message);
    return data.data!;
  },

  createUser: async (request: CreateUserRequest): Promise<UserResponse> => {
    console.log('[UserService] Creating user:', request.email);
    const { data } = await apiClient.post<ApiResponse<UserResponse>>('/api/v1/users', request);
    console.log('[UserService] User created:', data.data?.id);
    if (!data.success) throw new Error(data.message);
    return data.data!;
  },

  updateUser: async (id: string, request: UpdateUserRequest): Promise<UserResponse> => {
    console.log('[UserService] Updating user:', id);
    const { data } = await apiClient.put<ApiResponse<UserResponse>>(`/api/v1/users/${id}`, request);
    console.log('[UserService] User updated:', data.data?.id);
    if (!data.success) throw new Error(data.message);
    return data.data!;
  },

  deactivateUser: async (id: string): Promise<void> => {
    console.log('[UserService] Deactivating user:', id);
    await apiClient.delete(`/api/v1/users/${id}`);
    console.log('[UserService] User deactivated:', id);
  },

  assignRole: async (userId: string, roleName: string): Promise<UserResponse> => {
    console.log('[UserService] Assigning role:', roleName, 'to user:', userId);
    const { data } = await apiClient.post<ApiResponse<UserResponse>>(`/api/v1/users/${userId}/roles/${roleName}`);
    console.log('[UserService] Role assigned successfully');
    if (!data.success) throw new Error(data.message);
    return data.data!;
  },

  removeRole: async (userId: string, roleName: string): Promise<UserResponse> => {
    console.log('[UserService] Removing role:', roleName, 'from user:', userId);
    const { data } = await apiClient.delete<ApiResponse<UserResponse>>(`/api/v1/users/${userId}/roles/${roleName}`);
    console.log('[UserService] Role removed successfully');
    if (!data.success) throw new Error(data.message);
    return data.data!;
  },
};
