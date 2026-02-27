import React from 'react';

import { User, Calendar, BookOpenText, ChartBar, LogOut} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    
    <div className="min-h-screen w-full bg-gradient-to-tl from-[#F6E0E7] to-[#DADAF3] flex flex-col md:flex-row p-4 md:p-8 gap-6">

      {/* Left sidebar */}
      <aside className="hidden md:flex w-44 bg-[#FFEDF3]/80 rounded-[40px] flex-col items-center py-12 gap-20 sticky top-8 h-[calc(100vh-64px)]
                        backdrop-blur-md shadow-2xl backdrop-blur-lg">
        <button className="w-24 h-24 bg-[#A2A2E1] rounded-full flex items-center justify-center mb-10
                        hover:-translate-y-1 hover:bg-[#8282B4] transition-all active:scale-95 group shadow-lg">
            <User className="w-14 h-14 text-white"/>
        </button>

        <nav className="flex flex-col gap-10">
          <button className="w-16 h-16 bg-[#E9B1C4] rounded-full flex items-center justify-center
                            hover:-translate-y-1 hover:bg-[#BA8E9D] transition-all active:scale-95 group shadow-lg">
            <Calendar className="w-10 h-10 text-white"/>
          </button>
          <button className="w-16 h-16 bg-[#E9B1C4] rounded-full flex items-center justify-center
                            hover:-translate-y-1 hover:bg-[#BA8E9D] transition-all active:scale-95 group shadow-lg">
            <BookOpenText className="w-10 h-10 text-white"/>
          </button>
          <button className="w-16 h-16 bg-[#E9B1C4] rounded-full flex items-center justify-center
                            hover:-translate-y-1 hover:bg-[#BA8E9D] transition-all active:scale-95 group shadow-lg">
            <ChartBar className="w-10 h-10 text-white"/>
          </button>
        </nav>

        <button className="mt-auto w-16 h-16 bg-[#A2A2E1] rounded-full flex items-center justify-center
                        hover:-translate-y-1 hover:bg-[#8282B4] transition-all active:scale-95 group shadow-lg">
            <LogOut className="w-10 h-10 text-white"/>
        </button>
      </aside>

      {children}

    </div>
  );
}