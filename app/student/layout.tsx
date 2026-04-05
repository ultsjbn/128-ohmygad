import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import StudentSidebar from '@/components/student-sidebar';
import { getCurrentUserWithRole } from '@/lib/auth/get-current-user';
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
    <div style={{ display:'flex', flexDirection:'row', height:'100vh', width:'100%', overflow:'hidden', background:'linear-gradient(145deg,#f5f3ff 0%,#fce8ee 35%,#f0eefd 65%,#faf8ff 100%)' }}>
      <div className="blob blob-pink"      style={{ position:'fixed', top:-120, right:60, width:420, height:420, opacity:0.20, zIndex:0, pointerEvents:'none' }} />
      <div className="blob blob-periwinkle" style={{ position:'fixed', bottom:0, left:80, width:320, height:320, opacity:0.15, zIndex:0, pointerEvents:'none' }} />

      <StudentSidebar />

      <div style={{ position:'relative', zIndex:1, display:'flex', flexDirection:'column', flex:1, minWidth:0, overflow:'hidden' }}>
        <header className="relative z-50 flex shrink-0 items-end gap-4 p-2 backdrop-blur-md">
            <div className="flex flex-1 gap-4 items-center justify-end">
                <UserMenu />
            </div>
        </header>
        <main className="px-5 pb-0 pt-4" style={{ flex:1, overflowY:'scroll'}}>
          <Suspense fallback={<div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'var(--gray)', fontSize:14 }}>Loading…</div>}>
            <StudentAuthGuard>{children}</StudentAuthGuard>
          </Suspense>
        </main>
      </div>
    </div>
  );
}