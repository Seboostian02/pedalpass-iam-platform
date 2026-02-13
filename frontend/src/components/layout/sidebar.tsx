import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/context/auth-context';
import { ROUTES, ROLES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Users, Server, FileCheck, Shield, Bell, User,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import logoSvg from '@/assets/logo.svg';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: ROUTES.DASHBOARD, roles: [], permissions: [] },
  { icon: Users, label: 'Users', path: ROUTES.USERS, roles: [ROLES.ADMIN], permissions: ['user:read'] },
  { icon: Server, label: 'Resources', path: ROUTES.RESOURCES, roles: [], permissions: [] },
  { icon: FileCheck, label: 'Access Requests', path: ROUTES.ACCESS_REQUESTS, roles: [], permissions: [] },
  { icon: Shield, label: 'Audit & Security', path: ROUTES.AUDIT, roles: [ROLES.ADMIN, ROLES.SECURITY_OFFICER], permissions: [] },
  { icon: Bell, label: 'Notifications', path: ROUTES.NOTIFICATIONS, roles: [], permissions: [] },
  { icon: User, label: 'Profile', path: ROUTES.PROFILE, roles: [], permissions: [] },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { hasAnyRole, hasPermission } = useAuth();

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.roles.length === 0 && item.permissions.length === 0) return true;
    const hasRole = item.roles.length > 0 && hasAnyRole(item.roles);
    const hasPerm = item.permissions.length > 0 && item.permissions.some((p) => hasPermission(p));
    return hasRole || hasPerm;
  });

  console.log('[Sidebar] Visible items:', visibleItems.map((i) => i.label));

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-3">
        <img src={logoSvg} alt="PedalPass" className="h-8 w-8 shrink-0" />
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight text-foreground">
            Pedal<span className="text-primary">Pass</span>
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const link = (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-primary/10 text-sidebar-primary border-l-2 border-sidebar-primary'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/10 hover:text-sidebar-foreground'
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.path} delayDuration={0}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            );
          }

          return link;
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-sidebar-border p-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  );
}
