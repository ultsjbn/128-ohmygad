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
            status
          )
        `,
        )
        .eq("event_registration.user_id", user.id)
        .order("start_date", { ascending: true });

      if (error) {
        console.error("Failed to fetch events:", error.message);
        setLoading(false);
        return;
      }

      const mapped: Event[] = (data ?? []).map((e: any) => ({
        id: e.id,
        title: e.title,
        location: e.location,
        date: formatDate(e.start_date),
        time: formatTimeRange(e.start_date, e.end_date),
        // event_registration will grab the first (user's) row
        status: e.event_registration?.[0]?.status ?? null,
        image: e.banner ?? undefined,
      }));

      setEvents(mapped);
      setLoading(false);
    };

    fetchEvents();
  }, []);

  return (
    <div className="flex flex-col gap-6 h-full font-clash">
      {/* HEADER */}
      <div className="flex justify-between items-center shrink-0">
        <Typography variant="heading-1">Events</Typography>
        <div className="flex gap-2">
          <Button label="Upcoming" variant="display" />
          <Button label="Past" variant="primary" />
        </div>
      </div>

      {/* SCROLLABLE LIST */}
      <div className="flex flex-col gap-8 overflow-y-auto pr-4 pb-24 pt-4 custom-scrollbar">
        {loading ? (
          <div className="flex flex-1 items-center justify-center py-12">
            <Loader size="l"/>
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="flex flex-row gap-4 justify-between">
              <div className="flex flex-none items-start gap-2 pt-3 min-w-[160px] shrink-0">
                <Calendar size={18} strokeWidth={2.5} className="text-black" />
                <span className="text-sm font-bold">{event.date}</span>
              </div>
              <EventCard event={event} />
            </div>
          ))
        )}

        {!loading && events.length === 0 && (
          <p className="text-sm text-gray-400 font-medium">No events found.</p>
        )}
      </div>
    </div>
  );
};
