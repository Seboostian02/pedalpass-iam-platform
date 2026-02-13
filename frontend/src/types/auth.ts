export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface TokenRefreshRequest {
  refreshToken: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  email: string;
  firstName: string;
  lastName: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  roles: string;
  permissions: string;
  iat: number;
  exp: number;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  permissions: string[];
}

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
