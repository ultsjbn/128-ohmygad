"use client";

import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { EventCard } from "@/components/ui";

interface EventData {
  id: string;
  title: string;
  location: string;
  date: string;
  time: string;
  rawStartDate: string;
  status?: string | null;
  image?: string;
}

const formatDate = (start: string): string =>
  new Date(start).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

const formatTimeRange = (start: string, end: string): string => {
  const fmt = (d: Date) =>
    d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${fmt(new Date(start))} - ${fmt(new Date(end))}`;
};

export const EventPanel = (): JSX.Element => {
  const supabase = createClient();
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);

      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("event")
        .select(`
          id,
          title,
          location,
          start_date,
          end_date,
          banner,
          event_registration!inner (
            status
          )
        `)
        .eq("event_registration.user_id", user.id)
        .order("start_date", { ascending: true });

      if (error) {
        console.error("Failed to fetch events:", error.message);
        setLoading(false);
        return;
      }

      const mapped: EventData[] = (data ?? []).map((e: any) => ({
        id: e.id,
        title: e.title,
        location: e.location,
        date: formatDate(e.start_date),
        time: formatTimeRange(e.start_date, e.end_date),
        rawStartDate: e.start_date,
        status: e.event_registration?.[0]?.status ?? null,
        image: e.banner ?? undefined,
      }));

      setEvents(mapped);
      setLoading(false);
    };

    fetchEvents();
  }, []);

  return (
    <div className="flex flex-col h-full p-6">
      
      {/* HEADER */}
      <div className="flex justify-between items-center shrink-0 border-b border-[rgba(45,42,74,0.08)] pb-4 mb-6">
        <h2 className="heading-lg">My Events</h2>
      </div>

      {/* SCROLLABLE AREA */}
      <div className="flex-1 flex flex-col overflow-y-auto pr-2 min-h-0 custom-scrollbar pb-4">
        
        {loading ? (
          <div className="flex flex-1 items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-[var(--periwinkle-light)] border-t-[var(--periwinkle)] rounded-full animate-spin"></div>
          </div>
        ) : events.length > 0 ? (
          
          <div className="flex flex-col gap-6">
            {events.map((event) => (
              <div key={event.id} className="flex flex-col xl:flex-row gap-4 justify-between items-start">
                {/* Date Indicator Column */}
                <div className="flex flex-none items-center xl:items-start gap-3 xl:pt-4 min-w-[140px] shrink-0">
                  <div className="w-10 h-10 rounded-full bg-[var(--periwinkle-light)] text-[var(--periwinkle)] flex items-center justify-center">
                    <Calendar size={18} strokeWidth={2.5} />
                  </div>
                  <span className="font-bold text-[var(--primary-dark)] text-sm">{event.date}</span>
                </div>
                
                {/* Event Card Column */}
                <div className="flex-1 w-full min-w-0">
                  <EventCard 
                    title={event.title}
                    category={event.status || "Registered"} 
                    date={`${event.date} · ${event.time}`}
                    location={event.location}
                    registered={0} 
                    capacity={0}   
                    gradient="linear-gradient(135deg, #F4A7B9, #c8b3e8)"
                    onRegister={() => console.log("Navigate to event details:", event.id)}
                  />
                </div>
              </div>
            ))}
          </div>

        ) : (
          
          <div className="flex-1 flex flex-col items-center justify-center text-center border-2 border-dashed border-[rgba(45,42,74,0.12)] rounded-xl bg-white/50 min-h-[250px] p-6">
            <div className="w-16 h-16 rounded-full bg-[var(--lavender)] flex items-center justify-center mb-4">
              <Calendar size={28} className="text-[var(--periwinkle)]" />
            </div>
            <p className="font-bold text-[var(--primary-dark)] mb-1">No events found</p>
            <p className="body text-[var(--gray)]">
              You are not registered for any events yet.
            </p>
          </div>

        )}
      </div>
    </div>
  );
};