"use client";

import { useEffect, useState } from "react";
import { Calendar, MapPin, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Badge, Button, Card } from "@/components/ui";

//  types 

interface EventData {
  id: string;
  title: string;
  location: string;
  date: string;
  dayOfWeek: string;
  time: string;
  rawStartDate: string;
  rawEndDate: string;
  registrationStatus: string | null;
  category: string | null;
  banner_url: string | null;
}

interface EventGroup {
  dateLabel: string;
  dayOfWeek: string;
  events: EventData[];
}

//  helpers 

const CATEGORY_GRADIENT: Record<string, string> = {
  Orientation: "linear-gradient(135deg, #F4A7B9 0%, #B8B5E8 100%)",
  Forum:       "linear-gradient(135deg, #F4A7B9 0%, #FAF8FF 100%)",
  Research:    "linear-gradient(135deg, #B8B5E8 0%, #FAF8FF 100%)",
  Training:    "linear-gradient(135deg, #6DC5A0 0%, #FAF8FF 100%)",
  Workshop:    "linear-gradient(135deg, #2D2A4A 0%, #FAF8FF 100%)",
};
const DEFAULT_GRADIENT = "linear-gradient(135deg, #B8B5E8 0%, #2D2A4A 100%)";

type BadgeVariant = "pink" | "periwinkle" | "dark" | "success" | "warning" | "error";
const REG_STATUS_VARIANT: Record<string, BadgeVariant> = {
  registered: "periwinkle",
  attended:   "success",
  cancelled:  "error",
  pending:    "warning",
  invited:    "pink",
};

const formatDateLabel = (s: string) =>
  new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const formatDayOfWeek = (s: string) =>
  new Date(s).toLocaleDateString("en-US", { weekday: "long" });

const formatTime = (s: string) =>
  new Date(s).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

function groupByDate(events: EventData[]): EventGroup[] {
  const map = new Map<string, EventGroup>();
  for (const e of events) {
    if (!map.has(e.date)) {
      map.set(e.date, { dateLabel: e.date, dayOfWeek: e.dayOfWeek, events: [] });
    }
    map.get(e.date)!.events.push(e);
  }
  return Array.from(map.values());
}

