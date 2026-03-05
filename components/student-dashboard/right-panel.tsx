"use client";

import { Suspense, useState } from "react";
import { Paper, Typography } from "@snowball-tech/fractal";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export default function RightPanel() {
  const [selected, setSelected] = useState<Date | undefined>();

  return (
    <aside className="flex flex-col gap-4 h-full min-h-0 w-fit">
      
      {/* Calendar */}
      <Paper
        elevation="elevated"
        titleVariant="body-1-median"
        className="w-full p-4 border-2 border-fractal-border-default" 
      >
        <Suspense>
          <DayPicker
            animate
            mode="single"
            selected={selected}
            onSelect={setSelected}
            classNames = {{today: `text-[#FF90E8] aria-selected:text-white`, 
            selected: `bg-[#FF90E8] text-white rounded-full`,
            chevron: `fill-[#FF90E8]`}}
          />
        </Suspense>
      </Paper>

      {/* GSOs */}
      <Paper
        elevation="elevated"
        className="bg-fractal-decorative-purple-90 p-4 cursor-pointer hover:shadow-brutal-2 transition-all border-2 border-fractal-border-default flex-1"
      >
        <Typography variant="body-1-median" className="text-fractal-text-placeholder mb-1">
          GSOs Attended
        </Typography>
        <Typography variant="heading-1" className="tracking-tighter leading-none font-median">
          1/2
        </Typography>
        <Typography variant="body-2" className="text-fractal-text-placeholder mt-2">
          sessions completed
        </Typography>
      </Paper>

      {/* Pending */}
      <Paper
        elevation="elevated"
        className="bg-fractal-decorative-yellow-90 p-4 cursor-pointer hover:shadow-brutal-2 transition-all border-2 border-fractal-border-default flex-1"
      >
        <Typography variant="body-1-median" className="text-fractal-text-placeholder mb-1">
          Pending Surveys
        </Typography>
        <Typography variant="heading-1" className="tracking-tighter leading-none font-median">
          3
        </Typography>
        <Typography variant="body-2" className="text-fractal-text-placeholder mt-2">
          awaiting your response
        </Typography>
      </Paper>
    </aside>
  );
}