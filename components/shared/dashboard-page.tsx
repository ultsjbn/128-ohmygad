"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Typography } from "@/components/typography";
import { EventPanel } from "@/components/event-panel";
import { Paper } from "@/components/paper";

interface DashboardPageProps {
  rightPanel?: React.ReactNode;
}

export default function DashboardPage({ rightPanel }: DashboardPageProps) {
  const [displayName, setDisplayName] = useState<string>("...");
    
  useEffect(() => {
    const fetchName = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profile")
        .select("display_name, full_name")
        .eq("id", user.id)
        .single();
      setDisplayName(data?.display_name || data?.full_name || "User");
    };
    fetchName();
  }, []);

  return (
    <div className="w-full h-full flex flex-col gap-6">
      <div className="shrink-0 flex items-end justify-between">
        <div>
          <Typography variant="heading-3">Welcome,</Typography>
          <Typography variant="heading-1" className="tracking-tighter leading-none font-median">
            {displayName}
          </Typography>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 min-h-0">
        <Paper elevation="elevated" className="lg:col-span-3 flex flex-col gap-1 h-full">
          <EventPanel />
        </Paper>
        {rightPanel}
      </div>
    </div>
  );
}
