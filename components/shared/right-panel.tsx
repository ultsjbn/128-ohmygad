"use client";

import { Suspense, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Card } from "@/components/ui";
import { CheckCircle2, ClipboardList } from "lucide-react";

export default function RightPanel() {
  const [selected, setSelected] = useState<Date | undefined>();

  return (
    <aside className="flex flex-col gap-4 w-full">

      {/* calendar */}
      <Card variant="glass" className="p-3 w-full overflow-hidden">
        {/* DayPicker CSS overrides scoped to this card */}
        <style>{`
          .rdp {
            --rdp-accent-color: var(--soft-pink);
            --rdp-background-color: var(--pink-light);
            margin: 0;
            width: 100%;
          }
          .rdp-month { width: 100%; }
          .rdp-table  { width: 100%; }
          .rdp-caption_label {
            font-family: var(--font-display);
            font-size: 14px;
            font-weight: 700;
            color: var(--primary-dark);
          }
          .rdp-head_cell {
            font-size: 11px;
            font-weight: 600;
            color: var(--gray);
            text-transform: uppercase;
          }
          .rdp-day {
            font-size: 12px;
            color: var(--primary-dark);
            border-radius: var(--radius-full);
          }
          .rdp-day_today:not(.rdp-day_selected) {
            color: var(--soft-pink);
            font-weight: 700;
          }
          .rdp-day_selected,
          .rdp-day_selected:hover {
            background: var(--soft-pink) !important;
            color: white !important;
            border-radius: var(--radius-full);
          }
          .rdp-nav_button svg { fill: var(--soft-pink); }
        `}</style>
        <Suspense>
          <DayPicker
            animate
            mode="single"
            selected={selected}
            onSelect={setSelected}
          />
        </Suspense>
      </Card>

      {/* GSOs attended */}
      <Card
        variant="glass"
        className="flex flex-col gap-1 p-4 cursor-pointer transition-all"
      >
        <div className="flex items-center justify-between">
          <p className="caption font-semibold">GSOs Attended</p>
          <CheckCircle2 size={18} style={{ color: "var(--periwinkle)" }} />
        </div>
        <p
          className="font-bold tracking-tight leading-none mt-1"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 36,
            color: "var(--primary-dark)",
          }}
        >
          1/2
        </p>
        <p className="caption mt-1">Sessions completed</p>
      </Card>

      {/* pending surveys */}
      <Card
        variant="glass"
        className="flex flex-col gap-1 p-4 cursor-pointer transition-all"
      >
        <div className="flex items-center justify-between">
          <p className="caption font-semibold">Pending Surveys</p>
          <ClipboardList size={18} style={{ color: "var(--soft-pink)" }} />
        </div>
        <p
          className="font-bold tracking-tight leading-none mt-1"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 36,
            color: "var(--primary-dark)",
          }}
        >
          3
        </p>
        <p className="caption mt-1">Awaiting your response</p>
      </Card>

    </aside>
  );
}