import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { Header, Avatar, InputText } from "@snowball-tech/fractal";
import { ChevronDown } from "lucide-react";
import AdminSidebar from "@/components/admin-sidebar";
import { getCurrentUserWithRole } from "@/lib/auth/get-current-user";
import { Menu } from '@snowball-tech/fractal';
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
    <div className="flex flex-col h-screen w-full bg-fractal-bg-body-default font-sans text-fractal-text-default overflow-hidden">

      {/* TOP HEADER */}
      <div className="@container w-full bg-fractal-brand-primary shrink-0">
        <Header
          className="bg-transparent"
          left={
            <div className="flex items-center gap-2">
              <InputText placeholder="Search" />
            </div>
          }
          right={
            <div className="flex items-center gap-2 cursor-pointer">
              <UserMenu/>
            </div>
          }
        />
      </div>

      {/* BOTTOM SECTION: Sidebar + Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />

        {/* MAIN PAGE CONTENT */}
        <main className="flex-1 p-4 overflow-y-auto min-w-0 place-content-center">
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