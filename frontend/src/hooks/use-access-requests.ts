import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accessRequestService } from '@/services/resource.service';
import type { PaginationParams } from '@/types/api';
import type { CreateAccessRequestRequest, ReviewAccessRequestRequest } from '@/types/resource';
import { toast } from 'sonner';
import i18n from '@/lib/i18n';

export function useMyRequests(params: PaginationParams = {}) {
  return useQuery({
    queryKey: ['access-requests', 'my', params],
    queryFn: () => accessRequestService.getMyRequests(params),
  });
}

export function usePendingRequests(params: PaginationParams = {}, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['access-requests', 'pending', params],
    queryFn: () => accessRequestService.getPendingRequests(params),
    ...options,
  });
}

export function useAccessRequest(id: string) {
  return useQuery({
    queryKey: ['access-requests', id],
    queryFn: () => accessRequestService.getRequestById(id),
    enabled: !!id,
  });
}

export function useCreateAccessRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateAccessRequestRequest) => accessRequestService.createRequest(request),
    onSuccess: () => {
      console.log('[useCreateAccessRequest] Mutation success');
      queryClient.invalidateQueries({ queryKey: ['access-requests'] });
      toast.success(i18n.t('toast.accessRequestSubmitted'));
    },
    onError: (error: Error) => {
      toast.error(error.message || i18n.t('toast.failedSubmitRequest'));
    },
  });
}

export function useReviewRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: ReviewAccessRequestRequest }) =>
      accessRequestService.reviewRequest(id, request),
    onSuccess: (data) => {
      console.log('[useReviewRequest] Mutation success, status:', data.status);
      queryClient.invalidateQueries({ queryKey: ['access-requests'] });
      toast.success(i18n.t('toast.requestStatusChanged', { status: data.status.toLowerCase() }));
    },
    onError: (error: Error) => {
      toast.error(error.message || i18n.t('toast.failedReviewRequest'));
    },
  });
}

export function useRevokeRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comment }: { id: string; comment?: string }) =>
      accessRequestService.revokeRequest(id, comment),
    onSuccess: () => {
      console.log('[useRevokeRequest] Mutation success');
      queryClient.invalidateQueries({ queryKey: ['access-requests'] });
      toast.success(i18n.t('toast.accessRevoked'));
    },
    onError: (error: Error) => {
      toast.error(error.message || i18n.t('toast.failedRevokeAccess'));
    },
  });
}
