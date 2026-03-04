"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Paper } from "@snowball-tech/fractal";
import { InputText } from "@snowball-tech/fractal";
import { Plus, Pencil, Trash2, Search, ArrowUpDown, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { EventFormData } from "@/components/admin/event-form";
import { Button } from "@/components/button";
import { Typography } from "@/components/typography";

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventFormData[]>([]);
  const [filtered, setFiltered] = useState<EventFormData[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const getEvents = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
    .from("event")
    .select("id, title, description, category, status, start_date, end_date, capacity, location, registration_open, registration_close")
    .order("start_date", { ascending: false });

    if (!error && data) {
      setEvents(data);
      setFiltered(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    getEvents();
  }, []);

  // Search filter
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      events.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.category?.toLowerCase().includes(q) ||
          e.location?.toLowerCase().includes(q)
      )
    );
  }, [search, events]);

  const handleDelete = async (id: string, title: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${title}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingId(id);
    const supabase = createClient();
    const { error } = await supabase.from("event").delete().eq("id", id);

    if (error) {
      alert("Failed to delete event: " + error.message);
    } else {
      setEvents((prev) => prev.filter((e) => e.id !== id));
    }
    setDeletingId(null);
  };

  return (
    <div className="mx-auto h-full flex flex-col gap-6">

      <div className="flex flex-col gap-1">
        <Typography variant="heading-2">Events Management</Typography>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <InputText placeholder="Search by title, category, or location..." fullWidth prefix={<Search size={18} />} />

        <div className="flex items-center gap-2 shrink-0">
          <Button label="Sort" variant="display" icon={<ArrowUpDown size={18} />} iconPosition="left" onClick={() => { }} />
          <Button label="Filter" variant="display" icon={<SlidersHorizontal size={18} />} iconPosition="left" onClick={() => { }} />
          <Button label="Add User" variant="primary-dark" icon={<Plus size={18} />} iconPosition="left" onClick={() => router.push("/admin/events/create")} />
        </div>

      </div>

      {/* Table */}
      <Paper elevation="elevated" className="overflow-hidden p-0">
        {isLoading ? (
          <div className="p-8 text-center">
            <Typography
              variant="body-1"
              className="text-fractal-text-placeholder"
            >
              Loading events...
            </Typography>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <Typography
              variant="body-1"
              className="text-fractal-text-placeholder"
            >
              {search
                ? "No events match your search."
                : "No events yet. Create one to get started."}
            </Typography>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b-2 border-fractal-border-default bg-fractal-base-grey-90">
              <tr>
                <th className="text-left p-3 font-median">Title</th>
                <th className="text-left p-3 font-median">Category</th>
                <th className="text-left p-3 font-median">Status</th>
                <th className="text-left p-3 font-median">Date</th>
                <th className="text-left p-3 font-median">Capacity</th>
                <th className="text-left p-3 font-median">Location</th>
                <th className="text-right p-3 font-median">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((event, i) => (
                <tr
                  key={event.id}
                  className={`border-b border-fractal-border-default hover:bg-fractal-base-grey-90 transition-colors ${
                    i % 2 === 0
                      ? "bg-fractal-bg-body-white"
                      : "bg-fractal-bg-body-default"
                  }`}
                >
                  <td className="p-3 font-median max-w-[200px] truncate">
                    {event.title}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-s text-xs font-median border-2 border-fractal-border-default bg-fractal-base-grey-90`}
                    >
                      {event.category}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-s text-xs font-median capitalize border border-fractal-border-default`}
                    >
                      {event.status}
                    </span>
                  </td>
                  <td className="p-3 text-fractal-text-placeholder whitespace-nowrap">
                    {event.start_date
                      ? new Date(event.start_date).toLocaleDateString("en-PH", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                  <td className="p-3">{event.capacity}</td>
                  <td className="p-3 text-fractal-text-placeholder max-w-[150px] truncate">
                    {event.location}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() =>
                          router.push(`/admin/events/${event.id}/edit`)
                        }
                        className="p-2 hover:bg-fractal-decorative-yellow-90 border-2 border-fractal-border-default rounded-s shadow-brutal-1 transition-colors"
                        title="Edit event"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(event.id!, event.title)}
                        disabled={deletingId === event.id}
                        className="p-2 hover:bg-fractal-decorative-yellow-90 border-2 border-fractal-border-default rounded-s shadow-brutal-1 transition-colors"
                        title="Delete event"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Paper>
    </div>
  );
}