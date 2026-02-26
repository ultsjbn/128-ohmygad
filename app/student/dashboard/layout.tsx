import React from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-[#FEFBFB] flex flex-col md:flex-row p-4 md:p-8 gap-6 font-sans">

      {/* Left Sidebar */}
      <aside className="hidden md:flex w-44 bg-[#FFEDF3] rounded-[40px] flex-col items-center py-12 gap-20 sticky top-8 h-[calc(100vh-64px)]">
        <div className="w-24 h-24 bg-[#A2A2E1] rounded-full" />
        <nav className="flex flex-col gap-10">
          <div className="w-16 h-16 bg-[#E9B1C4] rounded-full" />
          <div className="w-16 h-16 bg-[#E9B1C4] rounded-full" />
          <div className="w-16 h-16 bg-[#E9B1C4] rounded-full" />
        </nav>
      </aside>

      {/* Page Content */}
      {children}

    </div>
  );
}