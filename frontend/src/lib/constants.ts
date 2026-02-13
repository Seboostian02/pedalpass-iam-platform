export const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  GUEST: 'GUEST',
  SECURITY_OFFICER: 'SECURITY_OFFICER',
  RESOURCE_MANAGER: 'RESOURCE_MANAGER',
} as const;

export const RESOURCE_TYPES = ['PHYSICAL', 'DIGITAL'] as const;

export const RESOURCE_CATEGORIES = [
  'OFFICE', 'MEETING_ROOM', 'PARKING', 'EQUIPMENT',
  'APPLICATION', 'FILE_SHARE', 'VPN', 'DATABASE',
] as const;

export const REQUEST_STATUSES = [
  'PENDING', 'APPROVED', 'DENIED', 'COLLISION', 'REVOKED', 'EXPIRED',
] as const;

export const SEVERITY_LEVELS = ['INFO', 'WARNING', 'CRITICAL'] as const;

export const NOTIFICATION_TYPES = ['WELCOME', 'ACCESS', 'COLLISION', 'SECURITY'] as const;

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
