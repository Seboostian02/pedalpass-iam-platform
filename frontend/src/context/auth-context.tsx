import { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authService } from '@/services/auth.service';
import type { AuthState, AuthUser, JwtPayload, LoginRequest, RegisterRequest } from '@/types/auth';

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: AuthUser; accessToken: string; refreshToken: string } }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'RESTORE_SESSION'; payload: { user: AuthUser; accessToken: string; refreshToken: string } }
  | { type: 'SET_LOADING'; payload: boolean };

interface AuthContextType {
  state: AuthState;
  login: (request: LoginRequest) => Promise<void>;
  register: (request: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true };
    case 'LOGIN_SUCCESS':
    case 'RESTORE_SESSION':
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGIN_FAILURE':
      return { ...initialState, isLoading: false };
    case 'LOGOUT':
      return { ...initialState, isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

function decodeTokenToUser(accessToken: string, firstName: string, lastName: string): AuthUser {
  const payload = jwtDecode<JwtPayload>(accessToken);
  console.log('[Auth] JWT decoded:', { sub: payload.sub, email: payload.email, roles: payload.roles, exp: new Date(payload.exp * 1000).toISOString() });
  return {
    id: payload.sub,
    email: payload.email,
    firstName,
    lastName,
    roles: payload.roles ? payload.roles.split(',') : [],
    permissions: payload.permissions ? payload.permissions.split(',') : [],
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Helper to restore session from localStorage
  const restoreFromLocalStorage = useCallback(() => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const userJson = localStorage.getItem('user');

    if (accessToken && refreshToken && userJson) {
      try {
        const payload = jwtDecode<JwtPayload>(accessToken);
        const isExpired = payload.exp * 1000 < Date.now();

        if (isExpired) {
          console.log('[Auth] Stored token expired, will rely on refresh interceptor');
        }

        const savedUser = JSON.parse(userJson) as AuthUser;
        // Re-decode roles/permissions from token (they may have changed)
        const user = decodeTokenToUser(accessToken, savedUser.firstName, savedUser.lastName);

        console.log('[Auth] Session restored from localStorage:', user.email, 'roles:', user.roles);
        dispatch({
          type: 'RESTORE_SESSION',
          payload: { user, accessToken, refreshToken },
        });
      } catch (error) {
        console.log('[Auth] Failed to restore session:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } else {
      console.log('[Auth] No stored session found');
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Restore session from localStorage on mount
  useEffect(() => {
    restoreFromLocalStorage();
  }, [restoreFromLocalStorage]);

  // Listen for token refresh events from the API client interceptor
  useEffect(() => {
    const handleTokenRefreshed = () => {
      console.log('[Auth] Token refreshed event received, re-syncing state');
      restoreFromLocalStorage();
    };
    window.addEventListener('auth:token-refreshed', handleTokenRefreshed);
    return () => window.removeEventListener('auth:token-refreshed', handleTokenRefreshed);
  }, [restoreFromLocalStorage]);

  const login = useCallback(async (request: LoginRequest) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authService.login(request);
      const user = decodeTokenToUser(response.accessToken, response.firstName, response.lastName);

      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      console.log('[Auth] Login success:', user.email, 'roles:', user.roles);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, accessToken: response.accessToken, refreshToken: response.refreshToken },
      });
    } catch (error) {
      console.log('[Auth] Login failure:', error);
      dispatch({ type: 'LOGIN_FAILURE' });
      throw error;
    }
  }, []);

  const register = useCallback(async (request: RegisterRequest) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authService.register(request);
      const user = decodeTokenToUser(response.accessToken, response.firstName, response.lastName);

      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      console.log('[Auth] Register success:', user.email, 'roles:', user.roles);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, accessToken: response.accessToken, refreshToken: response.refreshToken },
      });
    } catch (error) {
      console.log('[Auth] Register failure:', error);
      dispatch({ type: 'LOGIN_FAILURE' });
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.log('[Auth] Logout API call failed (token may already be expired):', error);
    }
    console.log('[Auth] Logout, clearing tokens');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  }, []);

  const hasRole = useCallback((role: string) => {
    return state.user?.roles.includes(role) ?? false;
  }, [state.user]);

  const hasPermission = useCallback((permission: string) => {
    return state.user?.permissions.includes(permission) ?? false;
  }, [state.user]);

  const hasAnyRole = useCallback((roles: string[]) => {
    return roles.some((role) => state.user?.roles.includes(role)) ?? false;
  }, [state.user]);

  return (
    <AuthContext.Provider value={{ state, login, register, logout, hasRole, hasPermission, hasAnyRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
