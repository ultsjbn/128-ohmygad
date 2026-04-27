export type UserRole = 'admin' | 'staff' |'faculty' | 'student';

export const ROLE_HOME: Record<UserRole, string> = {
  admin: '/admin',
  staff: '/staff',
  faculty: '/faculty',
  student: '/student',
};

export const ROLE_ALLOWED_PREFIXES: Record<UserRole, string[]> = {
  admin: ['/admin'],
  staff: ['/staff'],
  faculty: ['/faculty'],
  student: ['/student'],
};

export const PROTECTED_PREFIXES = ['/admin', '/staff', '/faculty', '/student'];

export function isValidRole(role: unknown): role is UserRole {
  return role === 'admin' || role === 'staff' || role === 'faculty' || role === 'student';
}

export function getRoleFromPath(pathname: string): UserRole | null {
  if (pathname.startsWith('/admin')) return 'admin';
  if (pathname.startsWith('/staff')) return 'staff';
  if (pathname.startsWith('/faculty')) return 'faculty';
  if (pathname.startsWith('/student')) return 'student';
  return null;
}