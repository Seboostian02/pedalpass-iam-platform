import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { EmptyState } from '@/components/shared/empty-state';
import { SeverityBadge, AlertStatusBadge } from '@/components/shared/status-badge';
import { AlertActionDialog } from '@/components/audit/alert-action-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuditLogs, useAlerts, useAuditFilters } from '@/hooks/use-audit';
import type { SecurityAlertResponse } from '@/types/audit';
import { ScrollText, ShieldAlert, Search, X, ShieldCheck, ShieldOff } from 'lucide-react';
import { format } from 'date-fns';

function formatDetails(details?: string | null): string {
  if (!details) return '—';
  try {
    const parsed = JSON.parse(details);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return details;
  }
}

export default function AuditPage() {
  // Audit logs state
  const [logsPage, setLogsPage] = useState(0);
  const [logsSize, setLogsSize] = useState(20);
  const [logSearch, setLogSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');

  // Alerts state
  const [alertsPage, setAlertsPage] = useState(0);
  const [alertsSize, setAlertsSize] = useState(10);
  const [alertAction, setAlertAction] = useState<{ alert: SecurityAlertResponse; action: 'resolve' | 'dismiss' } | null>(null);

  const logsQuery = useAuditLogs({ page: logsPage, size: logsSize });
  const alertsQuery = useAlerts({ page: alertsPage, size: alertsSize });
  const { data: auditFilters } = useAuditFilters();

  console.log('[AuditPage] Rendering, logs:', logsQuery.data?.totalElements,
    'alerts:', alertsQuery.data?.totalElements);

  // Client-side filtering for logs
  const filteredLogs = (logsQuery.data?.content || []).filter((log) => {
    const matchesSearch = !logSearch ||
      log.action.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.userEmail?.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.details?.toLowerCase().includes(logSearch.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit & Security"
        description="Monitor system activity and security alerts"
      />

      <Tabs defaultValue="logs">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <ScrollText className="h-4 w-4" />
            <span className="hidden sm:inline">Audit</span> Logs
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span> Alerts
            {alertsQuery.data && alertsQuery.data.totalElements > 0 && (
              <span className="ml-1 rounded-full bg-severity-critical px-1.5 py-0.5 text-xs text-white">
                {alertsQuery.data.totalElements}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Audit Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-0 flex-1 sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                className="pl-9"
              />
              {logSearch && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setLogSearch('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                {(auditFilters?.severityLevels ?? []).map((level: string) => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {logsQuery.isLoading ? (
            <LoadingSpinner className="py-12" />
          ) : filteredLogs.length === 0 ? (
            <EmptyState
              icon={<ScrollText className="h-12 w-12" />}
              title="No audit logs found"
              description={logSearch || severityFilter !== 'all' ? 'Try adjusting your filters' : 'No activity recorded yet'}
            />
          ) : (
            <>
              <div className="overflow-x-auto rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(log.createdAt), 'MMM dd HH:mm:ss')}
                        </TableCell>
                        <TableCell className="font-medium text-sm">{log.action}</TableCell>
                        <TableCell className="font-mono text-xs">{log.userEmail || '—'}</TableCell>
                        <TableCell><SeverityBadge severity={log.severity} /></TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {log.resourceType ? `${log.resourceType}` : '—'}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {log.ipAddress || '—'}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[300px]">
                          {log.details ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="block truncate cursor-help">{log.details}</span>
                              </TooltipTrigger>
                              <TooltipContent side="left" className="max-w-[500px] max-h-[300px] overflow-auto p-3">
                                <pre className="text-xs whitespace-pre-wrap font-mono">
                                  {formatDetails(log.details)}
                                </pre>
                              </TooltipContent>
                            </Tooltip>
                          ) : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {logsQuery.data && (
                <DataTablePagination
                  page={logsPage}
                  totalPages={logsQuery.data.totalPages}
                  totalElements={logsQuery.data.totalElements}
                  size={logsSize}
                  onPageChange={setLogsPage}
                  onSizeChange={(s) => { setLogsSize(s); setLogsPage(0); }}
                />
              )}
            </>
          )}
        </TabsContent>

        {/* Security Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          {alertsQuery.isLoading ? (
            <LoadingSpinner className="py-12" />
          ) : !alertsQuery.data?.content.length ? (
            <EmptyState
              icon={<ShieldAlert className="h-12 w-12" />}
              title="No security alerts"
              description="The system is running smoothly"
            />
          ) : (
            <>
              <div className="overflow-x-auto rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Created</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alertsQuery.data.content.map((alert) => (
                      <TableRow key={alert.id}>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(alert.createdAt), 'MMM dd HH:mm')}
                        </TableCell>
                        <TableCell className="font-medium text-sm">{alert.alertType}</TableCell>
                        <TableCell><SeverityBadge severity={alert.severity} /></TableCell>
                        <TableCell><AlertStatusBadge status={alert.status} /></TableCell>
                        <TableCell className="font-mono text-xs">{alert.userEmail || '—'}</TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[300px]">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="block truncate cursor-help">{alert.description}</span>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="max-w-[500px] max-h-[300px] overflow-auto p-3">
                              <p className="text-xs whitespace-pre-line">{alert.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell className="text-right">
                          {(alert.status === 'OPEN' || alert.status === 'INVESTIGATING') && (
                            <div className="flex items-center gap-1 justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setAlertAction({ alert, action: 'resolve' })}
                              >
                                <ShieldCheck className="h-3 w-3 mr-1" />
                                Resolve
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setAlertAction({ alert, action: 'dismiss' })}
                              >
                                <ShieldOff className="h-3 w-3 mr-1" />
                                Dismiss
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <DataTablePagination
                page={alertsPage}
                totalPages={alertsQuery.data.totalPages}
                totalElements={alertsQuery.data.totalElements}
                size={alertsSize}
                onPageChange={setAlertsPage}
                onSizeChange={(s) => { setAlertsSize(s); setAlertsPage(0); }}
              />
            </>
          )}
        </TabsContent>
      </Tabs>

      <AlertActionDialog
        alert={alertAction?.alert || null}
        action={alertAction?.action || null}
        open={!!alertAction}
        onClose={() => setAlertAction(null)}
      />
    </div>
  );
}
