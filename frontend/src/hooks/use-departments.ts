import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentService } from '@/services/department.service';
import type { DepartmentRequest } from '@/types/user';
import { toast } from 'sonner';
import i18n from '@/lib/i18n';

export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentService.getDepartments(),
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: DepartmentRequest) => departmentService.createDepartment(request),
    onSuccess: () => {
      console.log('[useCreateDepartment] Mutation success');
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success(i18n.t('toast.departmentCreated'));
    },
    onError: (error: Error) => {
      toast.error(error.message || i18n.t('toast.failedCreateDepartment'));
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: DepartmentRequest }) =>
      departmentService.updateDepartment(id, request),
    onSuccess: () => {
      console.log('[useUpdateDepartment] Mutation success');
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success(i18n.t('toast.departmentUpdated'));
    },
    onError: (error: Error) => {
      toast.error(error.message || i18n.t('toast.failedUpdateDepartment'));
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => departmentService.deleteDepartment(id),
    onSuccess: () => {
      console.log('[useDeleteDepartment] Mutation success');
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success(i18n.t('toast.departmentDeleted'));
    },
    onError: (error: Error) => {
      toast.error(error.message || i18n.t('toast.failedDeleteDepartment'));
    },
  });
}
