import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import GlobalSearch from '@/components/global-search';
import AdminSidebar from '@/components/admin-sidebar';
import { getCurrentUserWithRole } from '@/lib/auth/get-current-user';
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
    <div style={{ display:'flex', flexDirection:'row', height:'100vh', width:'100%', overflow:'hidden', background:'linear-gradient(145deg,#f5f3ff 0%,#fce8ee 35%,#f0eefd 65%,#faf8ff 100%)' }}>
      <div className="blob blob-pink"      style={{ position:'fixed', top:-120, right:60, width:420, height:420, opacity:0.20, zIndex:0, pointerEvents:'none' }} />
      <div className="blob blob-periwinkle" style={{ position:'fixed', bottom:0, left:80, width:320, height:320, opacity:0.15, zIndex:0, pointerEvents:'none' }} />

      <Suspense>
        <AdminSidebar />
      </Suspense>

      <div style={{ position:'relative', zIndex:1, display:'flex', flexDirection:'column', flex:1, minWidth:0, overflow:'hidden' }}>
            <header style={{ 
                position: 'relative', 
                zIndex: 50,           
                display:'flex', 
                flexShrink:0, 
                alignItems:'center', 
                justifyContent:'space-between', 
                gap:16, 
                padding:'10px 24px', 
                background:'rgba(255,255,255,0.45)', 
                backdropFilter:'blur(16px)', 
                WebkitBackdropFilter:'blur(16px)',
                borderBottom:'1px solid rgba(45,42,74,0.07)' 
            }}>
          <GlobalSearch role="admin" placeholder="Search events, users, courses..." />
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <UserMenu />
          </div>
        </header>
        
        <main style={{ display:'flex', flexDirection:'column', flex:1, minHeight:0, overflowY:'auto', padding:'24px' }}>
          <Suspense fallback={<div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'var(--gray)', fontSize:14 }}>Loading…</div>}>
            <AdminAuthGuard>{children}</AdminAuthGuard>
          </Suspense>
        </main>
      </div>
    </div>
  );
}