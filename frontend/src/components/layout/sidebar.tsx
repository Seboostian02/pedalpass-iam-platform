import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/auth-context';
import { ROUTES, ROLES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Users, Server, FileCheck, Shield, Bell, User,
  ChevronLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { SidebarCircuits } from './sidebar-circuits';
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

const NAV_BASE = 'group/nav flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200 border-l-2 bg-sidebar';
const NAV_ACTIVE = 'bg-gradient-to-r from-[oklch(0.16_0.08_285)] to-sidebar text-sidebar-primary border-primary shadow-[inset_3px_0_10px_rgba(124,58,237,0.15)]';
const NAV_INACTIVE = 'text-sidebar-foreground/60 border-transparent hover:bg-[oklch(0.13_0.03_280)] hover:text-sidebar-foreground hover:border-primary/30';

interface SidebarProps {
  side?: 'left' | 'right';
}

export function Sidebar({ side = 'left' }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { hasAnyRole, hasPermission } = useAuth();
  const location = useLocation();

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
        'relative flex h-screen flex-col bg-sidebar transition-all duration-300 overflow-hidden',
        side === 'left' ? 'neon-edge-r' : 'neon-edge-l',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Circuit pattern background — z-0 so it stays behind everything */}
      <div className="absolute inset-0 z-0">
        <SidebarCircuits />
      </div>

      {/* Logo */}
      <div className="relative z-10 flex h-16 items-center gap-3 px-3">
        <img src={logoSvg} alt="PedalPass" className="h-8 w-8 shrink-0" />
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight text-foreground neon-text">
            Pedal<span className="text-primary">Pass</span>
          </span>
        )}
      </div>

      {/* Neon separator */}
      <div className="relative z-10 mx-3 neon-line" />

      {/* Navigation */}
      <nav className="relative z-10 flex-1 space-y-1 overflow-y-auto p-2 pt-3">
        {visibleItems.map((item) => {
          const Icon = item.icon;

          if (collapsed) {
            // Collapsed: compute isActive manually (string className) to avoid
            // Radix TooltipTrigger asChild stringify-ing the function className
            const isActive = location.pathname === item.path;
            return (
              <Tooltip key={item.path} delayDuration={0}>
                <TooltipTrigger asChild>
                  <NavLink
                    to={item.path}
                    className={cn(NAV_BASE, isActive ? NAV_ACTIVE : NAV_INACTIVE)}
                  >
                    <Icon className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover/nav:scale-110" />
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(NAV_BASE, isActive ? NAV_ACTIVE : NAV_INACTIVE)}
            >
              <Icon className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover/nav:scale-110" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Neon separator */}
      <div className="relative z-10 mx-3 neon-line" />

      {/* Collapse toggle — hidden on mobile (Sheet uses hamburger instead) */}
      <div className="relative z-10 hidden p-2 md:block">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center text-muted-foreground hover:text-foreground"
          onClick={() => setCollapsed(!collapsed)}
        >
          <div className={cn('transition-transform duration-300', collapsed && 'rotate-180')}>
            <ChevronLeft className="h-4 w-4" />
          </div>
        </Button>
      </div>
    </aside>
  );
}
