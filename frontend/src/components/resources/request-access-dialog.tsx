import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateAccessRequest } from '@/hooks/use-access-requests';
import { useResources, useResourceFilterOptions } from '@/hooks/use-resources';
import type { ResourceResponse } from '@/types/resource';
import { KeyRound } from 'lucide-react';

const requestAccessSchema = z.object({
  resourceId: z.string().min(1, 'Resource is required'),
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
  defaultStart?: string;
  defaultEnd?: string;
}

export function RequestAccessDialog({ resource, open, onClose, defaultStart, defaultEnd }: RequestAccessDialogProps) {
  const createRequest = useCreateAccessRequest();
  const { data: filterOptions } = useResourceFilterOptions();
  const { data: resourcesPage } = useResources({ page: 0, size: 100 }, { enabled: open });

  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const { data: filteredOptions } = useResourceFilterOptions(typeFilter);

  const allResources = resourcesPage?.content ?? [];

  const filteredResources = useMemo(() => {
    return allResources.filter(r => {
      if (!r.active) return false;
      if (typeFilter !== 'all' && r.resourceType !== typeFilter) return false;
      if (categoryFilter !== 'all' && r.resourceCategory !== categoryFilter) return false;
      return true;
    });
  }, [allResources, typeFilter, categoryFilter]);

  const form = useForm<RequestAccessForm>({
    resolver: zodResolver(requestAccessSchema),
    defaultValues: {
      resourceId: '',
      accessLevel: 'READ',
      justification: '',
      scheduledStart: '',
      scheduledEnd: '',
    },
  });

  const selectedResourceId = form.watch('resourceId');
  const selectedResource = allResources.find(r => r.id === selectedResourceId) || null;
  const isPhysical = selectedResource?.resourceType === 'PHYSICAL';

  // Pre-fill when resource prop or defaults change
  useEffect(() => {
    if (!open) return;
    const hasPreselected = resource && resource.id;
    form.reset({
      resourceId: hasPreselected ? resource.id : '',
      accessLevel: 'READ',
      justification: '',
      scheduledStart: defaultStart || '',
      scheduledEnd: defaultEnd || '',
    });
    setTypeFilter('all');
    setCategoryFilter('all');
  }, [open, resource, defaultStart, defaultEnd, form]);

  const onSubmit = (values: RequestAccessForm) => {
    const targetResource = allResources.find(r => r.id === values.resourceId);
    if (!targetResource) return;

    const targetIsPhysical = targetResource.resourceType === 'PHYSICAL';

    if (targetIsPhysical && (!values.scheduledStart || !values.scheduledEnd)) {
      if (!values.scheduledStart) form.setError('scheduledStart', { message: 'Start date is required' });
      if (!values.scheduledEnd) form.setError('scheduledEnd', { message: 'End date is required' });
      return;
    }

    if (!targetIsPhysical && !values.accessLevel) {
      form.setError('accessLevel', { message: 'Access level is required' });
      return;
    }

    createRequest.mutate({
      resourceId: values.resourceId,
      accessLevel: targetIsPhysical ? 'RESERVE' : values.accessLevel,
      justification: values.justification,
      scheduledStart: values.scheduledStart || undefined,
      scheduledEnd: values.scheduledEnd || undefined,
    }, {
      onSuccess: () => {
        form.reset();
        onClose();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            {isPhysical ? 'Reserve Resource' : 'Request Access'}
          </DialogTitle>
          <DialogDescription>
            Select a resource and fill in the details below.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Type / Category filters */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Filter by type</label>
                <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setCategoryFilter('all'); }}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {(filterOptions?.types ?? []).map((t: string) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Filter by category</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {(filteredOptions?.categories ?? []).map((c: string) => (
                      <SelectItem key={c} value={c}>{c.replace('_', ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Resource selector */}
            <FormField
              control={form.control}
              name="resourceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resource</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a resource..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredResources.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.name} ({r.resourceType} / {r.resourceCategory.replace('_', ' ')})
                        </SelectItem>
                      ))}
                      {filteredResources.length === 0 && (
                        <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                          No resources match filters
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  {selectedResource && (
                    <p className="text-xs text-muted-foreground">
                      {selectedResource.description}
                      {selectedResource.requiresApproval && ' — requires approval'}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Access level for digital resources */}
            {selectedResource && !isPhysical && (
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
                        {(filterOptions?.accessLevels ?? []).map((level: string) => (
                          <SelectItem key={level} value={level}>
                            {level.charAt(0) + level.slice(1).toLowerCase()}
                          </SelectItem>
                        ))}
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

            {/* Date fields — always show but mark required for physical */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="scheduledStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date{isPhysical ? '' : ' (optional)'}</FormLabel>
                    <FormControl>
                      <DateTimePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Pick start..."
                      />
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
                      <DateTimePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Pick end..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={createRequest.isPending || !selectedResourceId}>
                {createRequest.isPending ? 'Submitting...' : isPhysical ? 'Submit Reservation' : 'Submit Request'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
