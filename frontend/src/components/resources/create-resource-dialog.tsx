import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { tEnum } from '@/lib/i18n-utils';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateResource, useResourceFilterOptions } from '@/hooks/use-resources';
import type { ResourceType, ResourceCategory } from '@/types/resource';
import { Plus } from 'lucide-react';

interface CreateResourceDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateResourceDialog({ open, onClose }: CreateResourceDialogProps) {
  const { t } = useTranslation();
  const createResource = useCreateResource();
  const { data: filterOptions } = useResourceFilterOptions();

  const createResourceSchema = useMemo(() => z.object({
    name: z.string().min(1, t('validation.nameRequired')),
    description: z.string().optional(),
    resourceType: z.string().min(1, t('validation.typeRequired')),
    resourceCategory: z.string().min(1, t('validation.categoryRequired')),
    location: z.string().optional(),
    capacity: z.string().optional().refine(
      (val) => !val || (Number.isInteger(Number(val)) && Number(val) > 0),
      { message: t('validation.positiveInteger') }
    ),
    requiresApproval: z.boolean(),
  }), [t]);

  type CreateResourceForm = z.infer<typeof createResourceSchema>;

  const form = useForm<CreateResourceForm>({
    resolver: zodResolver(createResourceSchema),
    defaultValues: {
      name: '',
      description: '',
      resourceType: '',
      resourceCategory: '',
      location: '',
      capacity: '',
      requiresApproval: true,
    },
  });

  console.log('[CreateResourceDialog] Open:', open);

  const onSubmit = (values: CreateResourceForm) => {
    console.log('[CreateResourceDialog] Submitting:', values);
    const request = {
      name: values.name,
      resourceType: values.resourceType as ResourceType,
      resourceCategory: values.resourceCategory as ResourceCategory,
      description: values.description || undefined,
      location: values.location || undefined,
      capacity: values.capacity ? Number(values.capacity) : undefined,
      requiresApproval: values.requiresApproval,
    };
    createResource.mutate(request, {
      onSuccess: () => {
        console.log('[CreateResourceDialog] Resource created successfully');
        form.reset();
        onClose();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {t('resources.createResource')}
          </DialogTitle>
          <DialogDescription>{t('resources.createResourceDescription')}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('resources.name')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('resources.namePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('resources.descriptionOptional')}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t('resources.descriptionPlaceholder')} rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="resourceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('resources.type')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(filterOptions?.types ?? []).map((type: string) => (
                          <SelectItem key={type} value={type}>{tEnum('resourceType', type)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="resourceCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('resources.category')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(filterOptions?.categories ?? []).map((cat: string) => (
                          <SelectItem key={cat} value={cat}>{tEnum('resourceCategory', cat)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('resources.locationOptional')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('resources.locationPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('resources.capacityOptional')}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="requiresApproval"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <FormLabel className="text-sm font-medium">{t('resources.requiresApproval')}</FormLabel>
                    <p className="text-xs text-muted-foreground">{t('resources.requiresApprovalDescription')}</p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
              <Button type="submit" disabled={createResource.isPending}>
                {createResource.isPending ? t('resources.creating') : t('resources.createResource')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
