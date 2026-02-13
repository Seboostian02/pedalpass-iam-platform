import apiClient from '@/lib/api-client';
import type { ApiResponse, Page, PaginationParams } from '@/types/api';
import type { AuditLogResponse, SecurityAlertResponse, ResolveAlertRequest, DismissAlertRequest, SeverityLevel } from '@/types/audit';

export const auditService = {
  getLogs: async (params: PaginationParams = {}): Promise<Page<AuditLogResponse>> => {
    console.log('[AuditService] Fetching audit logs, params:', params);
    const { data } = await apiClient.get<ApiResponse<Page<AuditLogResponse>>>('/api/v1/audit/logs', { params });
    console.log('[AuditService] Audit logs:', data.data?.totalElements, 'total');
    if (!data.success) throw new Error(data.message);
    return data.data!;
  },

  getLogsByUser: async (userId: string, params: PaginationParams = {}): Promise<Page<AuditLogResponse>> => {
    console.log('[AuditService] Fetching logs for user:', userId);
    const { data } = await apiClient.get<ApiResponse<Page<AuditLogResponse>>>(`/api/v1/audit/logs/user/${userId}`, { params });
    if (!data.success) throw new Error(data.message);
    return data.data!;
  },

  getLogsByAction: async (action: string, params: PaginationParams = {}): Promise<Page<AuditLogResponse>> => {
    console.log('[AuditService] Fetching logs by action:', action);
    const { data } = await apiClient.get<ApiResponse<Page<AuditLogResponse>>>(`/api/v1/audit/logs/action/${action}`, { params });
    if (!data.success) throw new Error(data.message);
    return data.data!;
  },

  getLogsBySeverity: async (severity: SeverityLevel, params: PaginationParams = {}): Promise<Page<AuditLogResponse>> => {
    console.log('[AuditService] Fetching logs by severity:', severity);
    const { data } = await apiClient.get<ApiResponse<Page<AuditLogResponse>>>(`/api/v1/audit/logs/severity/${severity}`, { params });
    if (!data.success) throw new Error(data.message);
    return data.data!;
  },

  getLogsByRange: async (start: string, end: string, params: PaginationParams = {}): Promise<Page<AuditLogResponse>> => {
    console.log('[AuditService] Fetching logs in range:', start, '-', end);
    const { data } = await apiClient.get<ApiResponse<Page<AuditLogResponse>>>('/api/v1/audit/logs/range', {
      params: { start, end, ...params },
    });
    if (!data.success) throw new Error(data.message);
    return data.data!;
  },

  getAlerts: async (params: PaginationParams = {}): Promise<Page<SecurityAlertResponse>> => {
    console.log('[AuditService] Fetching security alerts, params:', params);
    const { data } = await apiClient.get<ApiResponse<Page<SecurityAlertResponse>>>('/api/v1/audit/alerts', { params });
    console.log('[AuditService] Alerts:', data.data?.totalElements, 'total');
    if (!data.success) throw new Error(data.message);
    return data.data!;
  },

  getOpenAlerts: async (params: PaginationParams = {}): Promise<Page<SecurityAlertResponse>> => {
    console.log('[AuditService] Fetching open alerts');
    const { data } = await apiClient.get<ApiResponse<Page<SecurityAlertResponse>>>('/api/v1/audit/alerts/open', { params });
    console.log('[AuditService] Open alerts:', data.data?.totalElements);
    if (!data.success) throw new Error(data.message);
    return data.data!;
  },

  resolveAlert: async (id: string, request?: ResolveAlertRequest): Promise<SecurityAlertResponse> => {
    console.log('[AuditService] Resolving alert:', id);
    const { data } = await apiClient.post<ApiResponse<SecurityAlertResponse>>(`/api/v1/audit/alerts/${id}/resolve`, request || {});
    console.log('[AuditService] Alert resolved:', data.data?.status);
    if (!data.success) throw new Error(data.message);
    return data.data!;
  },

  dismissAlert: async (id: string, request?: DismissAlertRequest): Promise<SecurityAlertResponse> => {
    console.log('[AuditService] Dismissing alert:', id);
    const { data } = await apiClient.post<ApiResponse<SecurityAlertResponse>>(`/api/v1/audit/alerts/${id}/dismiss`, request || {});
    console.log('[AuditService] Alert dismissed:', data.data?.status);
    if (!data.success) throw new Error(data.message);
    return data.data!;
  },
};
