export type UserRole = 'admin' | 'faculty' | 'student';

export const ROLE_HOME: Record<UserRole, string> = {
  admin: '/admin',
  faculty: '/faculty',
  student: '/student',
};

export const ROLE_ALLOWED_PREFIXES: Record<UserRole, string[]> = {
  admin: ['/admin'],
  faculty: ['/faculty'],
  student: ['/student'],
};

export const PROTECTED_PREFIXES = ['/admin', '/faculty', '/student'];

export function isValidRole(role: unknown): role is UserRole {
  return role === 'admin' || role === 'faculty' || role === 'student';
}

export function getRoleFromPath(pathname: string): UserRole | null {
  if (pathname.startsWith('/admin')) return 'admin';
  if (pathname.startsWith('/faculty')) return 'faculty';
  if (pathname.startsWith('/student')) return 'student';
  return null;
}