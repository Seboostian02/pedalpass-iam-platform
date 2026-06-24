import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUpdateUser } from '@/hooks/use-users';
import { useDepartments } from '@/hooks/use-departments';
import type { UserResponse } from '@/types/user';
import { Pencil } from 'lucide-react';

interface EditUserDialogProps {
  user: UserResponse | null;
  open: boolean;
  onClose: () => void;
}

export function EditUserDialog({ user, open, onClose }: EditUserDialogProps) {
  const { t } = useTranslation();
  const updateUser = useUpdateUser();
  const { data: departments } = useDepartments();

  const editUserSchema = useMemo(() => z.object({
    firstName: z.string().min(1, t('validation.firstNameRequired')),
    lastName: z.string().min(1, t('validation.lastNameRequired')),
    phoneNumber: z.string().optional(),
    departmentId: z.string().optional(),
  }), [t]);

  type EditUserForm = z.infer<typeof editUserSchema>;

  const form = useForm<EditUserForm>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      departmentId: '',
    },
  });

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      console.log('[EditUserDialog] Loading user data:', user.email);
      form.reset({
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber || '',
        departmentId: user.departmentId || '',
      });
    }
  }, [user, form]);

  const onSubmit = (values: EditUserForm) => {
    if (!user) return;
    console.log('[EditUserDialog] Submitting update for:', user.id, values);
    const request = {
      ...values,
      departmentId: values.departmentId || undefined,
      phoneNumber: values.phoneNumber || undefined,
    };
    updateUser.mutate({ id: user.id, request }, {
      onSuccess: () => {
        console.log('[EditUserDialog] User updated successfully');
        onClose();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            {t('users.editUser')}
          </DialogTitle>
          <DialogDescription>{t('users.editUserDescription')}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.firstName')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.lastName')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('users.phone')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('profile.phonePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="departmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('users.department')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('users.selectDepartment')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departments?.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={updateUser.isPending}>
                {updateUser.isPending ? t('users.saving') : t('users.saveChanges')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
