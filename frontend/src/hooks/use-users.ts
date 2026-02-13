import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { authService } from '@/services/auth.service';
import type { PaginationParams } from '@/types/api';
import type { AdminCreateUserRequest, UpdateUserRequest } from '@/types/user';
import { toast } from 'sonner';

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
      toast.success('User created successfully. Temporary password sent to email.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create user');
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
      toast.success('User updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update user');
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
      toast.success('User deactivated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to deactivate user');
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
      toast.success('Role assigned successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to assign role');
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
      toast.success('Role removed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove role');
    },
  });
}
