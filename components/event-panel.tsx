"use client";

import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
// import { EventCard } from "@/components/ui";
import { Typography } from "./typography";
import { Button } from "@/components/ui";
import { Loader } from "@snowball-tech/fractal";

interface EventData {
  id: string;
  title: string;
  location: string;
  date: string;
  time: string;
  rawStartDate: string;
  status?: string | null;
  image?: string;
  rawEndDate: string;
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
  const [filter, setFilter] = useState<"upcoming" | "past">("upcoming");

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
          event_registration (
            status,
            user_id
          )
        `)
        .order("start_date", { ascending: true });

      if (error) {
        console.error("Failed to fetch events:", error.message);
        setLoading(false);
        return;
      }

      const mapped: EventData[] = (data ?? []).map((e: any) => {
        const userReg = Array.isArray(e.event_registration)
          ? e.event_registration.find((r: any) => r.user_id === user.id)
          : e.event_registration;

        return {
          id: e.id,
          title: e.title,
          location: e.location,
          date: formatDate(e.start_date),
          time: formatTimeRange(e.start_date, e.end_date),
          status: userReg?.status ?? null,
          image: e.banner ?? undefined,
          rawStartDate: e.start_date,
          rawEndDate: e.end_date,
        };
      });

      setEvents(mapped);
      setLoading(false);
    };

    fetchEvents();
  }, []);

  const filteredEvents = events.filter((event) => {
    const isPast = new Date(event.rawEndDate) < new Date();
    return filter === "upcoming" ? !isPast : isPast;
  });

  return (
    <div className="flex flex-col h-full p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center shrink-0">
        <Typography variant="heading-1">Events</Typography>
        <div className="flex gap-2">
          <Button
            variant={filter === "upcoming" ? "pink" : "periwinkle"}
            onClick={() => setFilter("upcoming")}
          >
            Upcoming
          </Button>
          <Button
            variant={filter === "past" ? "pink" : "periwinkle"}
            onClick={() => setFilter("past")}
          >
            Past
          </Button>
        </div>
      </div>

      {/* SCROLLABLE AREA */}
      <div className="flex-1 flex flex-col overflow-y-auto pr-2 min-h-0 custom-scrollbar pb-4 mt-6">
        {loading ? (
          <div className="flex flex-1 items-center justify-center py-12">
            <Loader size="l" />
          </div>
        ) : filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <div key={event.id} className="flex flex-row gap-4 justify-between mb-4">
              <div className="flex flex-none items-start gap-2 pt-3 min-w-[160px] shrink-0">
                <Calendar size={18} strokeWidth={2.5} className="text-black" />
                <span className="text-sm font-bold">{event.date}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center border-2 border-dashed border-[rgba(45,42,74,0.12)] rounded-xl bg-white/50 min-h-[250px] p-6">
            <div className="w-16 h-16 rounded-full bg-[var(--lavender)] flex items-center justify-center mb-4">
              <Calendar size={28} className="text-[var(--periwinkle)]" />
            </div>
            <p className="font-bold text-[var(--primary-dark)] mb-1">No events found</p>
            <p className="text-sm text-[var(--gray)]">
              You are not registered for any events yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};