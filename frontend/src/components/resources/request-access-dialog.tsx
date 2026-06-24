import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { tEnum } from '@/lib/i18n-utils';
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

interface RequestAccessDialogProps {
  resource: ResourceResponse | null;
  open: boolean;
  onClose: () => void;
  defaultStart?: string;
  defaultEnd?: string;
}

export function RequestAccessDialog({ resource, open, onClose, defaultStart, defaultEnd }: RequestAccessDialogProps) {
  const { t } = useTranslation();
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

  const requestAccessSchema = useMemo(() => z.object({
    resourceId: z.string().min(1, t('validation.resourceRequired')),
    accessLevel: z.string().optional(),
    justification: z.string().min(1, t('validation.justificationRequired')),
    scheduledStart: z.string().optional(),
    scheduledEnd: z.string().optional(),
  }), [t]);

  type RequestAccessForm = z.infer<typeof requestAccessSchema>;

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
      if (!values.scheduledStart) form.setError('scheduledStart', { message: t('validation.startDateRequired') });
      if (!values.scheduledEnd) form.setError('scheduledEnd', { message: t('validation.endDateRequired') });
      return;
    }

    if (!targetIsPhysical && !values.accessLevel) {
      form.setError('accessLevel', { message: t('validation.accessLevelRequired') });
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
            {isPhysical ? t('resources.reserveResource') : t('resources.requestAccess')}
          </DialogTitle>
          <DialogDescription>
            {t('resources.selectResourceDescription')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Type / Category filters */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">{t('resources.filterByType')}</label>
                <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setCategoryFilter('all'); }}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('resources.allTypes')}</SelectItem>
                    {(filterOptions?.types ?? []).map((tp: string) => (
                      <SelectItem key={tp} value={tp}>{tEnum('resourceType', tp)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">{t('resources.filterByCategory')}</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('resources.allCategories')}</SelectItem>
                    {(filteredOptions?.categories ?? []).map((c: string) => (
                      <SelectItem key={c} value={c}>{tEnum('resourceCategory', c)}</SelectItem>
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
                  <FormLabel>{t('resources.resource')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('resources.selectResourcePlaceholder')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredResources.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.name} ({tEnum('resourceType', r.resourceType)} / {tEnum('resourceCategory', r.resourceCategory)})
                        </SelectItem>
                      ))}
                      {filteredResources.length === 0 && (
                        <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                          {t('resources.noResourcesMatchFilters')}
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  {selectedResource && (
                    <p className="text-xs text-muted-foreground">
                      {selectedResource.description}
                      {selectedResource.requiresApproval && ` — ${t('resources.requiresApproval').toLowerCase()}`}
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
                    <FormLabel>{t('resources.accessLevel')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(filterOptions?.accessLevels ?? []).map((level: string) => (
                          <SelectItem key={level} value={level}>
                            {tEnum('accessLevel', level)}
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
                  <FormLabel>{t('resources.justification')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={isPhysical
                        ? t('resources.justificationPlaceholderPhysical')
                        : t('resources.justificationPlaceholderDigital')}
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
                    <FormLabel>{t('resources.startDate')}{isPhysical ? '' : ' (optional)'}</FormLabel>
                    <FormControl>
                      <DateTimePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={t('resources.pickStart')}
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
                    <FormLabel>{t('resources.endDate')}{isPhysical ? '' : ' (optional)'}</FormLabel>
                    <FormControl>
                      <DateTimePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={t('resources.pickEnd')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
              <Button type="submit" disabled={createRequest.isPending || !selectedResourceId}>
                {createRequest.isPending ? t('resources.submitting') : isPhysical ? t('resources.submitReservation') : t('resources.submitRequest')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
