"use client";

import { Suspense } from 'react';
import { Loader } from '@snowball-tech/fractal';
import { LoginForm } from '@/components/login-form';

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className='bg-fractal-bg-body-light'>
        <Loader size="xl"/>
      </div>
    }>
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-fractal-decorative-purple-90">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>
    </Suspense>
  );
}