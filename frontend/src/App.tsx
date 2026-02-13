import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { RoleGuard } from '@/components/auth/role-guard';
import { AppLayout } from '@/components/layout/app-layout';
import { ROUTES, ROLES } from '@/lib/constants';

import LoginPage from '@/pages/login';
import RegisterPage from '@/pages/register';
import DashboardPage from '@/pages/dashboard';
import UsersPage from '@/pages/users';
import ResourcesPage from '@/pages/resources';
import AccessRequestsPage from '@/pages/access-requests';
import AuditPage from '@/pages/audit';
import NotificationsPage from '@/pages/notifications';
import ProfilePage from '@/pages/profile';
import NotFoundPage from '@/pages/not-found';

export default function App() {
  console.log('[App] Rendering router');
  return (
    <Routes>
      {/* Public routes */}
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          {/* All authenticated users */}
          <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTES.RESOURCES} element={<ResourcesPage />} />
          <Route path={ROUTES.ACCESS_REQUESTS} element={<AccessRequestsPage />} />
          <Route path={ROUTES.NOTIFICATIONS} element={<NotificationsPage />} />
          <Route path={ROUTES.PROFILE} element={<ProfilePage />} />

          {/* ADMIN / user:read */}
          <Route element={<RoleGuard roles={[ROLES.ADMIN]} permissions={['user:read']} />}>
            <Route path={ROUTES.USERS} element={<UsersPage />} />
          </Route>

          {/* ADMIN / SECURITY_OFFICER */}
          <Route element={<RoleGuard roles={[ROLES.ADMIN, ROLES.SECURITY_OFFICER]} />}>
            <Route path={ROUTES.AUDIT} element={<AuditPage />} />
          </Route>
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
