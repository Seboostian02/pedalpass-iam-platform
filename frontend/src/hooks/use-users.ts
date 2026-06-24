import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { authService } from '@/services/auth.service';
import type { PaginationParams } from '@/types/api';
import type { AdminCreateUserRequest, UpdateUserRequest } from '@/types/user';
import { toast } from 'sonner';
import i18n from '@/lib/i18n';

export function useUsers(params: PaginationParams = {}, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => userService.getUsers(params),
    ...options,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => userService.getUserById(id),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: AdminCreateUserRequest) => authService.adminCreateUser(request),
    onSuccess: () => {
      console.log('[useCreateUser] Mutation success, invalidating users query');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(i18n.t('toast.userCreated'));
    },
    onError: (error: Error) => {
      toast.error(error.message || i18n.t('toast.failedCreateUser'));
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: UpdateUserRequest }) =>
      userService.updateUser(id, request),
    onSuccess: () => {
      console.log('[useUpdateUser] Mutation success');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(i18n.t('toast.userUpdated'));
    },
    onError: (error: Error) => {
      toast.error(error.message || i18n.t('toast.failedUpdateUser'));
    },
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userService.deactivateUser(id),
    onSuccess: () => {
      console.log('[useDeactivateUser] Mutation success');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(i18n.t('toast.userDeactivated'));
    },
    onError: (error: Error) => {
      toast.error(error.message || i18n.t('toast.failedDeactivateUser'));
    },
  });
}

export function useAssignRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleName }: { userId: string; roleName: string }) =>
      userService.assignRole(userId, roleName),
    onSuccess: () => {
      console.log('[useAssignRole] Mutation success');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(i18n.t('toast.roleAssigned'));
    },
    onError: (error: Error) => {
      toast.error(error.message || i18n.t('toast.failedAssignRole'));
    },
  });
}

export function useRemoveRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleName }: { userId: string; roleName: string }) =>
      userService.removeRole(userId, roleName),
    onSuccess: () => {
      console.log('[useRemoveRole] Mutation success');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(i18n.t('toast.roleRemoved'));
    },
    onError: (error: Error) => {
      toast.error(error.message || i18n.t('toast.failedRemoveRole'));
    },
  });
}
