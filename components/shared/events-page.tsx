"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { SlidersHorizontal, Loader2, CalendarDays, MapPin, Users, Clock, X, ArrowUpDown, ClipboardList } from "lucide-react";
import type { EventFormData } from "@/components/admin/event-form";
import ScrollToTop from "@/components/ui/scroll-to-top";
import { Toast, ProgressBar } from "@/components/ui";

import {
  SearchBar,
  EventCard,
  Badge,
  Button,
  Card,
  Modal,
  Dropdown,
  DropdownItem,
  DropdownDivider,
} from "@/components/ui";
import { useSearchParams } from "next/navigation";

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
  { label: "Title", field: "title" },
  { label: "Category", field: "category" },
  { label: "Status", field: "status" },
  { label: "Date", field: "start_date" },
  { label: "Capacity", field: "capacity" },
  { label: "Location", field: "location" },
];

// category for gradient map since no images pa
const CATEGORY_GRADIENT: Record<string, string> = {
  Orientation: "linear-gradient(135deg, #F4C97A 0%, #FAF8FF 100%)",
  Forum: "linear-gradient(135deg, #F4A7B9 0%, #FAF8FF 100%)",
  Research: "linear-gradient(135deg, #B8B5E8 0%, #FAF8FF 100%)",
  Training: "linear-gradient(135deg, #6DC5A0 0%, #FAF8FF 100%)",
  Workshop: "linear-gradient(135deg, #2D2A4A 0%, #FAF8FF 100%)",
};
const DEFAULT_GRADIENT = "linear-gradient(135deg, #B8B5E8 0%, #2D2A4A 100%)";

// status badge variants
type BadgeVariant = "pink-light" | "periwinkle" | "dark" | "success" | "warning" | "error";
const STATUS_VARIANT: Record<string, BadgeVariant> = {
  upcoming: "pink-light",
  past: "periwinkle",
  today: "success", 
};

const CATEGORY_VARIANT: Record<string, BadgeVariant> = {
  Orientation: "pink-light",
  Forum: "periwinkle",
  Research: "error",
  Training: "success",
  Workshop: "warning",
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
              <path d="M1 4l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
        <span className={capitalize ? "capitalize" : ""}>{active ? <strong>{label}</strong> : label}</span>
      </span>
    </DropdownItem>
  );
}

