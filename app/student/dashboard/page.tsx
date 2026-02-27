import React from 'react';
import RightPanel from "@/components/student-dashboard/right-panel"

import { Search } from "lucide-react";

export default function Dashboard() {
  return (
    <>
      {/* Main dashboard content area */}
      <main className="flex-1 flex flex-col gap-8 max-w-6xl mx-auto pt-10">

        {/* Header Section */}
        <section className="flex flex-col gap-6">
          <h1 className="text-4xl md:text-6xl font-bold text-black leading-tight">
            Welcome, Mary Chezka Ann
          </h1>
        <div className="w-full h-16 bg-[#FFEDF3] rounded-[40px] flex items-center px-6 gap-4">
        <Search className="w-6 h-6 text-black/50" strokeWidth={2.5} />
        
        <h1 className="text-xl font-medium text-black/50">Search</h1>
        </div>
          <hr className="border-black" />
        </section>

        {/* Event hub section */}
        <section className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl md:text-4xl font-semibold text-black">Events Hub</h2>
            <div className="flex gap-4">
              <button className="w-12 h-10 bg-[#A2A2E1] rounded-xl" />
              <button className="w-12 h-10 bg-[#A2A2E1] rounded-xl" />
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-48 h-48 bg-[#A2A2E1] rounded-[40px]" />
                <div className="flex flex-col items-center h-48 gap-2 shrink-0">
                  <div className="w-5 h-5 bg-[#A2A2E1] rounded-full" />
                  <div className="w-1 bg-[#A2A2E1]/20 flex-grow rounded-full" />
                </div>
                <div className="flex-1 h-48 bg-[#E9B1C4] rounded-[40px] w-full" />
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Right Stats Panel */}
      {/* <aside className="w-full md:w-80 flex flex-col gap-6">
        <div className="bg-[#E9B1C4] rounded-[40px] w-full p-4 flex items-center justify-center" />
        <div className="h-52 bg-[#A2A2E1] rounded-[40px] w-full" />
        <div className="h-52 bg-[#A2A2E1] rounded-[40px] w-full" />
      </aside> */}

      <RightPanel/>
    </>
  );
}