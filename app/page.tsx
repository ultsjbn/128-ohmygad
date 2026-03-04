import { redirect } from 'next/navigation';
import { getCurrentUserWithRole } from '@/lib/auth/get-current-user';

export default async function RootPage() {
  const result = await getCurrentUserWithRole();

  if (result.error === 'unauthenticated') redirect('/auth');
  if (result.error === 'no_profile' || result.error === 'invalid_role') redirect('/auth/setup');
  if (!result.user) redirect('/auth');

  const { role } = result.user;

  if (role === 'admin') redirect('/admin');
  if (role === 'faculty') redirect('/faculty');
  if (role === 'student') redirect('/student');

  redirect('/auth');
}