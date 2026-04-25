"use client";

import "react-day-picker/dist/style.css";
import { Card } from "@/components/ui";
import { CheckCircle2, ClipboardList } from "lucide-react";

export default function RightPanel() {

  return (
    <aside className="flex flex-col gap-4 w-full shrink-0 pb-8">
      {/* GSOs attended */}
      <Card variant="no-hover" className="flex flex-col gap-2 p-4 transition-all" >
        <div className="flex items-center justify-between">
          <p className="body">GSOs Attended</p>
          <CheckCircle2 size={18} style={{ color: "var(--periwinkle)" }} />
        </div>
        <p className="heading-xl" >
          1/2
        </p>
        <p className="caption">Sessions completed</p>
      </Card>

      {/* ASHs attended*/}
      <Card variant="no-hover" className="flex flex-col gap-2 p-4 transition-all" >
        <div className="flex items-center justify-between">
          <p className="body">ASHs Attended</p>
          <CheckCircle2 size={18} style={{ color: "var(--periwinkle)" }} />
        </div>
        <p className="heading-xl" >
          1/2
        </p>
        <p className="caption">Sessions completed</p>
      </Card>
      
      {/* pending surveys */}
      <Card variant="no-hover" className="flex flex-col gap-2 p-4 transition-all"
      >
        <div className="flex items-center justify-between">
          <p className="body">Pending Surveys</p>
          <ClipboardList size={18} style={{ color: "var(--periwinkle)" }} />
        </div>
        <p className="heading-xl">
          3
        </p>
        <p className="caption">Awaiting your response</p>
      </Card>

    </aside>

    
  );
}