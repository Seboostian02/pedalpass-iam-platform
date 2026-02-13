import apiClient from '@/lib/api-client';
import type { ApiResponse } from '@/types/api';
import type { RoleResponse } from '@/types/user';

export const roleService = {
  getRoles: async (): Promise<RoleResponse[]> => {
    console.log('[RoleService] Fetching roles');
    const { data } = await apiClient.get<ApiResponse<RoleResponse[]>>('/api/v1/roles');
    console.log('[RoleService] Roles loaded:', data.data?.length);
    if (!data.success) throw new Error(data.message);
    return data.data!;
  },

  getRoleById: async (id: string): Promise<RoleResponse> => {
    console.log('[RoleService] Fetching role:', id);
    const { data } = await apiClient.get<ApiResponse<RoleResponse>>(`/api/v1/roles/${id}`);
    if (!data.success) throw new Error(data.message);
    return data.data!;
  },
};
