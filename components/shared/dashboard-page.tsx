"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { EventPanel } from "@/components/event-panel";
import { Card } from "../ui";

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
    <div className="w-full flex-1 min-h-0 flex flex-col gap-6 animate-in fade-in duration-500">
      
      {/* Dashboard Header */}
      <div className="shrink-0 flex items-end justify-between">
        <div className="flex flex-col animate-in slide-in-from-bottom-2 duration-500">
          <p className="body text-[var(--gray)] font-medium">Welcome back,</p>
          <h1 className="heading-xl mt-1">
            {displayName}
          </h1>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        
        {/* Left Side: Events Panel */}
        <Card className="lg:col-span-3 flex flex-col h-full p-0 overflow-hidden">
          <EventPanel />
        </Card>

        {/* Right Side: Dynamic Right Panel */}
        {rightPanel && (
          <div className="lg:col-span-1 flex flex-col gap-6 h-full min-h-0 overflow-y-auto custom-scrollbar pr-1">
            {rightPanel}
          </div>
        )}
        
      </div>
    </div>
  );
}