// events page
export default function EventsPage() {
  const searchParams = useSearchParams();

  // useStates
  const [events, setEvents] = useState<EventFormData[]>([]);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [prevUrlSearch, setPrevUrlSearch] = useState(searchParams.get("search") || "");

  // Sync search state with URL parameter synchronously to avoid "previous search" flash
  const urlSearch = searchParams.get("search") || "";
  if (urlSearch !== prevUrlSearch) {
    setPrevUrlSearch(urlSearch);
    setSearch(urlSearch);
  }

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<SortState>({ field: "start_date", direction: "desc" });
  const [filters, setFilters] = useState<FilterState>({ status: new Set(), category: new Set() });
  const [activeChip, setActiveChip] = useState("All");

  // event detail modal
  const [detailEvent, setDetailEvent] = useState<EventFormData | null>(null);

  // user registration
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());
  const [registeringId, setRegisteringId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [regCounts, setRegCounts] = useState<Record<string, number>>({});

  const [toast, setToast] = useState<{
    variant: "success" | "error" | "warning" | "info";
    title: string;
    message?: string;
  } | null>(null);

  const showToast = (t: typeof toast) => {
    setToast(t);
    setTimeout(() => setToast(null), 3500);
  };

  // filter options
  const statuses = Array.from(new Set(events.map((e) => e.status?.toLowerCase().trim()).filter(Boolean))) as string[];
  const categories = Array.from(new Set(events.map((e) => e.category).filter(Boolean))) as string[];
  const hasActiveFilters = filters.status.size > 0 || filters.category.size > 0;
  const activeFilterCount = filters.status.size + filters.category.size;

  // useEffect for fetching events
  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      // 1 - get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);

        // 2 - fetch existing registrations
        const { data: regs } = await supabase
          .from("event_registration")
          .select("event_id")
          .eq("user_id", user.id);

        if (regs) setRegisteredIds(new Set(regs.map((r) => r.event_id)));
      }

      // 3 - fetch events
      const { data, error } = await supabase
        .from("event")
        .select("id, title, description, category, status, start_date, end_date, capacity, location, registration_open, registration_close, banner_url")
        .order("start_date", { ascending: false });

      const { data: counts } = await supabase
        .from("event_registration")
        .select("event_id")
        .neq("status", "cancelled");

      if (counts) {
        const map: Record<string, number> = {};
        counts.forEach((r) => { map[r.event_id] = (map[r.event_id] ?? 0) + 1; });
        setRegCounts(map);
      }

      if (error) setError(error.message);
      else if (data) setEvents(data);
      setIsLoading(false);
    }
    fetchData();
  }, []);

  // handle registrations
  const handleRegister = async (eventId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();

    if (registeredIds.has(eventId)) return;

    if (!currentUserId) {
      showToast({ variant: "error", title: "Not logged in", message: "Please log in to register for events." });
      return;
    }

    // registration window check
    const event = events.find((ev) => ev.id === eventId);
    const now = new Date();
    if (event?.registration_open && new Date(event.registration_open) > now) {
      showToast({ variant: "warning", title: "Registration not yet open", message: "Registration hasn't started for this event." });
      return;
    }
    if (event?.registration_close && new Date(event.registration_close) < now) {
      showToast({ variant: "error", title: "Registration closed", message: "The deadline has already passed." });
      return;
    }

    setRegisteringId(eventId);
    const supabase = createClient();

    const { error } = await supabase
      .from("event_registration")
      .insert({
        event_id: eventId,
        user_id: currentUserId,
        status: "registered",
        registration_date: new Date().toISOString(),
      });

    if (error) {
      showToast({
        variant: "error",
        title: "Registration failed",
        message: error.message
      });
    } else {
      setRegisteredIds((prev) => new Set([...prev, eventId]));
      setRegCounts((prev) => ({ ...prev, [eventId]: (prev[eventId] ?? 0) + 1 }));
      showToast({
        variant: "success",
        title: "Registered!",
        message: `You've registered for ${event?.title}.`
      });
    }

    setRegisteringId(null);
  };

  // handle canceling registrations
  const handleCancelRegistration = async (eventId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();

    if (!currentUserId) return;

    setRegisteringId(eventId);
    const supabase = createClient();

    const { error } = await supabase
      .from("event_registration")
      .delete()
      .eq("event_id", eventId)
      .eq("user_id", currentUserId);

    if (error) {
      showToast({ variant: "error", title: "Cancellation failed", message: error.message });
    } else {
      setRegisteredIds((prev) => {
        const next = new Set(prev);
        next.delete(eventId);
        return next;
      });
      setRegCounts((prev) => ({ ...prev, [eventId]: Math.max((prev[eventId] ?? 1) - 1, 0) }));
      showToast({ variant: "info", title: "Registration cancelled", message: "You've cancelled your registration." });
    }

    setRegisteringId(null);
  };

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

  const handleSort = (field: SortField) =>
    setSort((prev) => ({ field, direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc" }));

  // toggle filter helpers
  const toggleFilter = (type: "status" | "category", value: string) => {
    setFilters((prev) => {
      const next = new Set(prev[type]);
      next.has(value) ? next.delete(value) : next.add(value);
      return { ...prev, [type]: next };
    });
  };

  // clear filters
  const clearFilters = () => { setFilters({ status: new Set(), category: new Set() }); setActiveChip("All"); };

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
      .filter((e) => `${e.title} ${e.category || ""} ${e.location || ""}`.toLowerCase().includes(search.toLowerCase()))
      .filter((e) => filters.status.size === 0 || filters.status.has(e.status?.toLowerCase().trim() ?? ""))
      .filter((e) => filters.category.size === 0 || filters.category.has(e.category ?? "")),
    sort
  );

  const sortLabel = `${SORT_OPTIONS.find((o) => o.field === sort.field)?.label} ${sort.direction === "asc" ? "↑" : "↓"}`;

  const isDetailRegistered = detailEvent ? registeredIds.has(detailEvent.id!) : false;
  const isDetailRegistering = detailEvent ? registeringId === detailEvent.id : false;

  // PAGE PROPER ----------------------------------------------------------------
  return (
    <div className="flex flex-col gap-4">
      {/* search, sort, filter */}
      <div className="flex flex-col gap-3 mt-2">
        <div className="flex items-center gap-3 flex-wrap overflow-visible">
          {/* search bar */}
          <SearchBar
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            containerStyle={{ flex: 1, minWidth: 120 }}
          />

          {/* grouped sort and filter */}
          <div className="flex items-center gap-2 shrink-0">
            {/* sort is icon only on mobile, text+arrow on md+ devices */}
            <Dropdown trigger={
              <Button variant="ghost">
                <ArrowUpDown size={15} />
                {/* label hidden on mobile */}
                <span className="hidden md:inline"> {sortLabel}</span>
              </Button>
            }>
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
              <DropdownItem onClick={() => setSort({ field: "start_date", direction: "desc" })}>Reset sort</DropdownItem>
            </Dropdown>

            {/* filter is icon only on mobile, text on md+ devices */}
            <Dropdown trigger={
              <Button variant={hasActiveFilters ? "pink" : "ghost"}>
                <SlidersHorizontal size={15} />
                <span className="hidden md:inline">Filter</span>
                {hasActiveFilters && (
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold text-white bg-[var(--primary-dark)] ml-0.5">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            }>
              {/* status section */}
              {statuses.length > 0 && (
                <>
                  <div className="px-3 pt-1 pb-1.5"><p className="label mb-1">Status</p></div>
                  {statuses.map((s) => <CheckItem key={s} label={s} active={filters.status.has(s)} onToggle={() => toggleFilter("status", s)} capitalize />)}
                  <DropdownDivider />
                </>
              )}
              {/* category section */}
              {categories.length > 0 && (
                <>
                  <div className="px-3 pt-1.5 pb-1"><p className="label mb-1">Category</p></div>
                  {categories.map((cat) => <CheckItem key={cat} label={cat} active={filters.category.has(cat)} onToggle={() => toggleFilter("category", cat)} />)}
                  <DropdownDivider />
                </>
              )}
              <DropdownItem onClick={clearFilters}>Clear all filters</DropdownItem>
            </Dropdown>
          </div>{/* end sort filter group */}
        </div>

      </div>

      {/* active filter pills */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap -mt-2">
          <span className="caption">Active filters:</span>
          {[...filters.status].map((s) => (
            <Badge key={s} variant={STATUS_VARIANT[s] ?? "dark"} dot>
              <span className="capitalize">{s}</span>
              <button onClick={() => toggleFilter("status", s)} className="ml-1.5" aria-label={`Remove ${s} filter`}>×</button>
            </Badge>
          ))}
          {[...filters.category].map((cat) => (
            <Badge key={cat} variant={CATEGORY_VARIANT[cat] ?? "dark"}dot>
              {cat}
              <button onClick={() => { toggleFilter("category", cat); setActiveChip("All"); }} className="ml-1.5" aria-label={`Remove ${cat} filter`}>×</button>
            </Badge>
          ))}
          <Button variant="soft" size="sm" onClick={clearFilters}>Clear all</Button>
        </div>
      )}

      {/* content - loading / error / empty / cards */}
      {/* loading */}
      {isLoading ? (
        <Card>
          <div className="flex items-center justify-center gap-3 py-10 text-[var(--gray)]">
            <Loader2 size={20} className="animate-spin" />
            <span className="caption">Loading events…</span>
          </div>
        </Card>

        // error
      ) : error ? (
        <Card>
          <div className="flex flex-col items-center justify-center gap-3 py-10">
            <p className="caption text-[var(--error)]">Error: {error}</p>
            <Button variant="ghost" size="sm" onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </Card>

        /* not error, no results */
      ) : filtered.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <p className="caption">
              {hasActiveFilters ? "No events match your filters." : search ? "No events match your search." : "No events available."}
            </p>
            {(hasActiveFilters || search) && (
              <Button variant="ghost" size="sm" onClick={() => { clearFilters(); setSearch(""); }}>
                Clear search &amp; filters
              </Button>
            )}
          </div>
        </Card>

        /* not error, yes results */
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((event) => {
            const isRegistered = registeredIds.has(event.id!);
            const isRegistering = registeringId === event.id;
            return (
              <div
                key={event.id}
                className="relative cursor-pointer"
                onClick={() => { setDetailEvent(event); setRegisterError(null); }}
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
                  date={event.start_date ? new Date(event.start_date).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                  time={event.start_date ? new Date(event.start_date).toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" }) : "—"}
                  location={event.location ?? "—"}
                  registered={regCounts[event.id!] ?? 0}
                  capacity={event.capacity ?? 0}
                  gradient={event.banner_url ? `url(${event.banner_url}) center/cover no-repeat` : CATEGORY_GRADIENT[event.category ?? ""] ?? DEFAULT_GRADIENT}
                  registerLabel={isRegistering ? "Processing…" : isRegistered ? "Cancel Registration" : "Register"}
                  registerDisabled={isRegistering}
                  isRegistered={isRegistered}
                  onRegister={(e?: React.MouseEvent) =>
                    isRegistered ? handleCancelRegistration(event.id!, e) : handleRegister(event.id!, e)
                  }
                />
              </div>
            );
          })}
        </div>
      )}

      {/* result count footer */}
      {!isLoading && !error && filtered.length > 0 && (
        <p className="caption">Showing {filtered.length} of {events.length} events</p>
      )}

      {/* when opened the event */}
      <Modal
        open={!!detailEvent}
        onClose={() => { setDetailEvent(null); setRegisterError(null); }}
        hideCloseButton
        modalStyle={{ maxWidth: 600, padding: 0 }}
        footer={
          detailEvent && (
            <div className="px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:px-5 sm:pb-5 shrink-0">
              <Button
                variant={isDetailRegistered ? "ghost" : "primary"}
                className="w-full"
                disabled={isDetailRegistering}
                onClick={(e) => isDetailRegistered
                  ? handleCancelRegistration(detailEvent.id!, e)
                  : handleRegister(detailEvent.id!, e)
                }
              >
                {isDetailRegistering
                  ? "Processing…"
                  : isDetailRegistered
                    ? "Cancel Registration"
                    : "Register"}
              </Button>
            </div>
          )
        }
      >
        {detailEvent && (
          <div className="flex flex-col min-h-0">
            <div
              className="h-[200px] sm:h-[180px] relative shrink-0 rounded-t-[var(--radius-xl)]"
              style={{ background: detailEvent.banner_url ? `url(${detailEvent.banner_url}) center/cover no-repeat` : CATEGORY_GRADIENT[detailEvent.category ?? ""] ?? DEFAULT_GRADIENT }}
            >
              {/* close button inside cover */}
              <button
                onClick={() => { setDetailEvent(null); setRegisterError(null); }}
                aria-label="Close"
                className="absolute top-3 right-3 w-4 h-4 sm:w-6 sm:h-6 rounded-full border-none cursor-pointer flex items-center justify-center text-[var(--primary-dark)] z-10 backdrop-blur-sm bg-white/80"
              >
                <X size={14} />
              </button>

              
            </div>

            {/* only body scrolls, cover + footer stay fixed */}
            <div className="flex flex-col gap-2 p-3 sm:p-5 overflow-y-auto">
              {/* title */}
              <h2 className="heading-md m-0">{detailEvent.title}</h2>
              {/* category and status badges moved below */}
                <div className="flex gap-2 items-center">
                    <Badge variant={CATEGORY_VARIANT[detailEvent.category ?? ""] ?? "dark"}>
                    {detailEvent.category ?? "Uncategorized"}
                    </Badge>
                    {detailEvent.status && (
                    <Badge variant={STATUS_VARIANT[detailEvent.status.toLowerCase().trim()] ?? "dark"}>
                        <span className="capitalize">{detailEvent.status}</span>
                    </Badge>
                    )}
                </div>

              {/* details row */}
              <div className="flex flex-col gap-1.5">
                {/* ---------- date ---------- */}
                <div className="flex items-start gap-3 caption sm:text-sm text-[var(--gray)]">
                  <CalendarDays size={15} className="shrink-0 mt-0.5" />
                  <span>
                    {detailEvent.start_date ? new Date(detailEvent.start_date).toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" }) : "—"}
                    {detailEvent.end_date && detailEvent.end_date !== detailEvent.start_date && (
                      <> — {new Date(detailEvent.end_date).toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })}</>
                    )}
                  </span>
                </div>
                {/* ---------- time ---------- */}
                <div className="flex items-start gap-3 caption sm:text-sm text-[var(--gray)]">
                  <Clock size={15} className="shrink-0 mt-0.5" />
                  <span>
                    {detailEvent.start_date ? new Date(detailEvent.start_date).toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" }) : "—"}
                    {detailEvent.end_date && detailEvent.end_date !== detailEvent.start_date && (
                      <> — {new Date(detailEvent.end_date).toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" })}</>
                    )}
                  </span>
                </div>
                {/* ---------- location ---------- */}
                <div className="flex items-center gap-3 caption sm:text-sm text-[var(--gray)]">
                  <MapPin size={15} className="shrink-0" />
                  <span>{detailEvent.location ?? "—"}</span>
                </div>
                {/* ---------- capacity ---------- */}
                <div className="flex items-center gap-3 caption sm:text-sm text-[var(--gray)]">
                  <Users size={15} className="shrink-0" />
                  <span>Capacity: {detailEvent.capacity ?? "—"}</span>
                </div>
                {/* ---------- registration ---------- */}
                {(detailEvent.registration_open || detailEvent.registration_close) && (
                  <div className="flex items-center gap-3 caption sm:text-sm text-[var(--gray)]">
                    <ClipboardList size={15} className="shrink-0" />
                    <span>
                      Registration:&nbsp;
                      {detailEvent.registration_open ? new Date(detailEvent.registration_open).toLocaleDateString("en-PH", { month: "long", day: "numeric" }) : "?"}
                      &nbsp;—&nbsp;
                      {detailEvent.registration_close ? new Date(detailEvent.registration_close).toLocaleDateString("en-PH", { month: "long", day: "numeric" }) : "?"}
                    </span>
                  </div>
                )}
              </div>

              {/* capacity progress bar */}
              {detailEvent.capacity != null && (
                <ProgressBar
                  value={Math.round(((regCounts[detailEvent.id!] ?? 0) / detailEvent.capacity) * 100)}
                  label="Registered"
                  sublabel={`${regCounts[detailEvent.id!] ?? 0} / ${detailEvent.capacity}`}
                />
              )}

              {/* divider */}
              <div className="divider" />

              {/* full description */}
              <div className="flex flex-col gap-2 pb-2">
                <p className="label">ABOUT THIS EVENT</p>
                <p className="body whitespace-pre-wrap">{detailEvent.description || "No description provided."}</p>
              </div>
            </div>{/* end body */}
          </div>
        )}
      </Modal>

      {toast && (
        <div className="fixed bottom-6 right-4 z-[999] sm:right-6">
          <Toast variant={toast.variant} title={toast.title} message={toast.message} />
        </div>
      )}

      {/* hide scroll to top if event details are open */}
      <ScrollToTop hidden={!!detailEvent} />
    </div>
  );
}