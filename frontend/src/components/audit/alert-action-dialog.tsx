import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
              ? <><ShieldCheck className="h-5 w-5" /> {t('audit.resolveAlert')}</>
              : <><ShieldOff className="h-5 w-5" /> {t('audit.dismissAlert')}</>}
          </DialogTitle>
          <DialogDescription>
            {action === 'resolve'
              ? t('audit.resolveDescription')
              : t('audit.dismissDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card/50 p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('audit.typeColumn')}</span>
              <span className="font-medium">{alert.alertType}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t('audit.severityColumn')}</span>
              <SeverityBadge severity={alert.severity} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t('audit.statusColumn')}</span>
              <AlertStatusBadge status={alert.status} />
            </div>
            {alert.userEmail && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('audit.userColumn')}</span>
                <span className="font-mono text-xs">{alert.userEmail}</span>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">{t('audit.descriptionLabel')}</span>
              <p className="mt-1 text-xs rounded bg-muted/50 p-2">{alert.description}</p>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('audit.created')}</span>
              <span className="text-xs">{format(new Date(alert.createdAt), 'MMM dd, yyyy HH:mm')}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{action === 'resolve' ? t('audit.commentOptional') : t('audit.reasonOptional')}</Label>
            <Textarea
              placeholder={action === 'resolve' ? t('audit.resolutionPlaceholder') : t('audit.dismissalPlaceholder')}
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
            <Button
              variant={action === 'dismiss' ? 'destructive' : 'default'}
              onClick={handleSubmit}
              disabled={isPending}
            >
              {isPending ? t('common.processing') : action === 'resolve' ? t('audit.resolve') : t('audit.dismiss')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
