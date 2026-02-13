import { useAuth } from '@/context/auth-context';
import { useUsers } from '@/hooks/use-users';
import { useResources } from '@/hooks/use-resources';
import { usePendingRequests } from '@/hooks/use-access-requests';
import { useOpenAlerts } from '@/hooks/use-audit';
import { useUnreadCount } from '@/hooks/use-notifications';
import { StatCard } from '@/components/dashboard/stat-card';
import { ROLES } from '@/lib/constants';
import { Users, Server, Clock, ShieldAlert, Bell } from 'lucide-react';

export default function DashboardPage() {
  const { state, hasAnyRole } = useAuth();
  const isAdmin = hasAnyRole([ROLES.ADMIN]);
  const isSecurityOfficer = hasAnyRole([ROLES.ADMIN, ROLES.SECURITY_OFFICER]);
  const isResourceManager = hasAnyRole([ROLES.ADMIN, ROLES.RESOURCE_MANAGER]);

  // Conditional queries based on role - only fetch what the user has permission to see
  const usersQuery = useUsers({ size: 1 }, { enabled: isAdmin });
  const resourcesQuery = useResources({ size: 1 });
  const pendingQuery = usePendingRequests({ size: 1 }, { enabled: isResourceManager });
  const alertsQuery = useOpenAlerts({ size: 1 }, { enabled: isSecurityOfficer });
  const unreadCountQuery = useUnreadCount();

  console.log('[DashboardPage] Rendering for user:', state.user?.email, 'roles:', state.user?.roles);
  console.log('[DashboardPage] Stats - users:', usersQuery.data?.totalElements,
    'resources:', resourcesQuery.data?.totalElements,
    'pending:', pendingQuery.data?.totalElements,
    'alerts:', alertsQuery.data?.totalElements,
    'unread:', unreadCountQuery.data);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, <span className="text-primary">{state.user?.firstName}</span>
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {isAdmin && (
          <StatCard
            title="Total Users"
            value={usersQuery.data?.totalElements}
            icon={<Users className="h-5 w-5" />}
            loading={usersQuery.isLoading}
          />
        )}
        <StatCard
          title="Total Resources"
          value={resourcesQuery.isError ? '-' : resourcesQuery.data?.totalElements}
          icon={<Server className="h-5 w-5" />}
          loading={resourcesQuery.isLoading}
        />
        {isResourceManager && (
          <StatCard
            title="Pending Requests"
            value={pendingQuery.data?.totalElements}
            icon={<Clock className="h-5 w-5" />}
            loading={pendingQuery.isLoading}
          />
        )}
        {isSecurityOfficer && (
          <StatCard
            title="Open Alerts"
            value={alertsQuery.data?.totalElements}
            icon={<ShieldAlert className="h-5 w-5" />}
            loading={alertsQuery.isLoading}
          />
        )}
        <StatCard
          title="Unread Notifications"
          value={unreadCountQuery.data}
          icon={<Bell className="h-5 w-5" />}
          loading={unreadCountQuery.isLoading}
        />
      </div>

      {/* Quick info */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="overflow-hidden rounded-lg border border-border bg-card p-4 sm:p-6">
          <h3 className="mb-2 text-lg font-semibold">Your Account</h3>
          <div className="space-y-2 text-sm">
            <div className="flex min-w-0 items-baseline justify-between gap-2">
              <span className="shrink-0 text-muted-foreground">Email</span>
              <span className="min-w-0 truncate font-mono text-xs">{state.user?.email}</span>
            </div>
            <div className="flex min-w-0 items-baseline justify-between gap-2">
              <span className="shrink-0 text-muted-foreground">Roles</span>
              <div className="flex flex-wrap gap-1">
                {state.user?.roles.map((role) => (
                  <span key={role} className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
                    {role}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex min-w-0 items-baseline justify-between gap-2">
              <span className="shrink-0 text-muted-foreground">User ID</span>
              <span className="min-w-0 truncate font-mono text-xs text-muted-foreground">{state.user?.id}</span>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-card p-4 sm:p-6">
          <h3 className="mb-2 text-lg font-semibold">System Status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">API Gateway</span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-status-approved" />
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Authentication</span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-status-approved" />
                Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Token Expires</span>
              <span className="font-mono text-xs text-muted-foreground">15 min</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
