import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { auditService } from '@/services/audit.service';
import type { PaginationParams } from '@/types/api';
import type { ResolveAlertRequest, DismissAlertRequest, SeverityLevel } from '@/types/audit';
import { toast } from 'sonner';

export function useAuditLogs(params: PaginationParams = {}) {
  return useQuery({
    queryKey: ['audit-logs', params],
    queryFn: () => auditService.getLogs(params),
  });
}

export function useAuditLogsByUser(userId: string, params: PaginationParams = {}) {
  return useQuery({
    queryKey: ['audit-logs', 'user', userId, params],
    queryFn: () => auditService.getLogsByUser(userId, params),
    enabled: !!userId,
  });
}

export function useAuditLogsBySeverity(severity: SeverityLevel, params: PaginationParams = {}) {
  return useQuery({
    queryKey: ['audit-logs', 'severity', severity, params],
    queryFn: () => auditService.getLogsBySeverity(severity, params),
  });
}

export function useAuditLogsByAction(action: string, params: PaginationParams = {}) {
  return useQuery({
    queryKey: ['audit-logs', 'action', action, params],
    queryFn: () => auditService.getLogsByAction(action, params),
    enabled: !!action,
  });
}

export function useAuditLogsByRange(start: string, end: string, params: PaginationParams = {}) {
  return useQuery({
    queryKey: ['audit-logs', 'range', start, end, params],
    queryFn: () => auditService.getLogsByRange(start, end, params),
    enabled: !!start && !!end,
  });
}

export function useAuditFilters() {
  return useQuery({
    queryKey: ['audit-filters'],
    queryFn: () => auditService.getFilterOptions(),
  });
}

export function useAlerts(params: PaginationParams = {}) {
  return useQuery({
    queryKey: ['alerts', params],
    queryFn: () => auditService.getAlerts(params),
  });
}

export function useOpenAlerts(params: PaginationParams = {}, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['alerts', 'open', params],
    queryFn: () => auditService.getOpenAlerts(params),
    ...options,
  });
}

export function useResolveAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request?: ResolveAlertRequest }) =>
      auditService.resolveAlert(id, request),
    onSuccess: () => {
      console.log('[useResolveAlert] Mutation success');
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success('Alert resolved');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to resolve alert');
    },
  });
}

export function useDismissAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request?: DismissAlertRequest }) =>
      auditService.dismissAlert(id, request),
    onSuccess: () => {
      console.log('[useDismissAlert] Mutation success');
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success('Alert dismissed');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to dismiss alert');
    },
  });
}
