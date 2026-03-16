"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, Loader2, CalendarDays, MapPin, Users, Clock, X } from "lucide-react";
import type { EventFormData } from "@/components/admin/event-form";

import {
  SearchBar,
  EventCard,
  Badge,
  FilterChips,
  Button,
  Card,
  Modal,
  Dropdown,
  DropdownItem,
  DropdownDivider,
} from "@/components/ui";

// sort types
type SortField = "title" | "category" | "status" | "start_date" | "capacity" | "location";
type SortDirection = "asc" | "desc";

interface SortState {
  field: SortField;
  direction: SortDirection;
}

interface FilterState {
  status: Set<string>;
  category: Set<string>;
}

// sort options
const SORT_OPTIONS: { label: string; field: SortField }[] = [
  { label: "Title",    field: "title"      },
  { label: "Category", field: "category"   },
  { label: "Status",   field: "status"     },
  { label: "Date",     field: "start_date" },
  { label: "Capacity", field: "capacity"   },
  { label: "Location", field: "location"   },
];

// category for gradient map since no images pa
const CATEGORY_GRADIENT: Record<string, string> = {
  Orientation: "linear-gradient(135deg, #F4A7B9 0%, #B8B5E8 100%)",
  Forum:       "linear-gradient(135deg, #F4A7B9 0%, #FAF8FF 100%)",
  Research:    "linear-gradient(135deg, #B8B5E8 0%, #FAF8FF 100%)",
  Training:    "linear-gradient(135deg, #6DC5A0 0%, #FAF8FF 100%)",
  Workshop:    "linear-gradient(135deg, #2D2A4A 0%, #FAF8FF 100%)",
};
const DEFAULT_GRADIENT = "linear-gradient(135deg, #B8B5E8 0%, #2D2A4A 100%)";

// status badge variants
type BadgeVariant = "pink" | "periwinkle" | "dark" | "success" | "warning" | "error";
const STATUS_VARIANT: Record<string, BadgeVariant> = {
  upcoming: "pink",
  past:     "dark",
  ongoing:  "success",
};

