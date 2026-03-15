"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { InputText, Button, Typography } from "@snowball-tech/fractal";
import { Search, CalendarDays, MapPin, Users, ArrowUpDown, SlidersHorizontal, ChevronUp, ChevronDown } from "lucide-react";
import type { EventFormData } from "@/components/admin/event-form";

type SortField = "title" | "category" | "status" | "start_date" | "capacity" | "location";
type SortDirection = "asc" | "desc";

interface SortState {
  field: SortField;
  direction: SortDirection;
}

interface FilterState {
  status: string[];
  category: string[];
}

const sortOptions: { label: string; field: SortField }[] = [
  { label: "Title", field: "title" },
  { label: "Category", field: "category" },
  { label: "Status", field: "status" },
  { label: "Date", field: "start_date" },
  { label: "Capacity", field: "capacity" },
  { label: "Location", field: "location" },
];

export default function EventsPage() {
  const [events, setEvents] = useState<EventFormData[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<SortState>({ field: "start_date", direction: "desc" });
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ status: [], category: [] });

  const statuses = Array.from(
    new Set(events.map((e) => e.status?.toLowerCase().trim()).filter(Boolean))
  );
  const categories = Array.from(new Set(events.map((e) => e.category).filter(Boolean)));
  const hasActiveFilters = filters.status.length > 0 || filters.category.length > 0;

  useEffect(() => {
    async function fetchEvents() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("event")
        .select("id, title, description, category, status, start_date, end_date, capacity, location, registration_open, registration_close")
        .order("start_date", { ascending: false });

      if (error) setError(error.message);
      else if (data) setEvents(data);
      setIsLoading(false);
    }
    fetchEvents();
  }, []);

  const sortEvents = (eventsToSort: EventFormData[], sortState: SortState): EventFormData[] => {
    const { field, direction } = sortState;
    const sorted = [...eventsToSort];
    sorted.sort((a, b) => {
      let aVal: any = a[field as keyof EventFormData];
      let bVal: any = b[field as keyof EventFormData];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return direction === "asc" ? 1 : -1;
      if (bVal == null) return direction === "asc" ? -1 : 1;
      if (field === "start_date") { aVal = new Date(aVal).getTime(); bVal = new Date(bVal).getTime(); }
      if (typeof aVal === "string" && typeof bVal === "string") { aVal = aVal.toLowerCase(); bVal = bVal.toLowerCase(); }
      if (aVal < bVal) return direction === "asc" ? -1 : 1;
      if (aVal > bVal) return direction === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  };

  const handleSort = (field: SortField) => {
    setSort((prev) => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
    setShowSortMenu(false);
  };

  const toggleFilter = (type: "status" | "category", value: string) => {
    setFilters((prev) => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter((v) => v !== value)
        : [...prev[type], value],
    }));
  };

  const clearFilters = () => setFilters({ status: [], category: [] });

  const getSortIndicator = (field: SortField) => {
    if (sort.field !== field) return null;
    return sort.direction === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  const filtered = sortEvents(
    events
      .filter((e) =>
        `${e.title} ${e.category || ""} ${e.location || ""}`.toLowerCase().includes(search.toLowerCase())
      )
      .filter((e) => filters.status.length === 0 || filters.status.includes(e.status?.toLowerCase().trim()))
      .filter((e) => filters.category.length === 0 || filters.category.includes(e.category)),
    sort
  );

  return (
    <div className="mx-auto h-full flex flex-col gap-6">

      {/* Search + Sort + Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
        <InputText
          placeholder="Search by title, category, or location..."
          fullWidth
          prefix={<Search size={18} />}
          onChange={(_e, value) => setSearch(value)}
          value={search}
        />
        <div className="flex items-center gap-2 shrink-0">
          {/* Sort */}
          <div className="relative">
            <Button
              label={`Sort${sort.field !== "start_date" ? ": " + sortOptions.find((o) => o.field === sort.field)?.label : ""}`}
              variant="display"
              icon={<ArrowUpDown size={18} />}
              iconPosition="left"
              onClick={() => { setShowSortMenu(!showSortMenu); setShowFilterMenu(false); }}
              className="whitespace-nowrap"
            />
            {showSortMenu && (
              <div className="absolute top-full right-0 mt-2 bg-fractal-bg-body-white border-2 border-fractal-border-default rounded-s shadow-brutal-2 z-40 min-w-[180px]">
                {sortOptions.map((option) => (
                  <button
                    key={option.field}
                    onClick={() => handleSort(option.field)}
                    className={`w-full text-left px-4 py-2 text-sm font-median hover:bg-fractal-base-grey-90 transition-colors flex items-center justify-between ${
                      sort.field === option.field ? "bg-fractal-decorative-yellow-90" : ""
                    }`}
                  >
                    <span>{option.label}</span>
                    {sort.field === option.field && <span className="ml-2">{getSortIndicator(option.field)}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filter */}
          <div className="relative">
            <Button
              label="Filter"
              variant={hasActiveFilters ? "primary-dark": "display"}
              icon={<SlidersHorizontal size={18} />}
              iconPosition="left"
              onClick={() => { setShowFilterMenu(!showFilterMenu); setShowSortMenu(false); }}
              className="whitespace-nowrap"
            />
            {showFilterMenu && (
              <div className="absolute top-full right-0 mt-2 bg-fractal-bg-body-white border-2 border-fractal-border-default rounded-s shadow-brutal-2 z-40 min-w-[240px] max-h-96 overflow-y-auto">
                {statuses.length > 0 && (
                  <div className="border-b border-fractal-border-default p-3">
                    <Typography variant="body-2-median" className="mb-2 block">Status</Typography>
                    {statuses.map((status) => (
                      <label key={status} className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-fractal-base-grey-90 rounded transition-colors">
                        <input
                          type="checkbox"
                          checked={filters.status.includes(status)}
                          onChange={() => toggleFilter("status", status)}
                          className="w-4 h-4 appearance-none border-2 border-fractal rounded-full bg-white checked:bg-fractal-brand-primary"
                        />
                        <Typography variant="body-2" className="capitalize">{status}</Typography>
                      </label>
                    ))}
                  </div>
                )}
                {categories.length > 0 && (
                  <div className="border-b border-fractal-border-default p-3">
                    <Typography variant="body-2-median" className="mb-2 block">Category</Typography>
                    {categories.map((category) => (
                      <label key={category} className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-fractal-base-grey-90 rounded transition-colors">
                        <input
                          type="checkbox"
                          checked={filters.category.includes(category)}
                          onChange={() => toggleFilter("category", category)}
                          className="w-4 h-4 appearance-none border-2 border-fractal rounded-full bg-white checked:bg-fractal-brand-primary"
                        />
                        <Typography variant="body-2">{category}</Typography>
                      </label>
                    ))}
                  </div>
                )}
                {hasActiveFilters && (
                  <div className="p-3">
                    <button
                      onClick={() => { clearFilters(); setShowFilterMenu(false); }}
                      className="text-xs text-fractal-text-placeholder underline hover:text-fractal-text-default transition-colors"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="p-8 text-center">
          <Typography variant="body-1" className="text-fractal-text-placeholder">Loading events...</Typography>
        </div>
      ) : error ? (
        <div className="p-8 text-center">
          <Typography variant="body-2" className="text-red-600">Error: {error}</Typography>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center">
          <Typography variant="body-1" className="text-fractal-text-placeholder">
            {hasActiveFilters ? "No events match your filters." : search ? "No events match your search." : "No events available."}
          </Typography>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((event) => (
            <div
              key={event.id}
              className="flex flex-col gap-2 border-2 border-fractal-border-default rounded-s bg-fractal-bg-body-white hover:shadow-brutal-1 transition-all overflow-hidden"
            >
              <div className="h-1.5 w-full bg-fractal-brand-primary" />
              <div className="flex items-start justify-between px-4 pt-2">
                <Typography variant="body-1-median" className="flex-1">{event.title}</Typography>
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
                  {event.start_date ? new Date(event.start_date).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                </Typography>
                <Typography variant="body-2" className="text-fractal-text-placeholder flex items-center gap-1">
                  <MapPin size={13} />{event.location || "—"}
                </Typography>
                <Typography variant="body-2" className="text-fractal-text-placeholder flex items-center gap-1">
                  <Users size={13} />Capacity: {event.capacity ?? "—"}
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

      {!isLoading && !error && (
        <Typography variant="body-2" className="text-fractal-text-placeholder shrink-0">
          Showing {filtered.length} of {events.length} events
        </Typography>
      )}
    </div>
  );
}