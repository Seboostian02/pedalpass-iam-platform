import { useEffect } from 'react';
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

const editResourceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  location: z.string().optional(),
  capacity: z.string().optional().refine(
    (val) => !val || (Number.isInteger(Number(val)) && Number(val) > 0),
    { message: 'Must be a positive integer' }
  ),
  requiresApproval: z.boolean(),
});

type EditResourceForm = z.infer<typeof editResourceSchema>;

interface EditResourceDialogProps {
  resource: ResourceResponse | null;
  open: boolean;
  onClose: () => void;
}

export function EditResourceDialog({ resource, open, onClose }: EditResourceDialogProps) {
  const updateResource = useUpdateResource();

  const form = useForm<EditResourceForm>({
    resolver: zodResolver(editResourceSchema),
    defaultValues: {
      name: '',
      description: '',
      location: '',
      capacity: '',
      requiresApproval: true,
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
            Edit Resource
          </DialogTitle>
          <DialogDescription>Update resource details.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
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
                  <FormLabel>Description</FormLabel>
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
                    <FormLabel>Location</FormLabel>
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
                    <FormLabel>Capacity</FormLabel>
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
                    <FormLabel className="text-sm font-medium">Requires Approval</FormLabel>
                    <p className="text-xs text-muted-foreground">Access requests need manual review</p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={updateResource.isPending}>
                {updateResource.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
