import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { Search, Bell } from 'lucide-react';
import FacultySidebar from '@/components/faculty-sidebar';
import { getCurrentUserWithRole } from '@/lib/auth/get-current-user';
import UserMenu from '@/components/user-menu';

async function FacultyAuthGuard({ children }: { children: React.ReactNode }) {
  const result = await getCurrentUserWithRole();
  if (result.error === 'unauthenticated') redirect('/auth?redirectTo=/faculty');
  if (result.error === 'no_profile' || result.error === 'invalid_role') redirect('/auth/onboarding');
  if (!result.user) redirect('/');
  if (result.user.role !== 'faculty') redirect('/');
  return <>{children}</>;
}

export default function FacultyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display:'flex', flexDirection:'row', height:'100vh', width:'100%', overflow:'hidden', background:'linear-gradient(145deg,#f5f3ff 0%,#fce8ee 35%,#f0eefd 65%,#faf8ff 100%)' }}>
      <div className="blob blob-pink"      style={{ position:'fixed', top:-120, right:60, width:420, height:420, opacity:0.20, zIndex:0, pointerEvents:'none' }} />
      <div className="blob blob-periwinkle" style={{ position:'fixed', bottom:0, left:80, width:320, height:320, opacity:0.15, zIndex:0, pointerEvents:'none' }} />

      <FacultySidebar />

      <div style={{ position:'relative', zIndex:1, display:'flex', flexDirection:'column', flex:1, minWidth:0, overflow:'hidden' }}>
        <header style={{ display:'flex', flexShrink:0, alignItems:'center', justifyContent:'space-between', gap:16, padding:'10px 24px', background:'rgba(255,255,255,0.72)', backdropFilter:'blur(14px)', borderBottom:'1px solid rgba(45,42,74,0.07)' }}>
          <div className="search-wrap" style={{ flex:1, maxWidth:360 }}>
            <span className="search-icon"><Search size={15} /></span>
            <input className="search-input" placeholder="Search events, courses, surveys…" />
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <button className="btn btn-icon" style={{ background:'rgba(45,42,74,0.05)', color:'var(--primary-dark)' }} aria-label="Notifications">
              <Bell size={17} />
            </button>
            <UserMenu />
          </div>
        </header>
        <main style={{ flex:1, overflowY:'auto', padding:'24px', paddingBottom:'96px' }}>
          <Suspense fallback={<div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'var(--gray)', fontSize:14 }}>Loading…</div>}>
            <FacultyAuthGuard>{children}</FacultyAuthGuard>
          </Suspense>
        </main>
      </div>
    </div>
  );
}