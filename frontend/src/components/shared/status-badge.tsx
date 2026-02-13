import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { RequestStatus } from '@/types/resource';
import type { SeverityLevel, AlertStatus } from '@/types/audit';

const STATUS_STYLES: Record<RequestStatus, string> = {
  PENDING: 'bg-status-pending/15 text-status-pending border-status-pending/30',
  APPROVED: 'bg-status-approved/15 text-status-approved border-status-approved/30',
  DENIED: 'bg-status-denied/15 text-status-denied border-status-denied/30',
  COLLISION: 'bg-status-collision/15 text-status-collision border-status-collision/30',
  REVOKED: 'bg-status-revoked/15 text-status-revoked border-status-revoked/30',
  EXPIRED: 'bg-status-expired/15 text-status-expired border-status-expired/30',
};

const SEVERITY_STYLES: Record<SeverityLevel, string> = {
  INFO: 'bg-severity-info/15 text-severity-info border-severity-info/30',
  WARNING: 'bg-severity-warning/15 text-severity-warning border-severity-warning/30',
  CRITICAL: 'bg-severity-critical/15 text-severity-critical border-severity-critical/30',
};

const ALERT_STATUS_STYLES: Record<AlertStatus, string> = {
  OPEN: 'bg-status-denied/15 text-status-denied border-status-denied/30',
  INVESTIGATING: 'bg-status-pending/15 text-status-pending border-status-pending/30',
  RESOLVED: 'bg-status-approved/15 text-status-approved border-status-approved/30',
  DISMISSED: 'bg-status-revoked/15 text-status-revoked border-status-revoked/30',
};

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  return (
    <Badge variant="outline" className={cn('text-xs font-medium', STATUS_STYLES[status])}>
      {status}
    </Badge>
  );
}

export function SeverityBadge({ severity }: { severity: SeverityLevel }) {
  return (
    <Badge variant="outline" className={cn('text-xs font-medium', SEVERITY_STYLES[severity])}>
      {severity}
    </Badge>
  );
}

export function AlertStatusBadge({ status }: { status: AlertStatus }) {
  return (
    <Badge variant="outline" className={cn('text-xs font-medium', ALERT_STATUS_STYLES[status])}>
      {status}
    </Badge>
  );
}
