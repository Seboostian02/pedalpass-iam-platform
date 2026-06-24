import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/context/auth-context';
import { useUser, useUpdateUser } from '@/hooks/use-users';
import { authService } from '@/services/auth.service';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { User, Shield, Save, KeyRound, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { ChangePasswordRequest } from '@/types/auth';

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-severity-critical/15 text-severity-critical border-severity-critical/30',
  SECURITY_OFFICER: 'bg-severity-warning/15 text-severity-warning border-severity-warning/30',
  RESOURCE_MANAGER: 'bg-status-pending/15 text-status-pending border-status-pending/30',
  USER: 'bg-primary/15 text-primary border-primary/30',
  GUEST: 'bg-muted-foreground/15 text-muted-foreground border-muted-foreground/30',
};

export default function ProfilePage() {
  const { t } = useTranslation();

  const profileSchema = useMemo(() => z.object({
    firstName: z.string().min(1, t('validation.firstNameRequired')),
    lastName: z.string().min(1, t('validation.lastNameRequired')),
    phoneNumber: z.string().optional(),
  }), [t]);

  type ProfileForm = z.infer<typeof profileSchema>;

  const passwordSchema = useMemo(() => z.object({
    oldPassword: z.string().min(1, t('validation.currentPasswordRequired')),
    newPassword: z.string()
      .min(8, t('validation.passwordMinLength'))
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, t('validation.passwordComplexity')),
    confirmPassword: z.string().min(1, t('validation.confirmPasswordRequired')),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: t('validation.passwordsDoNotMatch'),
    path: ['confirmPassword'],
  }), [t]);

  type PasswordForm = z.infer<typeof passwordSchema>;
  const { state } = useAuth();
  const userId = state.user?.id || '';
  const { data: fullUser, isLoading } = useUser(userId);
  const updateUser = useUpdateUser();

  const [profileOpen, setProfileOpen] = useState(false);
  const [rolesOpen, setRolesOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  const changePassword = useMutation({
    mutationFn: (request: ChangePasswordRequest) => authService.changePassword(request),
    onSuccess: () => {
      toast.success(t('toast.passwordChanged'));
      passwordForm.reset();
    },
    onError: (error: Error) => {
      toast.error(error.message || t('toast.failedChangePassword'));
    },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onPasswordSubmit = (values: PasswordForm) => {
    changePassword.mutate({
      oldPassword: values.oldPassword,
      newPassword: values.newPassword,
    });
  };

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
    },
  });

  useEffect(() => {
    if (fullUser) {
      console.log('[ProfilePage] Loading user profile:', fullUser.email);
      form.reset({
        firstName: fullUser.firstName,
        lastName: fullUser.lastName,
        phoneNumber: fullUser.phoneNumber || '',
      });
    }
  }, [fullUser, form]);

  console.log('[ProfilePage] Rendering for user:', state.user?.email);

  const onSubmit = (values: ProfileForm) => {
    console.log('[ProfilePage] Updating profile:', values);
    updateUser.mutate({
      id: userId,
      request: {
        firstName: values.firstName,
        lastName: values.lastName,
        phoneNumber: values.phoneNumber || undefined,
      },
    });
  };

  if (isLoading) {
    return <LoadingSpinner className="py-12" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('profile.title')}
        description={t('profile.description')}
      />

      <div className="grid items-start gap-6 md:grid-cols-2">
        {/* Edit Profile */}
        <Card className="overflow-hidden">
          <CardHeader
            className="cursor-pointer select-none"
            onClick={() => setProfileOpen((v) => !v)}
          >
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5" />
              {t('profile.personalInformation')}
              <ChevronDown
                className={cn(
                  'ml-auto h-4 w-4 text-muted-foreground transition-transform duration-300',
                  profileOpen && 'rotate-180',
                )}
              />
            </CardTitle>
          </CardHeader>
          <div
            className="grid transition-[grid-template-rows] duration-300 ease-in-out"
            style={{ gridTemplateRows: profileOpen ? '1fr' : '0fr' }}
          >
            <div className="overflow-hidden">
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('profile.firstName')}</FormLabel>
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
                          <FormLabel>{t('profile.lastName')}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('profile.phoneNumber')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('profile.phonePlaceholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
                      <span className="shrink-0">{t('profile.emailLabel')}</span>
                      <span className="min-w-0 truncate font-mono text-xs">{fullUser?.email}</span>
                    </div>

                    <Button type="submit" disabled={updateUser.isPending}>
                      <Save className="h-4 w-4 mr-2" />
                      {updateUser.isPending ? t('profile.saving') : t('profile.saveChanges')}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </div>
          </div>
        </Card>

        {/* Account Info */}
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <CardHeader
              className="cursor-pointer select-none"
              onClick={() => setRolesOpen((v) => !v)}
            >
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5" />
                {t('profile.rolesPermissions')}
                <ChevronDown
                  className={cn(
                    'ml-auto h-4 w-4 text-muted-foreground transition-transform duration-300',
                    rolesOpen && 'rotate-180',
                  )}
                />
              </CardTitle>
            </CardHeader>
            <div
              className="grid transition-[grid-template-rows] duration-300 ease-in-out"
              style={{ gridTemplateRows: rolesOpen ? '1fr' : '0fr' }}
            >
              <div className="overflow-hidden">
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">{t('profile.assignedRoles')}</p>
                    <div className="flex flex-wrap gap-2">
                      {fullUser?.roles.map((role) => (
                        <Badge key={role} variant="outline" className={`${ROLE_COLORS[role] || ''}`}>
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <div className="flex min-w-0 items-center justify-between gap-2">
                      <span className="shrink-0 text-muted-foreground">{t('profile.department')}</span>
                      <span className="min-w-0 truncate">{fullUser?.departmentName || '—'}</span>
                    </div>
                    <div className="flex min-w-0 items-center justify-between gap-2">
                      <span className="shrink-0 text-muted-foreground">{t('profile.accountStatus')}</span>
                      <Badge variant="outline" className={fullUser?.active
                        ? 'bg-status-approved/15 text-status-approved border-status-approved/30'
                        : 'bg-status-denied/15 text-status-denied border-status-denied/30'
                      }>
                        {fullUser?.active ? t('common.active') : t('common.inactive')}
                      </Badge>
                    </div>
                    <div className="flex min-w-0 items-center justify-between gap-2">
                      <span className="shrink-0 text-muted-foreground">{t('profile.userId')}</span>
                      <span className="min-w-0 truncate font-mono text-xs text-muted-foreground">{fullUser?.id}</span>
                    </div>
                  </div>
                </CardContent>
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader
              className="cursor-pointer select-none"
              onClick={() => setPasswordOpen((v) => !v)}
            >
              <CardTitle className="flex items-center gap-2 text-lg">
                <KeyRound className="h-5 w-5" />
                {t('profile.changePassword')}
                <ChevronDown
                  className={cn(
                    'ml-auto h-4 w-4 text-muted-foreground transition-transform duration-300',
                    passwordOpen && 'rotate-180',
                  )}
                />
              </CardTitle>
            </CardHeader>
            <div
              className="grid transition-[grid-template-rows] duration-300 ease-in-out"
              style={{ gridTemplateRows: passwordOpen ? '1fr' : '0fr' }}
            >
              <div className="overflow-hidden">
                <CardContent>
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                      <FormField
                        control={passwordForm.control}
                        name="oldPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('profile.currentPassword')}</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('profile.newPassword')}</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('profile.confirmNewPassword')}</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" disabled={changePassword.isPending}>
                        <KeyRound className="h-4 w-4 mr-2" />
                        {changePassword.isPending ? t('profile.changing') : t('profile.changePasswordButton')}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
