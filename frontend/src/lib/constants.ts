export const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  GUEST: 'GUEST',
  SECURITY_OFFICER: 'SECURITY_OFFICER',
  RESOURCE_MANAGER: 'RESOURCE_MANAGER',
} as const;

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  USERS: '/users',
  RESOURCES: '/resources',
  ACCESS_REQUESTS: '/access-requests',
  AUDIT: '/audit',
  NOTIFICATIONS: '/notifications',
  PROFILE: '/profile',
} as const;
