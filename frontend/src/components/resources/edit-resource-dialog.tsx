import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useUpdateResource } from '@/hooks/use-resources';
import type { ResourceResponse } from '@/types/resource';
import { Pencil } from 'lucide-react';

interface EditResourceDialogProps {
  resource: ResourceResponse | null;
  open: boolean;
  onClose: () => void;
}

export function EditResourceDialog({ resource, open, onClose }: EditResourceDialogProps) {
  const { t } = useTranslation();
  const updateResource = useUpdateResource();

  const editResourceSchema = useMemo(() => z.object({
    name: z.string().min(1, t('validation.nameRequired')),
    description: z.string().optional(),
    location: z.string().optional(),
    capacity: z.string().optional().refine(
      (val) => !val || (Number.isInteger(Number(val)) && Number(val) > 0),
      { message: t('validation.positiveInteger') }
    ),
    requiresApproval: z.boolean(),
    active: z.boolean(),
  }), [t]);

  type EditResourceForm = z.infer<typeof editResourceSchema>;

  const form = useForm<EditResourceForm>({
    resolver: zodResolver(editResourceSchema),
    defaultValues: {
      name: '',
      description: '',
      location: '',
      capacity: '',
      requiresApproval: true,
      active: true,
    },
  });

  useEffect(() => {
    if (resource) {
      console.log('[EditResourceDialog] Loading resource data:', resource.name);
      form.reset({
        name: resource.name,
        description: resource.description || '',
        location: resource.location || '',
        capacity: resource.capacity ? String(resource.capacity) : '',
        requiresApproval: resource.requiresApproval,
        active: resource.active,
      });
    }
  }, [resource, form]);

  const onSubmit = (values: EditResourceForm) => {
    if (!resource) return;
    console.log('[EditResourceDialog] Submitting update for:', resource.id, values);
    const request = {
      name: values.name,
      description: values.description || undefined,
      location: values.location || undefined,
      capacity: values.capacity ? Number(values.capacity) : undefined,
      requiresApproval: values.requiresApproval,
      active: values.active,
    };
    updateResource.mutate({ id: resource.id, request }, {
      onSuccess: () => {
        console.log('[EditResourceDialog] Resource updated successfully');
        onClose();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            {t('resources.editResource')}
          </DialogTitle>
          <DialogDescription>{t('resources.editResourceDescription')}</DialogDescription>
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
                    <Input {...field} />
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
                  <FormLabel>{t('resources.description')}</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('resources.location')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>{t('resources.capacity')}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
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

            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <FormLabel className="text-sm font-medium">{t('resources.activeLabel')}</FormLabel>
                    <p className="text-xs text-muted-foreground">
                      {field.value
                        ? t('resources.resourceCurrentlyActive')
                        : t('resources.deactivateWarning')}
                    </p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
              <Button type="submit" disabled={updateResource.isPending}>
                {updateResource.isPending ? t('resources.saving') : t('resources.saveChanges')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
