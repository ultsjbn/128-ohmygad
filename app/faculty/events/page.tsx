"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Paper, InputText } from "@snowball-tech/fractal";
import { Typography } from "@/components/typography";
import { Search, CalendarDays, MapPin, Users } from "lucide-react";
import type { EventFormData } from "@/components/admin/event-form";

export default function EventsPage() {
    const [events, setEvents] = useState<EventFormData[]>([]);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchEvents() {
            const supabase = createClient();
            const { data, error } = await supabase
                .from("event")
                .select("id, title, description, category, status, start_date, end_date, capacity, location, registration_open, registration_close")
                .order("start_date", { ascending: false });

            if (error) {
                console.error("[faculty/events] Supabase error:", error);
                setError(error.message);
            } else if (data) {
                setEvents(data);
            }
            setIsLoading(false);
        }
        fetchEvents();
    }, []);

    const filtered = events.filter((e) =>
        `${e.title} ${e.category || ""} ${e.location || ""}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    return (
        <div className="max-w-[1400px] w-full flex flex-col gap-6">
            <Paper elevation="bordered" title="Events" titleVariant="heading-2" className="flex flex-col gap-4">
                <div className="flex items-center gap-2 w-full pb-3 border-b border-fractal-base-grey-70">
                    <div className="flex items-center gap-2 w-full max-w-sm">
                        <Search size={16} className="text-fractal-text-placeholder" />
                        <InputText
                            value={search}
                            onChange={(e: any) => setSearch(e.target.value)}
                            placeholder="Search events..."
                            className="flex-1 bg-transparent outline-none text-sm font-sans"
                        />
                    </div>
                </div>

                {isLoading && <Typography variant="body-2">Loading events...</Typography>}

                {error && (
                    <Typography variant="body-2" className="text-red-600">
                        Error loading events: {error}
                    </Typography>
                )}

                {!isLoading && !error && filtered.length === 0 && (
                    <Typography variant="body-2" className="text-fractal-text-placeholder">
                        {search ? "No events match your search." : "No events available."}
                    </Typography>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {filtered.map((event) => (
                        <div
                            key={event.id}
                            className="flex flex-col gap-2 border-2 border-fractal-border-default rounded-s bg-white hover:shadow-brutal-1 transition-all overflow-hidden"
                        >
                            {/* Top accent bar */}
                            <div className="h-1.5 w-full bg-fractal-decorative-blue-70" />

                            <div className="flex items-start justify-between px-4 pt-2">
                                <div className="flex-1">
                                    <Typography variant="body-1-median">{event.title}</Typography>
                                </div>
                                <span className="px-2 py-0.5 text-xs font-median border border-fractal-base-grey-70 rounded-fractal-xs bg-fractal-base-grey-90 capitalize">
                                    {event.status || "—"}
                                </span>
                            </div>

                            {/* Description and details */}
                            <div className="flex flex-col gap-1.5 px-4">
                                <Typography variant="body-2" className="text-fractal-text-placeholder">
                                    {event.description || "—"}
                                </Typography>
                                <Typography variant="body-2" className="text-fractal-text-placeholder flex items-center gap-1">
                                    <CalendarDays size={13} />
                                    <strong>Date:</strong>{" "}
                                    {event.start_date
                                        ? new Date(event.start_date).toLocaleDateString("en-PH", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })
                                        : "—"}
                                </Typography>
                                <Typography variant="body-2" className="text-fractal-text-placeholder flex items-center gap-1">
                                    <MapPin size={13} />
                                    <strong>Location:</strong> {event.location || "—"}
                                </Typography>
                                <Typography variant="body-2" className="text-fractal-text-placeholder flex items-center gap-1">
                                    <Users size={13} />
                                    <strong>Capacity:</strong> {event.capacity ?? "—"}
                                </Typography>
                            </div>

                            {/* Category footer */}
                            <div className="px-4 pb-3 pt-1 mt-auto border-t border-fractal-base-grey-90">
                                <span className="px-2 py-0.5 rounded-s text-xs font-median border-2 border-fractal-border-default bg-fractal-base-grey-90">
                                    {event.category || "—"}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </Paper>
        </div>
    );
}