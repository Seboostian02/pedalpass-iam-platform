import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateAccessRequest } from '@/hooks/use-access-requests';
import type { ResourceResponse } from '@/types/resource';
import { KeyRound } from 'lucide-react';

const requestAccessSchema = z.object({
  accessLevel: z.string().optional(),
  justification: z.string().min(1, 'Justification is required'),
  scheduledStart: z.string().optional(),
  scheduledEnd: z.string().optional(),
});

type RequestAccessForm = z.infer<typeof requestAccessSchema>;

interface RequestAccessDialogProps {
  resource: ResourceResponse | null;
  open: boolean;
  onClose: () => void;
}

export function RequestAccessDialog({ resource, open, onClose }: RequestAccessDialogProps) {
  const createRequest = useCreateAccessRequest();
  const isPhysical = resource?.resourceType === 'PHYSICAL';

  const form = useForm<RequestAccessForm>({
    resolver: zodResolver(requestAccessSchema),
    defaultValues: {
      accessLevel: 'READ',
      justification: '',
      scheduledStart: '',
      scheduledEnd: '',
    },
  });

  console.log('[RequestAccessDialog] Open:', open, 'Resource:', resource?.name, 'Type:', resource?.resourceType);

  const onSubmit = (values: RequestAccessForm) => {
    if (!resource) return;

    // Client-side validation for physical resources
    if (isPhysical && (!values.scheduledStart || !values.scheduledEnd)) {
      if (!values.scheduledStart) form.setError('scheduledStart', { message: 'Start date is required' });
      if (!values.scheduledEnd) form.setError('scheduledEnd', { message: 'End date is required' });
      return;
    }

    // Client-side validation for digital resources
    if (!isPhysical && !values.accessLevel) {
      form.setError('accessLevel', { message: 'Access level is required' });
      return;
    }

    console.log('[RequestAccessDialog] Submitting access request for:', resource.id, values);
    createRequest.mutate({
      resourceId: resource.id,
      accessLevel: isPhysical ? 'RESERVE' : values.accessLevel,
      justification: values.justification,
      scheduledStart: values.scheduledStart || undefined,
      scheduledEnd: values.scheduledEnd || undefined,
    }, {
      onSuccess: () => {
        console.log('[RequestAccessDialog] Access request submitted successfully');
        form.reset();
        onClose();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            {isPhysical ? 'Reserve Resource' : 'Request Access'}
          </DialogTitle>
          {resource && (
            <DialogDescription>
              {isPhysical ? 'Reserving' : 'Requesting access to'}{' '}
              <span className="font-medium text-foreground">{resource.name}</span>
              {resource.requiresApproval && ' (requires approval)'}
            </DialogDescription>
          )}
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!isPhysical && (
              <FormField
                control={form.control}
                name="accessLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Access Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="READ">Read</SelectItem>
                        <SelectItem value="WRITE">Write</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="justification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Justification</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={isPhysical
                        ? "Explain why you need to reserve this resource..."
                        : "Explain why you need access to this resource..."}
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="scheduledStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date{isPhysical ? '' : ' (optional)'}</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="scheduledEnd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date{isPhysical ? '' : ' (optional)'}</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={createRequest.isPending}>
                {createRequest.isPending ? 'Submitting...' : isPhysical ? 'Submit Reservation' : 'Submit Request'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
