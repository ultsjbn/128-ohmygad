"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { EventPanel } from "@/components/event-panel";
import { Card } from "@/components/ui";
import ScrollToTop from "../ui/scroll-to-top";

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
    <div className="w-full flex-1 min-h-0 flex flex-col gap-3 md:gap-6 animate-in fade-in duration-500">

      {/* dashboard header */}
      <div className="shrink-0 animate-in slide-in-from-bottom-2 duration-500 mt-2">
        <p className="body font-medium">Welcome,</p>
        <h1 className="heading-xl mt-0.5">{displayName}</h1>
      </div>

      {/* main grid: events panel left, right panel right on lg+ devices */}
      <div className="flex justify-center gap-4 md:gap-6 flex-1 min-h-0">
        {/* events panel */}
        <Card className="lg:col-span-2 flex flex-col p-0 overflow-hidden min-h-0">
          <EventPanel />
        </Card>

        {/* right panel: sidebar on lg+ devices, hidden inside grid on mobile */}
        {rightPanel && (
          <div className="hidden lg:flex lg:col-span-1 flex-col gap-4 min-h-0 overflow-y-auto">
            {rightPanel}
          </div>
        )}

      </div>

      {/* right panel on mobile stacks below the events panel */}
      {rightPanel && (
        <div className="flex lg:hidden flex-col gap-4">
          {rightPanel}
        </div>
      )}

    {/* scroll to top */}
    <ScrollToTop/>
    </div>
  );
}