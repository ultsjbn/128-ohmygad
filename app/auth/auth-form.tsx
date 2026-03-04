import { createBrowserClient } from '@supabase/ssr';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleLogin() {
    setError('');

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !data.user) {
      setError(signInError?.message ?? 'Login failed');
      return;
    }

    // check if there's a redirectTo param (from middleware)
    const redirectTo = searchParams.get('redirectTo');
    if (redirectTo) {
      router.push(redirectTo);
      return;
    }

    // otherwise use role from app_metadata for redirect
    const role = data.user.app_metadata?.role;

    const destinations: Record<string, string> = {
      admin: '/admin',
      faculty: '/faculty',
      student: '/student',
    };

    router.push(destinations[role] ?? '/auth/setup');
  }

  return (
    <div>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" />
      {error && <p>{error}</p>}
      <button onClick={handleLogin}>Sign In</button>
    </div>
  );
}