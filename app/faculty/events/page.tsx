"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Paper, InputText, Button, Typography } from "@snowball-tech/fractal";
import { Search, CalendarDays, MapPin, Users, ArrowUpDown, SlidersHorizontal } from "lucide-react";
import type { EventFormData } from "@/components/admin/event-form";

const CATEGORIES = ["All", "Orientation", "Forum", "Research", "Training", "Workshop"];
const STATUSES = ["All", "upcoming", "past"];
const SORT_OPTIONS = ["Newest", "Oldest"];

export default function EventsPage() {
  const [events, setEvents] = useState<EventFormData[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter + sort state
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("Newest");
  const [showSort, setShowSort] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    async function fetchEvents() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("event")
        .select("id, title, description, category, status, start_date, end_date, capacity, location, registration_open, registration_close")
        .order("start_date", { ascending: false });

      if (error) {
        setError(error.message);
      } else if (data) {
        setEvents(data);
      }
      setIsLoading(false);
    }
    fetchEvents();
  }, []);

  // Apply search, filter, sort
  const filtered = events
    .filter((e) =>
      `${e.title} ${e.category || ""} ${e.location || ""}`
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .filter((e) => categoryFilter === "All" || e.category === categoryFilter)
    .filter((e) => statusFilter === "All" || e.status === statusFilter)
    .sort((a, b) => {
      const dateA = new Date(a.start_date ?? "").getTime();
      const dateB = new Date(b.start_date ?? "").getTime();
      return sortOrder === "Newest" ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="mx-auto h-full flex flex-col gap-6">

      {/* Search + Sort + Filter row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
        <InputText
          placeholder="Search by title, category, or location..."
          fullWidth
          prefix={<Search size={18} />}
          onChange={(_e, value) => setSearch(value)}
        />
        <div className="flex items-center gap-2 shrink-0 relative">
          {/* Sort button + dropdown */}
          <div className="relative">
            <Button
              label="Sort"
              variant="display"
              icon={<ArrowUpDown size={18} />}
              iconPosition="left"
              onClick={() => { setShowSort((p) => !p); setShowFilter(false); }}
            />
            {showSort && (
              <div className="absolute right-0 top-full mt-1 z-10 bg-fractal-bg-body-white border-2 border-fractal-border-default rounded-s shadow-brutal-2 min-w-[140px]">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => { setSortOrder(opt); setShowSort(false); }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-fractal-base-grey-90 transition-colors ${
                      sortOrder === opt ? "font-median bg-fractal-decorative-yellow-90" : ""
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filter button + dropdown */}
          <div className="relative">
            <Button
              label="Filter"
              variant="display"
              icon={<SlidersHorizontal size={18} />}
              iconPosition="left"
              onClick={() => { setShowFilter((p) => !p); setShowSort(false); }}
            />
            {showFilter && (
              <div className="absolute right-0 top-full mt-1 z-10 bg-fractal-bg-body-white border-2 border-fractal-border-default rounded-s shadow-brutal-2 min-w-[200px] p-3 flex flex-col gap-3">
                {/* Category filter */}
                <div className="flex flex-col gap-1">
                  <Typography variant="body-2" className="font-median text-fractal-text-placeholder">
                    Category
                  </Typography>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`text-left px-3 py-1.5 text-sm rounded-s hover:bg-fractal-base-grey-90 transition-colors ${
                        categoryFilter === cat ? "font-median bg-fractal-decorative-yellow-90 border border-fractal-border-default" : ""
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Status filter */}
                <div className="flex flex-col gap-1">
                  <Typography variant="body-2" className="font-median text-fractal-text-placeholder">
                    Status
                  </Typography>
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`text-left px-3 py-1.5 text-sm rounded-s capitalize hover:bg-fractal-base-grey-90 transition-colors ${
                        statusFilter === s ? "font-median bg-fractal-decorative-yellow-90 border border-fractal-border-default" : ""
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {/* Clear filters */}
                <button
                  onClick={() => { setCategoryFilter("All"); setStatusFilter("All"); setShowFilter(false); }}
                  className="text-xs text-fractal-text-placeholder underline text-left mt-1 hover:text-fractal-text-default transition-colors"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {(categoryFilter !== "All" || statusFilter !== "All") && (
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <Typography variant="body-2" className="text-fractal-text-placeholder">
            Filters:
          </Typography>
          {categoryFilter !== "All" && (
            <span className="px-2 py-0.5 text-xs font-median border-2 border-fractal-border-default rounded-s bg-fractal-decorative-yellow-90 shadow-brutal-1 flex items-center gap-1">
              {categoryFilter}
              <button onClick={() => setCategoryFilter("All")} className="ml-1 hover:text-red-500">×</button>
            </span>
          )}
          {statusFilter !== "All" && (
            <span className="px-2 py-0.5 text-xs font-median border-2 border-fractal-border-default rounded-s bg-fractal-decorative-yellow-90 shadow-brutal-1 capitalize flex items-center gap-1">
              {statusFilter}
              <button onClick={() => setStatusFilter("All")} className="ml-1 hover:text-red-500">×</button>
            </span>
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex-1">
        {isLoading ? (
          <div className="p-8 text-center">
            <Typography variant="body-1" className="text-fractal-text-placeholder">
              Loading events...
            </Typography>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <Typography variant="body-2" className="text-red-600">
              Error loading events: {error}
            </Typography>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <Typography variant="body-1" className="text-fractal-text-placeholder">
              {search ? "No events match your search." : "No events available."}
            </Typography>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((event) => (
              <div
                key={event.id}
                className="flex flex-col gap-2 border-2 border-fractal-border-default bg-fractal-bg-body-white hover:bg-fractal-base-grey-90 transition-colors overflow-hidden"
              >
                {/* Top accent bar */}
                <div className="h-1.5 w-full bg-fractal-brand-primary" />

                <div className="flex items-start justify-between px-4 pt-2">
                  <Typography variant="body-1-median" className="flex-1">
                    {event.title}
                  </Typography>
                  <span className="px-2 py-0.5 text-xs font-median border border-fractal-base-grey-70 rounded-s bg-fractal-base-grey-90 capitalize ml-2 shrink-0">
                    {event.status || "—"}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 px-4">
                  <Typography variant="body-2" className="text-fractal-text-placeholder line-clamp-2">
                    {event.description || "—"}
                  </Typography>
                  <Typography variant="body-2" className="text-fractal-text-placeholder flex items-center gap-1">
                    <CalendarDays size={13} />
                    {event.start_date
                      ? new Date(event.start_date).toLocaleDateString("en-PH", {
                          month: "short", day: "numeric", year: "numeric",
                        })
                      : "—"}
                  </Typography>
                  <Typography variant="body-2" className="text-fractal-text-placeholder flex items-center gap-1">
                    <MapPin size={13} />
                    {event.location || "—"}
                  </Typography>
                  <Typography variant="body-2" className="text-fractal-text-placeholder flex items-center gap-1">
                    <Users size={13} />
                    Capacity: {event.capacity ?? "—"}
                  </Typography>
                </div>

                <div className="px-4 pb-3 pt-1 mt-auto border-t border-fractal-base-grey-90">
                  <span className="px-2 py-0.5 rounded-s text-xs font-median border-2 border-fractal-border-default bg-fractal-base-grey-90">
                    {event.category || "—"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}