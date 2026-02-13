import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { SeverityBadge, AlertStatusBadge } from '@/components/shared/status-badge';
import { useResolveAlert, useDismissAlert } from '@/hooks/use-audit';
import type { SecurityAlertResponse } from '@/types/audit';
import { ShieldCheck, ShieldOff } from 'lucide-react';
import { format } from 'date-fns';

interface AlertActionDialogProps {
  alert: SecurityAlertResponse | null;
  action: 'resolve' | 'dismiss' | null;
  open: boolean;
  onClose: () => void;
}

export function AlertActionDialog({ alert, action, open, onClose }: AlertActionDialogProps) {
  const [text, setText] = useState('');
  const resolveAlert = useResolveAlert();
  const dismissAlert = useDismissAlert();

  console.log('[AlertActionDialog] Open:', open, 'Action:', action, 'Alert:', alert?.id);

  if (!alert || !action) return null;

  const handleSubmit = () => {
    if (action === 'resolve') {
      console.log('[AlertActionDialog] Resolving alert:', alert.id);
      resolveAlert.mutate({ id: alert.id, request: { comment: text || undefined } }, {
        onSuccess: () => { setText(''); onClose(); },
      });
    } else {
      console.log('[AlertActionDialog] Dismissing alert:', alert.id);
      dismissAlert.mutate({ id: alert.id, request: { reason: text || undefined } }, {
        onSuccess: () => { setText(''); onClose(); },
      });
    }
  };

  const isPending = resolveAlert.isPending || dismissAlert.isPending;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {action === 'resolve'
              ? <><ShieldCheck className="h-5 w-5" /> Resolve Alert</>
              : <><ShieldOff className="h-5 w-5" /> Dismiss Alert</>}
          </DialogTitle>
          <DialogDescription>
            {action === 'resolve'
              ? 'Mark this alert as resolved with an optional comment'
              : 'Dismiss this alert with an optional reason'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card/50 p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type</span>
              <span className="font-medium">{alert.alertType}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Severity</span>
              <SeverityBadge severity={alert.severity} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Status</span>
              <AlertStatusBadge status={alert.status} />
            </div>
            {alert.userEmail && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">User</span>
                <span className="font-mono text-xs">{alert.userEmail}</span>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Description</span>
              <p className="mt-1 text-xs rounded bg-muted/50 p-2">{alert.description}</p>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created</span>
              <span className="text-xs">{format(new Date(alert.createdAt), 'MMM dd, yyyy HH:mm')}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{action === 'resolve' ? 'Comment (optional)' : 'Reason (optional)'}</Label>
            <Textarea
              placeholder={action === 'resolve' ? 'Resolution details...' : 'Reason for dismissal...'}
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button
              variant={action === 'dismiss' ? 'destructive' : 'default'}
              onClick={handleSubmit}
              disabled={isPending}
            >
              {isPending ? 'Processing...' : action === 'resolve' ? 'Resolve' : 'Dismiss'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
