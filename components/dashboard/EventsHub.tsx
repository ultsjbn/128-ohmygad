"use client";

import { LayoutGrid, List } from "lucide-react";
import { useState } from "react";

interface EventItem {
    id: number;
    title: string;
    subtitle: string;
    date: string;
}

const SAMPLE_EVENTS: EventItem[] = [
    {
        id: 1,
        title: "Faculty Assembly",
        subtitle: "Room 301 · Feb 28, 2026 · 9:00 AM",
        date: "Feb 28",
    },
    {
        id: 2,
        title: "Mid-Term Exam Week",
        subtitle: "All sections · Mar 3–7, 2026",
        date: "Mar 3",
    },
    {
        id: 3,
        title: "Career Fair",
        subtitle: "Gymnasium · Mar 15, 2026 · 8:00 AM",
        date: "Mar 15",
    },
];

export function EventsHub() {
    const [view, setView] = useState<"list" | "grid">("list");

    return (
        <section>
            <div className="events-hub-header">
                <h2>Events Hub</h2>
                <div className="view-toggles">
                    <button
                        className={`view-toggle-btn${view === "grid" ? "" : " inactive"}`}
                        title="Grid view"
                        onClick={() => setView("grid")}
                    >
                        <LayoutGrid size={14} />
                    </button>
                    <button
                        className={`view-toggle-btn${view === "list" ? "" : " inactive"}`}
                        title="List view"
                        onClick={() => setView("list")}
                    >
                        <List size={14} />
                    </button>
                </div>
            </div>

            <div className="events-list">
                {SAMPLE_EVENTS.map((event, idx) => (
                    <div className="event-row" key={event.id}>
                        {/* Left meta column */}
                        <div className="event-row-meta">
                            <div className="event-meta-lines">
                                <div className="event-meta-line" />
                                <div className="event-meta-line" />
                            </div>
                        </div>

                        {/* Timeline column */}
                        <div className="event-timeline">
                            <div className="timeline-dot" />
                            {idx < SAMPLE_EVENTS.length - 1 && (
                                <div className="timeline-line" />
                            )}
                        </div>

                        {/* Event card */}
                        <div className="event-card">
                            <div className="event-card-title">{event.title}</div>
                            <div className="event-card-sub">{event.subtitle}</div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
