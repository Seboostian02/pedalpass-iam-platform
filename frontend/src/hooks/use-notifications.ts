import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/notification.service';
import type { PaginationParams } from '@/types/api';
import type { UpdatePreferenceRequest } from '@/types/notification';
import { toast } from 'sonner';

export function useNotifications(params: PaginationParams = {}) {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => notificationService.getNotifications(params),
  });
}

export function useUnreadNotifications(params: PaginationParams = {}) {
  return useQuery({
    queryKey: ['notifications', 'unread', params],
    queryFn: () => notificationService.getUnread(params),
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications', 'unread', 'count'],
    queryFn: () => notificationService.getUnreadCount(),
    refetchInterval: 30_000,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      console.log('[useMarkAsRead] Mutation success');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      console.log('[useMarkAllAsRead] Mutation success');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.deleteNotification(id),
    onSuccess: () => {
      console.log('[useDeleteNotification] Mutation success');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification deleted');
    },
  });
}

export function useNotificationTypes() {
  return useQuery({
    queryKey: ['notification-types'],
    queryFn: () => notificationService.getNotificationTypes(),
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: ['notification-preferences'],
    queryFn: () => notificationService.getPreferences(),
  });
}

export function useUpdatePreference() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UpdatePreferenceRequest) => notificationService.updatePreference(request),
    onSuccess: () => {
      console.log('[useUpdatePreference] Mutation success');
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      toast.success('Preference updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update preference');
    },
  });
}
