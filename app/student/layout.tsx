import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { Header, Avatar, InputText } from "@snowball-tech/fractal";
import { ChevronDown } from "lucide-react";
import StudentSidebar from "@/components/student-sidebar";
import { getCurrentUserWithRole } from "@/lib/auth/get-current-user";

// this is from claude bcs i gave up
async function StudentAuthGuard({ children }: { children: React.ReactNode }) {
  const result = await getCurrentUserWithRole();

  if (result.error === 'unauthenticated') redirect('/auth?redirectTo=/student');
  if (result.error === 'no_profile' || result.error === 'invalid_role') redirect('/auth/setup');
  if (result.user.role !== 'student') redirect('/');

  return <>{children}</>;
}

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen w-full bg-fractal-bg-body-default font-sans text-fractal-text-default overflow-hidden">

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
              <Avatar size="s" />
              <ChevronDown size={16} className="ml-1" />
            </div>
          }
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