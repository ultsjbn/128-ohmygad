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

      {/* calendar removed */}


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