import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/auth-context';
import { ROUTES } from '@/lib/constants';

export function ProtectedRoute() {
  const { state } = useAuth();
  const location = useLocation();

  console.log('[ProtectedRoute] Auth check:', state.isAuthenticated, 'loading:', state.isLoading);

  if (state.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!state.isAuthenticated) {
    console.log('[ProtectedRoute] Not authenticated, redirecting to /login');
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return <Outlet />;
}
