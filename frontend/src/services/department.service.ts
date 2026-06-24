import apiClient from '@/lib/api-client';
import type { ApiResponse } from '@/types/api';
import type { DepartmentResponse, DepartmentRequest } from '@/types/user';

export const departmentService = {
  getDepartments: async (): Promise<DepartmentResponse[]> => {
    console.log('[DepartmentService] Fetching departments');
    const { data } = await apiClient.get<ApiResponse<DepartmentResponse[]>>('/api/v1/departments');
    console.log('[DepartmentService] Departments loaded:', data.data?.length);
    if (!data.success) throw new Error(data.message);
    return data.data!;
  },

  getDepartmentById: async (id: string): Promise<DepartmentResponse> => {
    console.log('[DepartmentService] Fetching department:', id);
    const { data } = await apiClient.get<ApiResponse<DepartmentResponse>>(`/api/v1/departments/${id}`);
    if (!data.success) throw new Error(data.message);
    return data.data!;
  },

  createDepartment: async (request: DepartmentRequest): Promise<DepartmentResponse> => {
    console.log('[DepartmentService] Creating department:', request.name);
    const { data } = await apiClient.post<ApiResponse<DepartmentResponse>>('/api/v1/departments', request);
    if (!data.success) throw new Error(data.message);
    return data.data!;
  },

  updateDepartment: async (id: string, request: DepartmentRequest): Promise<DepartmentResponse> => {
    console.log('[DepartmentService] Updating department:', id);
    const { data } = await apiClient.put<ApiResponse<DepartmentResponse>>(`/api/v1/departments/${id}`, request);
    if (!data.success) throw new Error(data.message);
    return data.data!;
  },

  deleteDepartment: async (id: string): Promise<void> => {
    console.log('[DepartmentService] Deleting department:', id);
    await apiClient.delete(`/api/v1/departments/${id}`);
    console.log('[DepartmentService] Department deleted:', id);
  },
};
