import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/auth-context';
import { useUser, useUpdateUser } from '@/hooks/use-users';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { User, Shield, Save } from 'lucide-react';

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

export default function ProfilePage() {
  const { state } = useAuth();
  const userId = state.user?.id || '';
  const { data: fullUser, isLoading } = useUser(userId);
  const updateUser = useUpdateUser();

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

      <div className="grid gap-6 md:grid-cols-2">
        {/* Edit Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
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

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Email:</span>
                  <span className="font-mono text-xs">{fullUser?.email}</span>
                </div>

                <Button type="submit" disabled={updateUser.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {updateUser.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Account Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5" />
                Roles & Permissions
              </CardTitle>
            </CardHeader>
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
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Department</span>
                  <span>{fullUser?.departmentName || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account Status</span>
                  <Badge variant="outline" className={fullUser?.active
                    ? 'bg-status-approved/15 text-status-approved border-status-approved/30'
                    : 'bg-status-denied/15 text-status-denied border-status-denied/30'
                  }>
                    {fullUser?.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">User ID</span>
                  <span className="font-mono text-xs text-muted-foreground">{fullUser?.id}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
