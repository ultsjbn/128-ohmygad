"use client";

import React, { useEffect, useState } from "react";
import { EventPanel } from "@/components/event-panel";
import { Paper } from "@/components/paper";
import { Card } from "@/components/card";
import { Typography } from '@/components/typography';

export default function DashboardPage() {
  return (
    <div className="max-w-[1400px] w-full h-full flex flex-col">
      
      {/* HEADER SECTION WITH TOTAL USERS */}
      <div className="mb-4 shrink-0 flex items-end justify-between">
        <div>
          <Typography variant="heading-3">
            Welcome,
          </Typography>
          <Typography variant="heading-1" className="tracking-tighter leading-none font-median">
            Faculty Name Yipee
          </Typography>
        </div>
      </div>

      {/* Components */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 min-h-0">
        
        {/* COLUMN 1 & 2: Events */}
        <Paper elevation="elevated" className="lg:col-span-3 flex flex-col gap-1 h-full">
          <EventPanel/>
        </Paper>
      </div>
    </div>
  );
}