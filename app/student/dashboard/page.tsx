import React from 'react';

export default function Dashboard() {
  return (
    <>
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col gap-8 max-w-5xl mx-auto">

        {/* Header Section */}
        <section className="flex flex-col gap-6">
          <h1 className="text-4xl md:text-6xl font-bold text-black leading-tight">
            Welcome, Mary Chezka Ann
          </h1>
          <div className="w-full h-16 bg-[#FFEDF3] rounded-[40px]" />
          <hr className="border-black" />
        </section>

        {/* Events Hub Section */}
        <section className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl md:text-4xl font-semibold text-black">Events Hub</h2>
            <div className="flex gap-4">
              <div className="w-12 h-10 bg-[#A2A2E1] rounded-xl" />
              <div className="w-12 h-10 bg-[#A2A2E1] rounded-xl" />
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
      <aside className="w-full md:w-60 flex flex-col gap-6">
        <div className="h-80 bg-[#E9B1C4] rounded-[40px] w-full" />
        <div className="h-52 bg-[#A2A2E1] rounded-[40px] w-full" />
        <div className="h-52 bg-[#A2A2E1] rounded-[40px] w-full" />
      </aside>
    </>
  );
}