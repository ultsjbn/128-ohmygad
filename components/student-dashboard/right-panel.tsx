"use client";

import { Suspense, useState } from 'react';
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export default function RightPanel() {
  const [selected, setSelected] = useState<Date | undefined>();

  return (
    <div className="pt-10">
      <aside className="bg-[#B5B5E7]/80 shadow-2xl rounded-[40px] p-6 w-full md:w-80 flex flex-col gap-6 h-fit">
        
        <div className="bg-white/20 backdrop-blur-sm rounded-[30px] w-full p-4 flex items-center justify-center border border-white/60 shadow-inner">
          <Suspense>
            <DayPicker
              mode="single"
              selected={selected}
              onSelect={setSelected}
              classNames={{
                root: "text-s",           
                month_grid: "w-full",
                day: "w-8 h-8 hover:bg-white/40 rounded-full transition-colors",            
                day_button: "w-8 h-8",  
                selected: "!bg-[#616187] !text-white rounded-full shadow-md scale-110",
                today: "!text-[#616187] font-bold underline decoration-2",
                chevron: "fill-[#616187]",
              }}
            />    
          </Suspense>
        </div>

        <button className="h-48 bg-[#8282B4]/90 rounded-[40px] w-full border border-white/20 shadow-lg hover:shadow-xl hover:-translate-y-1 hover:bg-[#616187] transition-all active:scale-95 group">
          <h1 className="text-2xl md:text-3xl font-semibold text-white p-6 leading-tight text-left">
            GSOs <br/> Attended
          </h1>
        </button>

        <button className="h-48 bg-[#8282B4]/90 rounded-[40px] w-full border border-white/20 shadow-lg hover:shadow-xl hover:-translate-y-1 hover:bg-[#616187] transition-all active:scale-95 group">
          <h1 className="text-2xl md:text-3xl font-semibold text-white p-6 leading-tight text-left">
            Pending <br/> Surveys
          </h1>        
        </button>
      </aside>
    </div>
  );
}