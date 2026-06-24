import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { tEnum } from '@/lib/i18n-utils';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateUser } from '@/hooks/use-users';
import { useDepartments } from '@/hooks/use-departments';
import { useRoles } from '@/hooks/use-roles';
import { UserPlus } from 'lucide-react';

interface CreateUserDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateUserDialog({ open, onClose }: CreateUserDialogProps) {
  const { t } = useTranslation();
  const createUser = useCreateUser();
  const { data: departments } = useDepartments();
  const { data: roles } = useRoles();

  const createUserSchema = useMemo(() => z.object({
    email: z.string().email(t('validation.invalidEmail')),
    firstName: z.string().min(1, t('validation.firstNameRequired')),
    lastName: z.string().min(1, t('validation.lastNameRequired')),
    departmentId: z.string().optional(),
    roleName: z.string().optional(),
  }), [t]);

  type CreateUserForm = z.infer<typeof createUserSchema>;

  const form = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      departmentId: '',
      roleName: '',
    },
  });

  console.log('[CreateUserDialog] Open:', open);

  const onSubmit = (values: CreateUserForm) => {
    console.log('[CreateUserDialog] Submitting:', values);
    const request = {
      email: values.email,
      firstName: values.firstName,
      lastName: values.lastName,
      departmentId: values.departmentId || undefined,
      roleName: values.roleName || undefined,
    };
    createUser.mutate(request, {
      onSuccess: () => {
        console.log('[CreateUserDialog] User created successfully');
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
            <UserPlus className="h-5 w-5" />
            {t('users.createUser')}
          </DialogTitle>
          <DialogDescription>
            {t('users.createUserDescription')}
          </DialogDescription>
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
                      <Input placeholder={t('auth.firstNamePlaceholder')} {...field} />
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
                      <Input placeholder={t('auth.lastNamePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('auth.email')}</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder={t('auth.emailPlaceholder')} {...field} />
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
                  <FormLabel>{t('users.departmentOptional')}</FormLabel>
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

            <FormField
              control={form.control}
              name="roleName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('users.initialRoleOptional')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('users.selectRole')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roles?.map((role) => (
                        <SelectItem key={role.id} value={role.name}>{tEnum('role', role.name)}</SelectItem>
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
              <Button type="submit" disabled={createUser.isPending}>
                {createUser.isPending ? t('users.creating') : t('users.createUser')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
