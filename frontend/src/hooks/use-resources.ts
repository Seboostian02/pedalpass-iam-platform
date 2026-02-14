import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resourceService } from '@/services/resource.service';
import type { PaginationParams } from '@/types/api';
import type { CreateResourceRequest, UpdateResourceRequest, ResourceType, ResourceCategory } from '@/types/resource';
import { toast } from 'sonner';

export function useResources(params: PaginationParams = {}, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['resources', params],
    queryFn: () => resourceService.getResources(params),
    ...options,
  });
}

export function useResource(id: string) {
  return useQuery({
    queryKey: ['resources', id],
    queryFn: () => resourceService.getResourceById(id),
    enabled: !!id,
  });
}

export function useResourcesByType(type: ResourceType, params: PaginationParams = {}) {
  return useQuery({
    queryKey: ['resources', 'type', type, params],
    queryFn: () => resourceService.getResourcesByType(type, params),
  });
}

export function useResourcesByCategory(category: ResourceCategory, params: PaginationParams = {}) {
  return useQuery({
    queryKey: ['resources', 'category', category, params],
    queryFn: () => resourceService.getResourcesByCategory(category, params),
  });
}

export function useResourceFilterOptions(type?: string) {
  return useQuery({
    queryKey: ['resources', 'filters', type],
    queryFn: () => resourceService.getFilterOptions(type === 'all' ? undefined : type),
  });
}

export function useCreateResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateResourceRequest) => resourceService.createResource(request),
    onSuccess: () => {
      console.log('[useCreateResource] Mutation success');
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      toast.success('Resource created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create resource');
    },
  });
}

export function useUpdateResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: UpdateResourceRequest }) =>
      resourceService.updateResource(id, request),
    onSuccess: () => {
      console.log('[useUpdateResource] Mutation success');
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      toast.success('Resource updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update resource');
    },
  });
}

export function useDeactivateResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => resourceService.deactivateResource(id),
    onSuccess: () => {
      console.log('[useDeactivateResource] Mutation success');
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      toast.success('Resource deactivated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to deactivate resource');
    },
  });
}
