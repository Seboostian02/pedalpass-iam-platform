import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/auth-context';
import { ROUTES } from '@/lib/constants';

interface RoleGuardProps {
  roles?: string[];
  permissions?: string[];
}

export function RoleGuard({ roles = [], permissions = [] }: RoleGuardProps) {
  const { state, hasAnyRole, hasPermission } = useAuth();

  const hasRequiredRole = roles.length === 0 || hasAnyRole(roles);
  const hasRequiredPermission = permissions.length === 0 || permissions.some((p) => hasPermission(p));
  const granted = hasRequiredRole || hasRequiredPermission;

  console.log('[RoleGuard] Required roles:', roles, 'Required permissions:', permissions);
  console.log('[RoleGuard] User roles:', state.user?.roles, 'User permissions:', state.user?.permissions);
  console.log('[RoleGuard] Access granted:', granted);

  if (!granted) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <Outlet />;
}
