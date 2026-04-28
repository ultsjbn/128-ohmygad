"use client";

import { useEffect, useState } from "react";
import "react-day-picker/dist/style.css";
import { Card } from "@/components/ui";
import { CheckCircle2, ClipboardList } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function RightPanel() {
  const [gsoCount, setGsoCount] = useState<number>(0);
  const [ashoCount, setAshoCount] = useState<number>(0);

  useEffect(() => {
    async function fetchAttendance() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data } = await supabase
          .from("profile")
          .select("gso_attended, asho_attended")
          .eq("id", user.id)
          .single();
          
        if (data) {
          setGsoCount(data.gso_attended ?? 0);
          setAshoCount(data.asho_attended ?? 0);
        }
      }
    }
    
    fetchAttendance();
  }, []);

  return (
    <aside className="flex flex-col gap-4 w-full shrink-0 pb-8">
      {/* GSOs attended */}
      <Card variant="no-hover" className="flex flex-col gap-2 p-4 transition-all" >
        <div className="flex items-center justify-between">
          <p className="body">GSOs Attended</p>
          <CheckCircle2 size={18} style={{ color: "var(--periwinkle)" }} />
        </div>
        <p className="heading-xl" >
          {gsoCount}/2
        </p>
        <p className="caption">Sessions completed</p>
      </Card>

      {/* ASHs attended*/}
      <Card variant="no-hover" className="flex flex-col gap-2 p-4 transition-all" >
        <div className="flex items-center justify-between">
          <p className="body">ASHOs Attended</p>
          <CheckCircle2 size={18} style={{ color: "var(--periwinkle)" }} />
        </div>
        <p className="heading-xl" >
          {ashoCount}/2
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