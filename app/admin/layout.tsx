import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import AdminSidebar from "@/components/admin-sidebar";
import { getCurrentUserWithRole } from "@/lib/auth/get-current-user";
import UserMenu from '@/components/user-menu';

async function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const result = await getCurrentUserWithRole();

  if (result.error === 'unauthenticated') redirect('/auth/login');
  if (result.error === 'no_profile' || result.error === 'invalid_role') redirect('/auth/setup');
  if (result.user.role !== 'admin') redirect('/auth/login');

  return <>{children}</>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    // outer container is light, with padding to push everything off the edges
    <div className="flex h-screen w-full bg-fractal-bg-body-default font-sans text-fractal-text-default overflow-hidden p-2 gap-6">
      
      {/* sidebar */}
      <AdminSidebar />

      {/* main page content */}
      <div className="flex flex-col flex-1 overflow-hidden relative">
        <header className="flex items-center justify-end pt-4 pb-4 shrink-0 bg-transparent">
          <div className="flex items-center gap-4">
            <UserMenu />
          </div>
        </header>

        <main className="flex-1 pb-10 overflow-y-auto min-w-0 pr-2">
          <Suspense fallback={<div>Loading...</div>}>
            <AdminAuthGuard>
              {children}
            </AdminAuthGuard>
          </Suspense>
        </main>
      </div>

    </div>
  );
}