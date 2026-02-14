import { useState, useEffect } from 'react';
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

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phoneNumber: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, 'Must contain uppercase, lowercase, digit and special character (@$!%*?&)'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type PasswordForm = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
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
      toast.success('Password changed successfully');
      passwordForm.reset();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to change password');
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
        title="Profile"
        description="Manage your account information"
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
              Personal Information
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
                          <FormLabel>First Name</FormLabel>
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
                          <FormLabel>Last Name</FormLabel>
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
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+40 712 345 678" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
                      <span className="shrink-0">Email:</span>
                      <span className="min-w-0 truncate font-mono text-xs">{fullUser?.email}</span>
                    </div>

                    <Button type="submit" disabled={updateUser.isPending}>
                      <Save className="h-4 w-4 mr-2" />
                      {updateUser.isPending ? 'Saving...' : 'Save Changes'}
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
                Roles & Permissions
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
                    <p className="text-sm text-muted-foreground mb-2">Assigned Roles</p>
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
                      <span className="shrink-0 text-muted-foreground">Department</span>
                      <span className="min-w-0 truncate">{fullUser?.departmentName || '—'}</span>
                    </div>
                    <div className="flex min-w-0 items-center justify-between gap-2">
                      <span className="shrink-0 text-muted-foreground">Account Status</span>
                      <Badge variant="outline" className={fullUser?.active
                        ? 'bg-status-approved/15 text-status-approved border-status-approved/30'
                        : 'bg-status-denied/15 text-status-denied border-status-denied/30'
                      }>
                        {fullUser?.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="flex min-w-0 items-center justify-between gap-2">
                      <span className="shrink-0 text-muted-foreground">User ID</span>
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
                Change Password
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
                            <FormLabel>Current Password</FormLabel>
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
                            <FormLabel>New Password</FormLabel>
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
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" disabled={changePassword.isPending}>
                        <KeyRound className="h-4 w-4 mr-2" />
                        {changePassword.isPending ? 'Changing...' : 'Change Password'}
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
