"use client";

import { Suspense } from 'react'

import { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export default function RightPanel() {
  const [selected, setSelected] = useState<Date | undefined>();

  return (
    <div className="pt-10">
            <aside className="bg-[#E9B1C4] rounded-[40px] p-6 w-full md:w-80 flex flex-col gap-6 h-fit">
            <div className="bg-[#E9B1C4] rounded-[40px] w-full p-6 flex items-center justify-center">
                <Suspense>
                    <DayPicker
                    mode="single"
                    selected={selected}
                    onSelect={setSelected}
                    classNames={{
                        root: "text-s",           
                        month_grid: "w-full",
                        day: "w-8 h-8",            
                        day_button: "w-8 h-8",  
                        selected: "!bg-[#616187] !text-white rounded-full",
                        today: "!text-[#616187] font-bold",
                        chevron: "fill-[#616187]",
                    }}
                    />    
                </Suspense>
            </div>
            <button className="h-60 bg-[#A2A2E1] rounded-[40px] w-full">
                    <h1 className="text-3xl md:text-4xl font-semibold text-white p-6">
                    GSOs Attended
                </h1>
            </button>
            <button className="h-60 bg-[#A2A2E1] rounded-[40px] w-full">
                    <h1 className="text-3xl md:text-4xl font-semibold text-white p-6">
                    Pending Surveys
                </h1>        
            </button>
    </aside>
    </div>
  );
}