import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { tEnum } from '@/lib/i18n-utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useReviewRequest } from '@/hooks/use-access-requests';
import type { AccessRequestResponse } from '@/types/resource';
import { CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

interface ReviewDialogProps {
  request: AccessRequestResponse | null;
  open: boolean;
  onClose: () => void;
}

export function ReviewDialog({ request, open, onClose }: ReviewDialogProps) {
  const { t } = useTranslation();
  const [comment, setComment] = useState('');
  const reviewRequest = useReviewRequest();

  console.log('[ReviewDialog] Open:', open, 'Request:', request?.id);

  if (!request) return null;

  const handleReview = (decision: 'APPROVED' | 'DENIED') => {
    console.log('[ReviewDialog] Reviewing request:', request.id, 'decision:', decision);
    reviewRequest.mutate({
      id: request.id,
      request: { decision, reviewComment: comment || undefined },
    }, {
      onSuccess: () => {
        console.log('[ReviewDialog] Review submitted successfully');
        setComment('');
        onClose();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('accessRequests.reviewTitle')}</DialogTitle>
          <DialogDescription>
            {t('accessRequests.reviewDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Request details */}
          <div className="rounded-lg border border-border bg-card/50 p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('accessRequests.user')}</span>
              <span className="font-mono text-xs">{request.userEmail}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('accessRequests.resource')}</span>
              <span className="font-medium">{request.resource.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('accessRequests.accessLevel')}</span>
              <Badge variant="outline" className="text-xs">{tEnum('accessLevel', request.accessLevel)}</Badge>
            </div>
            {request.justification && (
              <div>
                <span className="text-muted-foreground">{t('accessRequests.justification')}</span>
                <p className="mt-1 text-xs rounded bg-muted/50 p-2">{request.justification}</p>
              </div>
            )}
            {request.scheduledStart && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('accessRequests.period')}</span>
                <span className="text-xs">
                  {format(new Date(request.scheduledStart), 'MMM dd, yyyy HH:mm')}
                  {request.scheduledEnd && ` - ${format(new Date(request.scheduledEnd), 'MMM dd, yyyy HH:mm')}`}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('accessRequests.submitted')}</span>
              <span className="text-xs">{format(new Date(request.createdAt), 'MMM dd, yyyy HH:mm')}</span>
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label>{t('accessRequests.reviewCommentOptional')}</Label>
            <Textarea
              placeholder={t('accessRequests.reviewCommentPlaceholder')}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
            <Button
              variant="destructive"
              onClick={() => handleReview('DENIED')}
              disabled={reviewRequest.isPending}
            >
              <XCircle className="h-4 w-4 mr-2" />
              {t('accessRequests.deny')}
            </Button>
            <Button
              onClick={() => handleReview('APPROVED')}
              disabled={reviewRequest.isPending}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {t('accessRequests.approve')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
