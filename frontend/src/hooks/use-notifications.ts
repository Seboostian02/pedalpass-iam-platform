import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/notification.service';
import type { PaginationParams } from '@/types/api';
import type { UpdatePreferenceRequest } from '@/types/notification';
import { toast } from 'sonner';
import i18n from '@/lib/i18n';

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
      toast.success(i18n.t('toast.allNotificationsRead'));
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
      toast.success(i18n.t('toast.notificationDeleted'));
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
      toast.success(i18n.t('toast.preferenceUpdated'));
    },
    onError: (error: Error) => {
      toast.error(error.message || i18n.t('toast.failedUpdatePreference'));
    },
  });
}
