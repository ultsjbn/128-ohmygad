import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import { Typography } from "./typography";
import { createClient } from "@/lib/supabase/client";
import EventCard from "./event-card";
import { Button } from "./button";
import { Loader } from "@snowball-tech/fractal";

interface Event {
  id: string;
  date: string;
  title: string;
  location: string;
  time: string;
  status?: string | null;
  image?: string;
  // added rawEndDate field to Event interface for filtering
  rawEndDate: string;
}

// ─── format helpers ─────────────────────────────────────────────────────────────────

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

// ─── Event Panel ─────────────────────────────────────────────────────────────

export const EventPanel = (): JSX.Element => {
  const supabase = createClient();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  // added state to hold current filter selection
  const [filter, setFilter] = useState<"upcoming" | "past">("upcoming");

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);

      // get the currently logged-in user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setLoading(false);
        return;
      }

      // fetch events + current user's registration status
      const { data, error } = await supabase
        .from("event")
        .select(
          `
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
        `,
        )
        .order("start_date", { ascending: true });

      if (error) {
        console.error("Failed to fetch events:", error.message);
        setLoading(false);
        return;
      }

      const mapped: Event[] = (data ?? []).map((e: any) => {
        // this is to specifically find user's registration among all the registrations
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
          // added rawEndDate mapping to use for date comparisons
          rawEndDate: e.end_date,
        };
      });

      setEvents(mapped);
      setLoading(false);
    };

    fetchEvents();
  }, []);

  // added logic to filter events based on current date and selected filter
  const filteredEvents = events.filter((event) => {
    const isPast = new Date(event.rawEndDate) < new Date();
    return filter === "upcoming" ? !isPast : isPast;
  });

  return (
    <div className="flex flex-col gap-6 h-full font-clash">
      {/* HEADER */}
      <div className="flex justify-between items-center shrink-0">
        <Typography variant="heading-1">Events</Typography>
        <div className="flex gap-2">
          {/* added logic to change button variant based on active filter, and onClick to set filtered view */}
          <Button
            label="Upcoming"
            variant={filter === "upcoming" ? "display" : "primary"}
            onClick={() => setFilter("upcoming")}
          />
          <Button
            label="Past"
            variant={filter === "past" ? "display" : "primary"}
            onClick={() => setFilter("past")}
          />
        </div>
      </div>

      {/* SCROLLABLE LIST */}
      <div className="flex flex-col gap-8 overflow-y-auto pr-4 pb-24 pt-4 custom-scrollbar">
        {loading ? (
          <div className="flex flex-1 items-center justify-center py-12">
            <Loader size="l" />
          </div>
        ) : (
          /* I replaced mapping array from events to filteredEvents to display only selected ones */
          filteredEvents.map((event) => (
            <div key={event.id} className="flex flex-row gap-4 justify-between">
              <div className="flex flex-none items-start gap-2 pt-3 min-w-[160px] shrink-0">
                <Calendar size={18} strokeWidth={2.5} className="text-black" />
                <span className="text-sm font-bold">{event.date}</span>
              </div>
              <EventCard event={event} />
            </div>
          ))
        )}

        {/* Replaced events.length check with filteredEvents.length */}
        {!loading && filteredEvents.length === 0 && (
          <p className="text-sm text-gray-400 font-medium">No events found.</p>
        )}
      </div>
    </div>
  );
};
