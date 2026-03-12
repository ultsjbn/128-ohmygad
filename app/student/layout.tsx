import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { Header, InputText } from "@snowball-tech/fractal";
import StudentSidebar from "@/components/student-sidebar";
import { getCurrentUserWithRole } from "@/lib/auth/get-current-user";
import UserMenu from '@/components/user-menu';

async function StudentAuthGuard({ children }: { children: React.ReactNode }) {
  const result = await getCurrentUserWithRole();

  if (result.error === 'unauthenticated') redirect('/auth?redirectTo=/student');
  if (result.error === 'no_profile' || result.error === 'invalid_role') redirect('/auth/onboarding');
  if (!result.user) redirect('/');
  if (result.user.role !== 'student') redirect('/');

  return <>{children}</>;
}

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen w-full bg-fractal-bg-body-default font-sans text-fractal-text-default overflow-hidden">
      <div className="@container w-full bg-fractal-brand-primary shrink-0">
        <Header
          className="bg-transparent"
          left={<InputText placeholder="Search" />}
          right={<UserMenu />}
        />
      </div>
      <div className="flex flex-1 overflow-hidden">
        <StudentSidebar />
        <main className="flex-1 p-4 overflow-y-auto min-w-0">
          <Suspense fallback={<div>Loading...</div>}>
            <StudentAuthGuard>
              {children}
            </StudentAuthGuard>
          </Suspense>
        </main>
      </div>
    </div>
  );
}