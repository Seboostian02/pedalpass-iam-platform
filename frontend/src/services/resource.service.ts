import apiClient from '@/lib/api-client';
import type { ApiResponse, Page, PaginationParams } from '@/types/api';
import type {
  ResourceResponse, CreateResourceRequest, UpdateResourceRequest,
  AccessRequestResponse, CreateAccessRequestRequest, ReviewAccessRequestRequest,
  ResourceType, ResourceCategory,
} from '@/types/resource';

export const resourceService = {
  getResources: async (params: PaginationParams = {}): Promise<Page<ResourceResponse>> => {
    console.log('[ResourceService] Fetching resources, params:', params);
    const { data } = await apiClient.get<ApiResponse<Page<ResourceResponse>>>('/api/v1/resources', { params });
    console.log('[ResourceService] Response:', data.data?.totalElements, 'total resources');
    if (!data.success) throw new Error(data.message);
    return data.data!;
  },

  getResourceById: async (id: string): Promise<ResourceResponse> => {
    console.log('[ResourceService] Fetching resource:', id);
    const { data } = await apiClient.get<ApiResponse<ResourceResponse>>(`/api/v1/resources/${id}`);
    if (!data.success) throw new Error(data.message);
    return data.data!;
  },

  getResourcesByType: async (type: ResourceType, params: PaginationParams = {}): Promise<Page<ResourceResponse>> => {
    console.log('[ResourceService] Fetching resources by type:', type);
    const { data } = await apiClient.get<ApiResponse<Page<ResourceResponse>>>(`/api/v1/resources/type/${type}`, { params });
    if (!data.success) throw new Error(data.message);
    return data.data!;
  },

  getResourcesByCategory: async (category: ResourceCategory, params: PaginationParams = {}): Promise<Page<ResourceResponse>> => {
    console.log('[ResourceService] Fetching resources by category:', category);
    const { data } = await apiClient.get<ApiResponse<Page<ResourceResponse>>>(`/api/v1/resources/category/${category}`, { params });
    if (!data.success) throw new Error(data.message);
    return data.data!;
  },

  createResource: async (request: CreateResourceRequest): Promise<ResourceResponse> => {
    console.log('[ResourceService] Creating resource:', request.name);
    const { data } = await apiClient.post<ApiResponse<ResourceResponse>>('/api/v1/resources', request);
    if (!data.success) throw new Error(data.message);
    return data.data!;
  },

  updateResource: async (id: string, request: UpdateResourceRequest): Promise<ResourceResponse> => {
    console.log('[ResourceService] Updating resource:', id);
    const { data } = await apiClient.put<ApiResponse<ResourceResponse>>(`/api/v1/resources/${id}`, request);
    if (!data.success) throw new Error(data.message);
    return data.data!;
  },

  deactivateResource: async (id: string): Promise<void> => {
    console.log('[ResourceService] Deactivating resource:', id);
    await apiClient.delete(`/api/v1/resources/${id}`);
    console.log('[ResourceService] Resource deactivated:', id);
  },

  getAccessRequestsByResource: async (resourceId: string, params: PaginationParams = {}): Promise<Page<AccessRequestResponse>> => {
    console.log('[ResourceService] Fetching access requests for resource:', resourceId);
    const { data } = await apiClient.get<ApiResponse<Page<AccessRequestResponse>>>(`/api/v1/resources/${resourceId}/access-requests`, { params });
    if (!data.success) throw new Error(data.message);
    return data.data!;
  },
};

export const accessRequestService = {
  getMyRequests: async (params: PaginationParams = {}): Promise<Page<AccessRequestResponse>> => {
    console.log('[AccessRequestService] Fetching my requests, params:', params);
    const { data } = await apiClient.get<ApiResponse<Page<AccessRequestResponse>>>('/api/v1/access-requests/my', { params });
    console.log('[AccessRequestService] My requests:', data.data?.totalElements);
    if (!data.success) throw new Error(data.message);
    return data.data!;
  },

  createRequest: async (request: CreateAccessRequestRequest): Promise<AccessRequestResponse> => {
    console.log('[AccessRequestService] Creating access request for resource:', request.resourceId);
    const { data } = await apiClient.post<ApiResponse<AccessRequestResponse>>('/api/v1/access-requests', request);
    if (!data.success) throw new Error(data.message);
    return data.data!;
  },

  getRequestById: async (id: string): Promise<AccessRequestResponse> => {
    console.log('[AccessRequestService] Fetching request:', id);
    const { data } = await apiClient.get<ApiResponse<AccessRequestResponse>>(`/api/v1/access-requests/${id}`);
    if (!data.success) throw new Error(data.message);
    return data.data!;
  },

  getPendingRequests: async (params: PaginationParams = {}): Promise<Page<AccessRequestResponse>> => {
    console.log('[AccessRequestService] Fetching pending requests, params:', params);
    const { data } = await apiClient.get<ApiResponse<Page<AccessRequestResponse>>>('/api/v1/access-requests/pending', { params });
    console.log('[AccessRequestService] Pending requests:', data.data?.totalElements);
    if (!data.success) throw new Error(data.message);
    return data.data!;
  },

  reviewRequest: async (id: string, request: ReviewAccessRequestRequest): Promise<AccessRequestResponse> => {
    console.log('[AccessRequestService] Reviewing request:', id, 'decision:', request.decision);
    const { data } = await apiClient.post<ApiResponse<AccessRequestResponse>>(`/api/v1/access-requests/${id}/review`, request);
    console.log('[AccessRequestService] Review result:', data.data?.status);
    if (!data.success) throw new Error(data.message);
    return data.data!;
  },

  revokeRequest: async (id: string, comment?: string): Promise<AccessRequestResponse> => {
    console.log('[AccessRequestService] Revoking request:', id);
    const { data } = await apiClient.post<ApiResponse<AccessRequestResponse>>(
      `/api/v1/access-requests/${id}/revoke`,
      null,
      { params: { comment } }
    );
    if (!data.success) throw new Error(data.message);
    return data.data!;
  },
};