// checkbox item used inside filter dropdown (multi-select)
function CheckItem({
  label,
  active,
  onToggle,
  capitalize = false,
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
  capitalize?: boolean;
}) {
  return (
    <DropdownItem onClick={onToggle}>
      <span className="flex items-center gap-2">
        {/* mini checkbox */}
        <span className={`w-[14px] h-[14px] rounded shrink-0 border-[1.5px] inline-flex items-center justify-center ${active ? "border-[var(--primary-dark)] bg-[var(--primary-dark)]" : "border-[rgba(45,42,74,0.20)] bg-transparent"}`}>
          {active && (
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M1 4l2 2 4-4" stroke="white" strokeWidth="1.5"
                    strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
        <span className={capitalize ? "capitalize" : ""}>
          {active ? <strong>{label}</strong> : label}
        </span>
      </span>
    </DropdownItem>
  );
}

// events page
export default function EventsPage() {
  const searchParams = useSearchParams();

  // useStates
  const [events,      setEvents]      = useState<EventFormData[]>([]);
  const [search,      setSearch]      = useState(searchParams.get("search") || "");
  const [isLoading,   setIsLoading]   = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [sort,        setSort]        = useState<SortState>({ field: "start_date", direction: "desc" });
  const [filters,     setFilters]     = useState<FilterState>({ status: new Set(), category: new Set() });
  const [activeChip,  setActiveChip]  = useState("All");
  // event detail modal
  const [detailEvent, setDetailEvent] = useState<EventFormData | null>(null);

  // filter options
  const statuses        = Array.from(new Set(events.map((e) => e.status?.toLowerCase().trim()).filter(Boolean))) as string[];
  const categories      = Array.from(new Set(events.map((e) => e.category).filter(Boolean))) as string[];
  const hasActiveFilters = filters.status.size > 0 || filters.category.size > 0;
  const activeFilterCount = filters.status.size + filters.category.size;

  // useEffect for fetching events
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

  // sorting functions
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
  };

  // toggle filter helpers
  const toggleFilter = (type: "status" | "category", value: string) => {
    setFilters((prev) => {
      const next = new Set(prev[type]);
      next.has(value) ? next.delete(value) : next.add(value);
      return { ...prev, [type]: next };
    });
  };

  const clearFilters = () => {
    setFilters({ status: new Set(), category: new Set() });
    setActiveChip("All");
  };

  // clicking active chip resets to All
  const handleChipChange = (chip: string) => {
    if (chip === "All" || chip === activeChip) {
      setActiveChip("All");
      setFilters((prev) => ({ ...prev, category: new Set() }));
    } else {
      setActiveChip(chip);
      setFilters((prev) => ({ ...prev, category: new Set([chip]) }));
    }
  };

  // apply search filters sort
  const filtered = sortEvents(
    events
      .filter((e) =>
        `${e.title} ${e.category || ""} ${e.location || ""}`.toLowerCase().includes(search.toLowerCase())
      )
      .filter((e) => filters.status.size   === 0 || filters.status.has(e.status?.toLowerCase().trim()   ?? ""))
      .filter((e) => filters.category.size === 0 || filters.category.has(e.category ?? "")),
    sort
  );

  // show active field + direction arrow, just text
  const sortLabel = sort.field !== "start_date"
    ? `${SORT_OPTIONS.find((o) => o.field === sort.field)?.label} ${sort.direction === "asc" ? "↑" : "↓"}`
    : "Sort";

// PAGE PROPER --------------------------------------------------------------------------------------------------------
  return (
    <div className="flex flex-col gap-4">

      {/* page header */}
      <div>
        <h1 className="heading-lg">Events</h1>
      </div>

      {/* search, sort, filter */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 flex-wrap overflow-visible">
            {/* search bar */}
            <SearchBar
                placeholder="Search by title, category, or location…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                containerStyle={{ flex: 1, minWidth: 120 }}
            />

            {/* grouped sort and filter */}
            <div className="flex items-center gap-2 shrink-0">
            {/* sort active field shown as text and arrow in trigger, dot indicator in list */}
            <Dropdown
                trigger={
                <Button variant={sort.field !== "start_date" ? "periwinkle" : "ghost"}>
                    {sortLabel}
                </Button>
                }
            >
                {SORT_OPTIONS.map(({ label, field }) => {
                const isActive = sort.field === field;
                return (
                    <DropdownItem key={field} onClick={() => handleSort(field)}>
                    <span className="flex items-center gap-2">
                        {/* active dot only on the selected item */}
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 border-[1.5px] ${isActive ? "bg-[var(--primary-dark)] border-[var(--primary-dark)]" : "bg-transparent border-[rgba(45,42,74,0.20)]"}`} />
                        <span>{isActive ? <strong>{label} {sort.direction === "asc" ? "↑" : "↓"}</strong> : label}</span>
                    </span>
                    </DropdownItem>
                );
                })}
                <DropdownDivider />
                <DropdownItem onClick={() => setSort({ field: "start_date", direction: "desc" })}>
                Reset sort
                </DropdownItem>
            </Dropdown>

            {/* filter multi-select */}
            <Dropdown
                trigger={
                <Button variant={hasActiveFilters ? "pink" : "ghost"}>
                    <SlidersHorizontal size={15} /> Filter
                    {hasActiveFilters && (
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold text-white bg-[var(--primary-dark)] ml-0.5">
                        {activeFilterCount}
                    </span>
                    )}
                </Button>
                }
            >
                {/* status section */}
                {statuses.length > 0 && (
                <>
                    <div className="px-3 pt-1 pb-1.5">
                    <p className="label mb-1">Status</p>
                    </div>
                    {statuses.map((s) => (
                    <CheckItem
                        key={s}
                        label={s}
                        active={filters.status.has(s)}
                        onToggle={() => toggleFilter("status", s)}
                        capitalize
                    />
                    ))}
                    <DropdownDivider />
                </>
                )}

                {/* category section */}
                {categories.length > 0 && (
                <>
                    <div className="px-3 pt-1.5 pb-1">
                    <p className="label mb-1">Category</p>
                    </div>
                    {categories.map((cat) => (
                    <CheckItem
                        key={cat}
                        label={cat}
                        active={filters.category.has(cat)}
                        onToggle={() => toggleFilter("category", cat)}
                    />
                    ))}
                    <DropdownDivider />
                </>
                )}

                <DropdownItem onClick={clearFilters}>Clear all filters</DropdownItem>
            </Dropdown>
          </div>{/* end sort filter group */}
        </div>

        {/* category single select below search bar */}
        {categories.length > 0 && (
          <FilterChips
            chips={["All", ...categories]}
            defaultActive={activeChip}
            onChange={handleChipChange}
          />
        )}
      </div>

      {/* active filter pills */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap -mt-2">
          <span className="caption">Active filters:</span>

          {[...filters.status].map((s) => (
            <Badge key={s} variant="warning" dot>
              <span className="capitalize">{s}</span>
              <button onClick={() => toggleFilter("status", s)} className="ml-1.5" aria-label={`Remove ${s} filter`}>×</button>
            </Badge>
          ))}
          {[...filters.category].map((cat) => (
            <Badge key={cat} variant="pink" dot>
              {cat}
              <button onClick={() => { toggleFilter("category", cat); setActiveChip("All"); }} className="ml-1.5" aria-label={`Remove ${cat} filter`}>×</button>
            </Badge>
          ))}

          <Button variant="soft" size="sm" onClick={clearFilters}>Clear all</Button>
        </div>
      )}

      {/* content - loading / error / empty / cards */}
      {isLoading ? (
        <Card>
          <div className="flex items-center justify-center gap-3 py-10 text-[var(--gray)]">
            <Loader2 size={20} className="animate-spin" />
            <span className="caption">Loading events…</span>
          </div>
        </Card>

      ) : error ? (
        <Card>
          <div className="flex flex-col items-center justify-center gap-3 py-10">
            <p className="caption text-[var(--error)]">Error: {error}</p>
            <Button variant="ghost" size="sm" onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </Card>

      ) : filtered.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <p className="caption">
              {hasActiveFilters
                ? "No events match your filters."
                : search
                ? "No events match your search."
                : "No events available."}
            </p>
            {(hasActiveFilters || search) && (
              <Button variant="ghost" size="sm" onClick={() => { clearFilters(); setSearch(""); }}>
                Clear search &amp; filters
              </Button>
            )}
          </div>
        </Card>

      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((event) => (
            <div
              key={event.id}
              className="relative cursor-pointer"
              onClick={() => setDetailEvent(event)}
            >
              {/* status badge overlaid top-right of the cover */}
              {event.status && (
                <div className="absolute top-3 right-3 z-[2]">
                  <Badge variant={STATUS_VARIANT[event.status.toLowerCase().trim()] ?? "dark"}>
                    <span className="capitalize">{event.status}</span>
                  </Badge>
                </div>
              )}
              <EventCard
                title={event.title}
                category={event.category ?? "Uncategorized"}
                date={
                  event.start_date
                    ? new Date(event.start_date).toLocaleDateString("en-PH", {
                        month: "short", day: "numeric", year: "numeric",
                      })
                    : "—"
                }
                location={event.location ?? "—"}
                registered={0}
                capacity={event.capacity ?? 0}
                gradient={CATEGORY_GRADIENT[event.category ?? ""] ?? DEFAULT_GRADIENT}
                onRegister={(e?: React.MouseEvent) => {
                  // stop the card click from also opening the detail modal
                  e?.stopPropagation();
                  /* registration handler */
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* result count footer */}
      {!isLoading && !error && filtered.length > 0 && (
        <p className="caption">
          Showing {filtered.length} of {events.length} events
        </p>
      )}

      <Modal
        open={!!detailEvent}
        onClose={() => setDetailEvent(null)}
        hideCloseButton
        modalStyle={{ maxWidth: 600, overflowY: "auto", maxHeight: "90vh", padding: 0 }}
        footer={
          <div className="pb-4 pr-4 pl-4 pt-2">
            <Button variant="primary" className="w-full" onClick={() => {/* registration handler */}}>
              Register
            </Button>
          </div>
        }
      >
        {detailEvent && (
          <div className="flex flex-col">
            {/* cover */}
            <div 
              className="h-[200px] relative shrink-0 rounded-t-[var(--radius-xl)]"
              style={{ background: CATEGORY_GRADIENT[detailEvent.category ?? ""] ?? DEFAULT_GRADIENT }}
            >
              <button
                onClick={() => setDetailEvent(null)}
                aria-label="Close"
                className="absolute top-3.5 right-3.5 w-6 h-6 rounded-full bg-[rgba(255,255,255,0.88)] border-none cursor-pointer flex items-center justify-center text-[var(--primary-dark)] backdrop-blur-[4px] z-10"
              >
                <X size={16} />
              </button>

              {/* category and status badges - bottom-left of cover */}
              <div className="absolute bottom-2 left-3 flex gap-2 items-center">
                <span className="badge badge-pink">
                  {detailEvent.category ?? "Uncategorized"}
                </span>
                {detailEvent.status && (
                  <Badge variant={STATUS_VARIANT[detailEvent.status.toLowerCase().trim()] ?? "dark"}>
                    <span className="capitalize">{detailEvent.status}</span>
                  </Badge>
                )}
              </div>
            </div>

            {/* body padded section below the cover */}
            <div className="flex flex-col gap-1 p-4">

              {/* title */}
              <h2 className="heading-lg m-0">{detailEvent.title}</h2>

              {/* details row */}
              <div className="flex flex-col gap-1">
                {/* ---------- date ---------- */}
                <div className="flex items-center gap-4 body">
                  <CalendarDays size={15} />
                  <span>
                    {detailEvent.start_date
                      ? new Date(detailEvent.start_date).toLocaleDateString("en-PH", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
                      : "—"}
                    {detailEvent.end_date && detailEvent.end_date !== detailEvent.start_date && (
                      <> — {new Date(detailEvent.end_date).toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })}</>
                    )}
                  </span>
                </div>
                {/* ---------- location ---------- */}
                <div className="flex items-center gap-4 body">
                  <MapPin size={15} />
                  <span>{detailEvent.location ?? "—"}</span>
                </div>
                {/* ---------- capacity ---------- */}
                <div className="flex items-center gap-4 body">
                  <Users size={15} />
                  <span>Capacity: {detailEvent.capacity ?? "—"}</span>
                </div>
                {/* ---------- registration ---------- */}
                {(detailEvent.registration_open || detailEvent.registration_close) && (
                  <div className="flex items-center gap-4 body">
                    <Clock size={15} />
                    <span>
                      Registration:&nbsp;
                      {detailEvent.registration_open
                        ? new Date(detailEvent.registration_open).toLocaleDateString("en-PH", { month: "short", day: "numeric" })
                        : "?"}
                      &nbsp;–&nbsp;
                      {detailEvent.registration_close
                        ? new Date(detailEvent.registration_close).toLocaleDateString("en-PH", { month: "short", day: "numeric" })
                        : "?"}
                    </span>
                  </div>
                )}
              </div>

              {/* divider */}
              <div className="divider" />

              {/* full description */}
              <div>
                <p className="label mb-2">About this event</p>
                <p className="body whitespace-pre-wrap">
                  {detailEvent.description || "No description provided."}
                </p>
              </div>

            </div>{/* end body */}
          </div>
        )}
      </Modal>

    </div>
  );
}