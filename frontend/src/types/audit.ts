export type SeverityLevel = 'INFO' | 'WARNING' | 'CRITICAL';
export type AlertStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';

export interface AuditLogResponse {
  id: string;
  eventId: string;
  userId?: string;
  userEmail?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  severity: SeverityLevel;
  ipAddress?: string;
  userAgent?: string;
  details?: string;
  createdAt: string;
}

export interface SecurityAlertResponse {
  id: string;
  alertType: string;
  severity: SeverityLevel;
  status: AlertStatus;
  userId?: string;
  userEmail?: string;
  description: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface ResolveAlertRequest {
  comment?: string;
}

export interface DismissAlertRequest {
  reason?: string;
}
