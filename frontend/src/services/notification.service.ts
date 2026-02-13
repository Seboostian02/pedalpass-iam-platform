import apiClient from '@/lib/api-client';
import type { ApiResponse, Page, PaginationParams } from '@/types/api';
import type { NotificationResponse, NotificationPreferenceResponse, UpdatePreferenceRequest } from '@/types/notification';

export const notificationService = {
  getNotifications: async (params: PaginationParams = {}): Promise<Page<NotificationResponse>> => {
    console.log('[NotificationService] Fetching notifications, params:', params);
    const { data } = await apiClient.get<ApiResponse<Page<NotificationResponse>>>('/api/v1/notifications', { params });
    console.log('[NotificationService] Notifications:', data.data?.totalElements, 'total');
    if (!data.success) throw new Error(data.message);
    return data.data!;
  },

  getUnread: async (params: PaginationParams = {}): Promise<Page<NotificationResponse>> => {
    console.log('[NotificationService] Fetching unread notifications');
    const { data } = await apiClient.get<ApiResponse<Page<NotificationResponse>>>('/api/v1/notifications/unread', { params });
    if (!data.success) throw new Error(data.message);
    return data.data!;
  },

  getUnreadCount: async (): Promise<number> => {
    console.log('[NotificationService] Fetching unread count');
    const { data } = await apiClient.get<ApiResponse<number>>('/api/v1/notifications/unread/count');
    // Backend may return {count: N} object or just N
    const raw = data.data;
    const count = typeof raw === 'object' && raw !== null && 'count' in (raw as object)
      ? (raw as unknown as { count: number }).count
      : (raw as number);
    console.log('[NotificationService] Unread count:', count);
    if (!data.success) throw new Error(data.message);
    return count ?? 0;
  },

  markAsRead: async (id: string): Promise<void> => {
    console.log('[NotificationService] Marking as read:', id);
    await apiClient.post(`/api/v1/notifications/${id}/read`);
    console.log('[NotificationService] Marked as read:', id);
  },

  markAllAsRead: async (): Promise<void> => {
    console.log('[NotificationService] Marking all as read');
    await apiClient.post('/api/v1/notifications/read-all');
    console.log('[NotificationService] All marked as read');
  },

  deleteNotification: async (id: string): Promise<void> => {
    console.log('[NotificationService] Deleting notification:', id);
    await apiClient.delete(`/api/v1/notifications/${id}`);
    console.log('[NotificationService] Notification deleted:', id);
  },

  getPreferences: async (): Promise<NotificationPreferenceResponse[]> => {
    console.log('[NotificationService] Fetching preferences');
    const { data } = await apiClient.get<ApiResponse<NotificationPreferenceResponse[]>>('/api/v1/notifications/preferences');
    console.log('[NotificationService] Preferences loaded:', data.data?.length, 'types');
    if (!data.success) throw new Error(data.message);
    return data.data!;
  },

  updatePreference: async (request: UpdatePreferenceRequest): Promise<NotificationPreferenceResponse> => {
    console.log('[NotificationService] Updating preference:', request.notificationType, 'email:', request.emailEnabled, 'inApp:', request.inAppEnabled);
    const { data } = await apiClient.put<ApiResponse<NotificationPreferenceResponse>>('/api/v1/notifications/preferences', request);
    console.log('[NotificationService] Preference updated');
    if (!data.success) throw new Error(data.message);
    return data.data!;
  },
};
