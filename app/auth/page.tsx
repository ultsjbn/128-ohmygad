"use client";

import { Suspense } from 'react';
import AuthForm from './auth-form';

export default function AuthPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthForm />
    </Suspense>
  );
}