//  component 
export const EventPanel = (): JSX.Element => {
  const supabase = createClient();
  const [events, setEvents]   = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState<"upcoming" | "past">("upcoming");

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) { setLoading(false); return; }

      // query from event_registration so we only get events the user registered for
      const { data, error } = await supabase
        .from("event_registration")
        .select(`
          status,
          event (
            id, title, location, start_date, end_date, banner_url, category
          )
        `)
        .eq("user_id", user.id)
        .neq("status", "cancelled")
        .order("event(start_date)", { ascending: true });

      if (error) { console.error("Failed to fetch events:", error.message); setLoading(false); return; }

      const mapped: EventData[] = (data ?? [])
        .filter((r: any) => r.event)
        .map((r: any) => {
          const e = r.event;
          return {
            id:                 e.id,
            title:              e.title,
            location:           e.location ?? "—",
            date:               formatDateLabel(e.start_date),
            dayOfWeek:          formatDayOfWeek(e.start_date),
            time:               formatTime(e.start_date),
            rawStartDate:       e.start_date,
            rawEndDate:         e.end_date ?? e.start_date,
            registrationStatus: r.status ?? null,
            category:           e.category ?? null,
            banner_url:         e.banner_url ?? null,
          };
        });

      setEvents(mapped);
      setLoading(false);
    };
    fetchEvents();
  }, []);

  // fallback to rawStartDate if end_date is null so the filter doesn't break
  const filteredEvents = events.filter((e) => {
    const compareDate = e.rawEndDate || e.rawStartDate;
    const isPast = new Date(compareDate) < new Date();
    return filter === "upcoming" ? !isPast : isPast;
  });

  const groups = groupByDate(filteredEvents);

  // render 
  return (
    <div className="flex flex-col h-full p-0 md:p-2 gap-1 md:gap-4">

      {/*  header  */}
    <div className="flex items-center justify-between shrink-0 min-w-0 w-full">
        <h2 className="heading-lg m-0">Events</h2>
        <div className="flex gap-1 p-1 rounded-[var(--radius-full)] bg-[var(--lavender)]">
          <Button
            variant={filter === "upcoming" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setFilter("upcoming")}
            style={{ borderRadius: "var(--radius-full)" }}
          >
            Upcoming
          </Button>
          <Button
            variant={filter === "past" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setFilter("past")}
            style={{ borderRadius: "var(--radius-full)" }}
          >
            Past
          </Button>
        </div>
      </div>

      {/*  scrollable timeline  */}
    <div className="w-full pb-4">

        {/* loading skeletons */}
        {loading && (
          <div className="flex flex-col gap-6 animate-pulse">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                {/* mobile skeleton: inline date row */}
                <div className="flex md:hidden items-center gap-3 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[var(--lavender)] shrink-0" />
                  <div className="h-3 w-32 rounded-full bg-[var(--lavender)]" />
                </div>
                {/* desktop skeleton: 3 columns */}
                <div className="hidden md:flex gap-4">
                  <div className="flex flex-col items-end gap-1 w-[110px] shrink-0 pt-4">
                    <div className="h-3 w-20 rounded-full bg-[var(--lavender)]" />
                    <div className="h-2.5 w-14 rounded-full bg-[var(--lavender)]" />
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--lavender)] mt-4" />
                    <div className="w-px h-20 bg-[var(--lavender)] mt-1" />
                  </div>
                  <div className="flex-1">
                    <Card>
                      <div className="flex gap-3">
                        <div className="w-16 h-16 rounded-[var(--radius-sm)] bg-[var(--lavender)] shrink-0" />
                        <div className="flex flex-col gap-2 flex-1 justify-center">
                          <div className="h-3 w-3/4 rounded-full bg-[var(--lavender)]" />
                          <div className="h-2.5 w-1/2 rounded-full bg-[var(--lavender)]" />
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
                {/* mobile skeleton: card */}
                <div className="md:hidden ml-5">
                  <Card variant="glass">
                    <div className="flex gap-3">
                      <div className="flex-1 flex flex-col gap-2 justify-center">
                        <div className="h-3 w-3/4 rounded-full bg-[var(--lavender)]" />
                        <div className="h-2.5 w-1/2 rounded-full bg-[var(--lavender)]" />
                      </div>
                      <div className="w-[72px] h-[72px] rounded-[var(--radius-sm)] bg-[var(--lavender)] shrink-0" />
                    </div>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* empty state */}
        {!loading && groups.length === 0 && (
          <Card variant="no-shadow" className="flex flex-col items-center justify-center text-center min-h-[220px] gap-3">
            <div className="w-14 h-14 rounded-full bg-[var(--lavender)] flex items-center justify-center">
              <Calendar size={26} className="text-[var(--periwinkle)]" />
            </div>
            <div>
              <p className="label text-[var(--primary-dark)]">No events found</p>
              <p className="caption text-[var(--gray)] mt-0.5">
                {filter === "upcoming"
                  ? "You haven't registered for any upcoming events."
                  : "You have no past registered events."}
              </p>
            </div>
            {filter === "upcoming" && (
              <Button
                variant="soft"
                size="sm"
                onClick={() => window.location.href = "student/events"}
              >
                Browse Events
              </Button>
            )}
          </Card>
        )}

        {/*  mobile timeline (< md devices)  border-left container, inline date row */}
        {!loading && groups.length > 0 && (
          <>
            <div
              className="md:hidden mx-1 mt-2"
              style={{ borderLeft: "1.5px solid rgba(45,42,74,0.10)" }}
            >
              {groups.map((group, gi) => (
                <div key={group.dateLabel} className={gi > 0 ? "mt-6" : ""}>

                  {/* date row: dot sits on the border line */}
                  <div className="flex items-center gap-3 -ml-[7px] mb-3">
                    <div
                      className="w-2 h-2 rounded-full shrink-0 ring-2 ring-white"
                      style={{ background: "var(--soft-pink)" }}
                    />
                    <span className="label text-[var(--primary-dark)]">{group.dateLabel}</span>
                    <span className="caption text-[var(--gray)]">{group.dayOfWeek}</span>
                  </div>

                  {/* cards */}
                  <div className="flex flex-col gap-3 pl-3">
                    {group.events.map((event) => {
                      const cover = event.banner_url
                        ? `url(${event.banner_url}) center/cover no-repeat`
                        : CATEGORY_GRADIENT[event.category ?? ""] ?? DEFAULT_GRADIENT;
                      return (
                        <Card key={event.id} className="hover:shadow-[var(--shadow-soft)] transition-shadow cursor-pointer">
                          <div className="flex gap-3 items-start">
                            {/* content first */}
                            <div className="flex flex-col gap-1 flex-1 min-w-0">
                              <span className="caption text-[var(--gray)] flex items-center gap-1">
                                <Clock size={11} />{event.time}
                              </span>
                              <p className="label leading-snug m-0 line-clamp-2">{event.title}</p>
                              <span className="caption text-[var(--gray)] flex items-center gap-1">
                                <MapPin size={11} />
                                <span className="truncate">{event.location}</span>
                              </span>
                              <div className="flex gap-1.5 flex-wrap mt-1">
                                {event.registrationStatus && (
                                  <Badge variant={REG_STATUS_VARIANT[event.registrationStatus.toLowerCase()] ?? "dark"}>
                                    <span className="capitalize">{event.registrationStatus}</span>
                                  </Badge>
                                )}
                                {event.category && <Badge variant="periwinkle">{event.category}</Badge>}
                              </div>
                            </div>
                            {/* thumbnail right */}
                            <div
                              className="w-[80px] h-[80px] rounded-[var(--radius-sm)] shrink-0"
                              style={{ background: cover }}
                            />
                          </div>
                        </Card>
                      );
                    })}
                  </div>

                </div>
              ))}
            </div>

            {/*  desktop timeline (md+)  3 columns: date | dot+line | cards */}
            <div className="hidden md:block">
              {groups.map((group, gi) => (
                <div key={group.dateLabel} className="flex gap-4">

                  {/* date column */}
                  <div className="flex flex-col items-end w-[110px] shrink-0 pt-[18px]">
                    <span className="label text-[var(--primary-dark)] leading-tight">{group.dateLabel}</span>
                    <span className="caption text-[var(--gray)]">{group.dayOfWeek}</span>
                  </div>

                  {/* dot n line */}
                  <div className="flex flex-col items-center">
                    <div
                      className="w-2.5 h-2.5 rounded-full mt-[22px] shrink-0 ring-2 ring-white"
                      style={{ background: "var(--soft-pink)" }}
                    />
                    {gi < groups.length - 1 && (
                      <div className="w-px flex-1 mt-1" style={{ background: "rgba(45,42,74,0.10)" }} />
                    )}
                  </div>

                  {/* cards */}
                  <div className="flex-1 flex flex-col gap-3 pb-6">
                    {group.events.map((event) => {
                      const cover = event.banner_url
                        ? `url(${event.banner_url}) center/cover no-repeat`
                        : CATEGORY_GRADIENT[event.category ?? ""] ?? DEFAULT_GRADIENT;
                      return (
                        <Card variant="glass" key={event.id} className="hover:shadow-[var(--shadow-soft)] transition-shadow cursor-pointer">
                          <div className="flex gap-3 items-start">
                            {/* thumbnail left on desktop */}
                            <div
                              className="w-[100px] h-[100px] rounded-[var(--radius-sm)] shrink-0"
                              style={{ background: cover }}
                            />
                            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                              <span className="caption text-[var(--gray)] flex items-center gap-1">
                                <Clock size={11} />{event.time}
                              </span>
                              <p className="label leading-snug line-clamp-2 m-0">{event.title}</p>
                              <span className="caption text-[var(--gray)] flex items-center gap-1">
                                <MapPin size={11} />{event.location}
                              </span>
                              <div className="flex gap-1.5 flex-wrap mt-0.5">
                                {event.registrationStatus && (
                                  <Badge variant={REG_STATUS_VARIANT[event.registrationStatus.toLowerCase()] ?? "dark"}>
                                    <span className="capitalize">{event.registrationStatus}</span>
                                  </Badge>
                                )}
                                {event.category && <Badge variant="periwinkle">{event.category}</Badge>}
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>

                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
};