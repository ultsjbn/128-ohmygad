"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Plus, ArrowUpDown, SlidersHorizontal, Pencil, Trash2, Loader2, ChevronUp, ChevronDown, Copy, Check, Users, ClipboardCheck, MapPin, CalendarDays } from "lucide-react";
import EventForm, { type EventFormData } from "@/components/admin/event-form";
import { paginate, totalPages, PER_PAGE } from "@/lib/pagination.utils";
import { Pagination } from "@/components/pagination";

import {
  Button,
  Badge,
  SearchBar,
  Card,
  DataTable,
  type Column,
  Dropdown,
  DropdownItem,
  DropdownDivider,
  Modal,
  Toast,
} from "@/components/ui";

// constants
const CATEGORIES = ["Orientation", "Forum", "Research", "Training", "Workshop"];
const STATUSES = ["upcoming", "past"];
const SORT_FIELDS = ["title", "category", "status", "start_date"] as const;

type SortField = typeof SORT_FIELDS[number];
type BadgeVariant = "pink-light" | "periwinkle" | "dark" | "success" | "warning" | "error";

const CATEGORY_VARIANT: Record<string, BadgeVariant> = {
  Orientation: "pink-light",
  Forum: "periwinkle",
  Research: "error",
  Training: "success",
  Workshop: "warning",
};

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  upcoming: "pink-light",
  past: "periwinkle",
};

type RegisteredUser = {
  registration_id: string;       // event_registration.id — needed to update attended
  display_name: string | null;
  full_name: string | null;
  email: string | null;
  registration_date: string | null;
  attended: boolean;             // from event_registration.attended column
};

function CheckItem({
  label, active, onToggle, capitalize = false,
}: { label: string; active: boolean; onToggle: () => void; capitalize?: boolean; }) {
  return (
    <DropdownItem onClick={onToggle}>
      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* mini checkbox */}
        <span style={{
          width: 14, height: 14, borderRadius: 4, flexShrink: 0,
          border: `1.5px solid ${active ? "var(--primary-dark)" : "rgba(45,42,74,0.20)"}`,
          background: active ? "var(--primary-dark)" : "transparent",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}>
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

// Attendance checkbox
function AttendanceCheckbox({
  registrationId,
  attended,
  onToggle,
}: {
  registrationId: string;
  attended: boolean;
  onToggle: (id: string, newValue: boolean) => void;
}) {
  return (
    <div 
      className="flex items-center justify-center" 
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={() => onToggle(registrationId, !attended)}
        className="flex items-center justify-center transition-all active:scale-95"
        style={{
          width: 18, // Slightly larger than dropdown mini-checkbox for better click target in tables
          height: 18,
          borderRadius: 5,
          flexShrink: 0,
          cursor: "pointer",
          border: `1.5px solid ${attended ? "var(--primary-dark)" : "rgba(45,42,74,0.20)"}`,
          background: attended ? "var(--primary-dark)" : "transparent",
        }}
      >
        {attended && (
          <svg width="10" height="10" viewBox="0 0 8 8" fill="none">
            <path 
              d="M1 4l2 2 4-4" 
              stroke="white" 
              strokeWidth="1.8" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          </svg>
        )}
      </button>
    </div>
  );
}

export default function EventsPage() {
  const searchParams = useSearchParams();

  const [events, setEvents] = useState<EventFormData[]>([]);
  const [filtered, setFiltered] = useState<EventFormData[]>([]);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [prevUrlSearch, setPrevUrlSearch] = useState(searchParams.get("search") || "");

  // Sync search state with URL parameter synchronously to avoid "previous search" flash
  const urlSearch = searchParams.get("search") || "";
  if (urlSearch !== prevUrlSearch) {
    setPrevUrlSearch(urlSearch);
    setSearch(urlSearch);
  }

  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sort, setSort] = useState<{ field: SortField; direction: "asc" | "desc" }>({ field: "start_date", direction: "desc" });
  
  // Updated filter states to use Sets for multi-select
  const [categoryFilters, setCategoryFilters] = useState<Set<string>>(new Set());
  const [statusFilters, setStatusFilters] = useState<Set<string>>(new Set());
  const [activeChip, setActiveChip] = useState("All");
  
  const [page, setPage] = useState(1);
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<EventFormData | null>(null);

  // for the delete confirmation modal
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [deletePassword, setDeletePassword] = useState("");

  const [toast, setToast] = useState<{ variant: "success"|"error"; title: string; message?: string } | null>(null);

  const showToast = (variant: "success"|"error", title: string, message?: string) => {
    setToast({ variant, title, message });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Event detail modal ──
  const [detailEvent, setDetailEvent] = useState<EventFormData | null>(null);
  const [detailTab, setDetailTab] = useState<"registrations" | "attendance">("registrations");
  const [registrations, setRegistrations] = useState<RegisteredUser[]>([]);
  const [loadingRegs, setLoadingRegs] = useState(false);
  const [copied, setCopied] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null); // tracks which row is being saved

  const fetchRegistrations = async (eventId: string) => {
    setLoadingRegs(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("event_registration")
      .select(`
        id,
        registration_date,
        attended,
        profile:user_id (
          display_name,
          full_name,
          email
        )
      `)
      .eq("event_id", eventId);

    if (data) {
      setRegistrations(
        data.map((r: any) => ({
          registration_id:   r.id,
          display_name:      r.profile?.display_name ?? null,
          full_name:         r.profile?.full_name    ?? null,
          email:             r.profile?.email        ?? null,
          registration_date: r.registration_date,
          attended:          r.attended ?? false,
        }))
      );
    }
    setLoadingRegs(false);
  };

  // Toggle attended 
  const handleToggleAttendance = async (registrationId: string, newValue: boolean) => {
    setRegistrations((prev) =>
      prev.map((r) => r.registration_id === registrationId ? { ...r, attended: newValue } : r)
    );
    setTogglingId(registrationId);

    const supabase = createClient();

    try {
      const { data, error } = await supabase
        .from("event_registration")
        .update({ attended: newValue })
        .eq("id", registrationId)
        .select();

    } catch (err: any) {
      console.error("Attendance update failed:", err.message);
      
      // Rollback UI state on failure
      setRegistrations((prev) =>
        prev.map((r) => r.registration_id === registrationId ? { ...r, attended: !newValue } : r)
      );
    } finally {
      setTogglingId(null);
    }
  };

  const openDetail = (event: EventFormData) => {
    setDetailEvent(event);
    setDetailTab("registrations");
    setRegistrations([]);
    setCopied(false);
    fetchRegistrations(event.id!);
  };

  const handleCopyEmails = (targetUsers?: RegisteredUser[]) => {
    // registrations or attended (targeted users)
    const listToCopy = targetUsers || registrations;
    
    const emails = listToCopy
      .map((r) => r.email)
      .filter(Boolean)
      .join(", ");

    if (emails) {
      navigator.clipboard.writeText(emails);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getEvents = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("event")
      .select("id, title, description, category, status, start_date, end_date, capacity, location, registration_open, registration_close, banner_url")
      .order("start_date", { ascending: false });
    
        if (!error && data) {
      setEvents(data);
      setFiltered(data);
    }
    setIsLoading(false);
  };

  useEffect(() => { getEvents(); }, []);

  // filter / sort 
  useEffect(() => {
    const q = search.toLowerCase();
    let result = events;

    result = result.filter((e) =>
      `${e.title} ${e.category || ""} ${e.location || ""}`.toLowerCase().includes(q)
    );

    // category filter
    if (categoryFilters.size > 0) {
      result = result.filter((e) => categoryFilters.has(e.category ?? ""));
    }

    // status filter
    if (statusFilters.size > 0) {
      result = result.filter((e) => statusFilters.has(e.status ?? ""));
    }

    // sorting
    result = result.sort((a, b) => {
      let aVal: any = a[sort.field as keyof EventFormData];
      let bVal: any = b[sort.field as keyof EventFormData];

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return sort.direction === "asc" ? 1 : -1;
      if (bVal == null) return sort.direction === "asc" ? -1 : 1;

      if (sort.field === "start_date") {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      if (typeof aVal === "string" && typeof bVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sort.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sort.direction === "asc" ? 1 : -1;
      return 0;
    });

    setFiltered(result);
    setPage(1);
  }, [search, events, sort, categoryFilters, statusFilters]);

  // toggle helpers 
  function toggleStatus(s: string) {
    setStatusFilters((prev) => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });
  }

  function toggleCategory(c: string) {
    setCategoryFilters((prev) => {
      const next = new Set(prev);
      next.has(c) ? next.delete(c) : next.add(c);
      return next;
    });
    // Reset chip visual if multiple or different selected
    setActiveChip("All");
  }

  function clearAllFilters() {
    setCategoryFilters(new Set());
    setStatusFilters(new Set());
    setActiveChip("All");
  }

  const handleSort = (field: SortField) => {
    setSort((prev) => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
    setPage(1);
  };

  function SortIcon({ field }: { field: SortField }) {
    if (sort.field !== field) return <ArrowUpDown size={12} style={{ opacity: 0.35 }} />;
    return sort.direction === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  }

  // delete execution logic triggered by the modal
  const confirmDelete = async () => {
    if (!deleteTarget) return;

    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user || !userData.user.email) {
      showToast("error", "Unable to verify user");
      return;
    }

    // Verify password by attempting sign in
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: userData.user.email,
      password: deletePassword,
    });

    if (authError) {
      showToast("error", "Invalid password");
      setDeletePassword("");
      return;
    }

    // Password verified, proceed with delete
    setDeletingId(deleteTarget.id);
    
    const { error } = await supabase.from("event").delete().eq("id", deleteTarget.id);
    
    if (error) {
      showToast("error", "Failed to delete event", error.message);
    } else {
      setEvents((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      showToast("success", "Event deleted successfully");
    }
    
    setDeletingId(null);
    setDeleteTarget(null);
    setDeletePassword("");
  };

  const activeFilterCount = categoryFilters.size + statusFilters.size;
  const hasActiveFilters = activeFilterCount > 0;

  // Derived lists for attendance tab
  const attendedUsers  = registrations.filter((r) => r.attended);
  const attendanceCount = attendedUsers.length;

  const columns: Column<EventFormData>[] = [
    {
      key: "title",
      header: "Title",
      width: "22%",
      render: (event) => (
        <button
          className="text-left font-semibold hover:underline underline-offset-4 max-w-[200px] truncate block"
          style={{ color: "var(--primary-dark)", fontSize: 13 }}
          onClick={() => openDetail(event)}
          title="Click to view event details and registrations"
        >
          {event.title}
        </button>
      ),
    },
    {
      key: "category",
      header: "Category",
      width: "14%",
      render: (event) => (
        <Badge variant={CATEGORY_VARIANT[event.category ?? ""] ?? "dark"}>
          {event.category}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "12%",
      render: (event) => (
        <Badge variant={STATUS_VARIANT[event.status ?? ""] ?? "dark"}>
          <span className="capitalize">{event.status}</span>
        </Badge>
      ),
    },
    {
      key: "start_date",
      header: "Date",
      width: "14%",
      render: (event) => (
        <span className="caption whitespace-nowrap">
          {event.start_date
            ? new Date(event.start_date).toLocaleDateString("en-PH", {
              month: "short", day: "numeric", year: "numeric",
            })
            : "—"}
        </span>
      ),
    },
    {
      key: "capacity",
      header: "Capacity",
      width: "10%",
      render: (event) => <span className="caption">{event.capacity}</span>,
    },
    {
      key: "location", header: "Location", width: "17%",
      render: (event) => <span className="caption text-left max-w-[150px] truncate block">{event.location}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      width: "11%",
      render: (event) => (
        <div style={{ display: "flex", justifyContent: "flex-start", gap: 4 }}>
          <Button
            variant="icon"
            title="Edit event"
            onClick={() => setEditTarget(event)}
          >
            <Pencil size={14} />
          </Button>
          <Button
            variant="icon"
            title="Delete event"
            disabled={deletingId === event.id}
            style={deletingId === event.id ? { opacity: 0.5 } : { color: "var(--error)" }}
            onClick={() => setDeleteTarget({ id: event.id!, title: event.title })}
          >
            {deletingId === event.id
              ? <Loader2 size={14} className="animate-spin" />
              : <Trash2 size={14} />}
          </Button>
        </div>
      ),
    },
  ];

  // Shared user row renderer used in both registrations and attendance tabs
  const UserRow = ({ user, i, showCheckbox }: { user: RegisteredUser; i: number; showCheckbox: boolean }) => (
    <div
      key={user.registration_id}
      className={`grid gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--lavender)] transition-colors items-center ${showCheckbox ? "grid-cols-[1fr_1fr_44px]" : "grid-cols-[1fr_1fr]"} ${i % 2 !== 0 ? "bg-[rgba(45,42,74,0.02)]" : ""}`}
    >
      <span className="body truncate font-medium">
        {user.display_name || user.full_name || <span className="text-[var(--gray)]">—</span>}
      </span>
      <span className="caption truncate text-[var(--gray)]">{user.email || "—"}</span>
      {showCheckbox && (
        <AttendanceCheckbox
          registrationId={user.registration_id}
          attended={user.attended}
          onToggle={handleToggleAttendance}
        />
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-3 py-1">

      {/* toolbar */}
      <div className="flex flex-col gap-3">

        {/* search, sort, filter */}
        <div className="flex items-center gap-3 flex-wrap">

          <SearchBar
            placeholder="Search by title, category, or location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            containerStyle={{ flex: 1, minWidth: 220 }}
          />

          {/* sort multi-select */}
          <Dropdown
            trigger={
              <Button variant="ghost">
                <ArrowUpDown size={15} /> Sort
              </Button>
            }
          >
            {SORT_FIELDS.map((field) => (
              <DropdownItem key={field} onClick={() => handleSort(field)}>
                <span className="flex items-center justify-between gap-6 w-full">
                  <span className="capitalize">{field === "start_date" ? "Date" : field}</span>
                  <SortIcon field={field} />
                </span>
              </DropdownItem>
            ))}
            <DropdownDivider />
            <DropdownItem onClick={() => { setSort({ field: "start_date", direction: "desc" }); setPage(1); }}>Reset sort</DropdownItem>
          </Dropdown>

          {/* Filter dropdown */}
          <Dropdown
            trigger={
            <Button type="button" variant={hasActiveFilters ? "pink" : "ghost"}>
              <SlidersHorizontal size={15} /> Filter
              {hasActiveFilters && (
                  <span
                    className="inline-flex items-center justify-center w-2 h-2 rounded-full text-[10px] font-bold text-white"
                    style={{ background: "var(--primary-dark)", marginLeft: 2 }}
                  >
                  {activeFilterCount}
                </span>
              )}
            </Button>
            }
          >
            <div style={{ padding: "4px 12px 6px" }}>
              <p className="label" style={{ marginBottom: 4 }}>Status</p>
            </div>
            {STATUSES.map((s) => (
              <CheckItem
                key={s}
                label={s}
                active={statusFilters.has(s)}
                onToggle={() => toggleStatus(s)}
                capitalize
              />
            ))}

            <DropdownDivider />
            
            <div style={{ padding: "6px 12px 4px" }}>
              <p className="label" style={{ marginBottom: 4 }}>Category</p>
            </div>
            {CATEGORIES.map((c) => (
              <CheckItem
                key={c}
                label={c}
                active={categoryFilters.has(c)}
                onToggle={() => toggleCategory(c)}
              />
            ))}

            <DropdownDivider />
            <DropdownItem onClick={clearAllFilters}>
              Clear all filters
            </DropdownItem>
          </Dropdown>

          <Button variant="primary" onClick={() => setCreateModalOpen(true)}>
            <Plus size={16} /> Add Event
          </Button>
        </div>

      </div>

      {/* active filter pills */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap -mt-2">
          <span className="caption">Active filters:</span>

          {/* Status pills */}
          {[...statusFilters].map((s) => (
            <Badge key={s} variant={STATUS_VARIANT[s] ?? "dark"} dot>
              <span className="capitalize">{s}</span>
              <button onClick={() => toggleStatus(s)} style={{ marginLeft: 6 }}>×</button>
            </Badge>
          ))}

          {/* Category pills */}
          {[...categoryFilters].map((c) => (
            <Badge key={c} variant={CATEGORY_VARIANT[c] ?? "dark"} dot>
              {c}
              <button onClick={() => { toggleCategory(c); setActiveChip("All"); }} style={{ marginLeft: 6 }}>×</button>
            </Badge>
          ))}

          <Button variant="soft" size="sm" onClick={clearAllFilters}>
            Clear all
          </Button>
        </div>
      )}

      {/* table / empty / loading */}
      {isLoading ? (
        <Card>
          <div className="flex items-center justify-center gap-3 py-10" style={{ color: "var(--gray)" }}>
            <Loader2 size={20} className="animate-spin" />
            <span className="caption">Loading events…</span>
          </div>
        </Card>

      ) : filtered.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <p className="caption">
              {search || hasActiveFilters
                ? "No events match your search or filters."
                : "No events yet. Add your first event to get started."}
            </p>
            {(search || hasActiveFilters) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setSearch(""); clearAllFilters(); }}
              >
                Clear search &amp; filters
              </Button>
            )}
          </div>
        </Card>

      ) : (
        <DataTable
          columns={columns}
          rows={paginate(filtered, page, PER_PAGE)}
          keyExtractor={(event) => event.id!}
        />
      )}

      {/* pagination */}
      {!isLoading && filtered.length > 0 && (
        <div className="flex items-center justify-between flex-wrap gap-3">
          <span className="caption">
            Showing {Math.min((page - 1) * PER_PAGE + 1, filtered.length)}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} events
          </span>
          <Pagination
            page={page}
            total={totalPages(filtered.length, PER_PAGE)}
            onChange={setPage}
          />
        </div>
      )}

      {/* create modal */}
      <Modal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add Event"
        modalStyle={{ maxWidth: 900 }}
      >
        <EventForm
          mode="create"
          onSuccess={() => { setCreateModalOpen(false); getEvents(); }}
          onCancel={() => setCreateModalOpen(false)}
        />
      </Modal>

      {/* edit modal */}
      <Modal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Edit Event"
        subtitle={editTarget?.title}
        modalStyle={{ maxWidth: 900 }}
      >
        {editTarget && (
          <EventForm
            key={editTarget.id}
            mode="edit"
            initialData={editTarget}
            onSuccess={() => { setEditTarget(null); getEvents(); }}
            onCancel={() => setEditTarget(null)}
          />
        )}
      </Modal>

      {/* Event detail modal */}
      <Modal
        open={!!detailEvent}
        onClose={() => setDetailEvent(null)}
        title={detailEvent?.title}
        modalStyle={{ maxWidth: 960 }}
        contentStyle={{ display: "flex" }}
      >
        {detailEvent && (
          <div className="flex gap-4 w-full">

            {/* left column: Event info */}
            <div className="flex flex-col gap-4 flex-1">

              <div className="flex flex-wrap gap-2">
                {detailEvent.category && <Badge variant={CATEGORY_VARIANT[detailEvent.category] ?? "dark"}>{detailEvent.category}</Badge>}
                {detailEvent.status && <Badge variant={STATUS_VARIANT[detailEvent.status] ?? "dark"}><span className="capitalize">{detailEvent.status}</span></Badge>}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                {detailEvent.start_date && (
                  <div>
                    <div className="flex items-center gap-1.5">
                      <CalendarDays size={14} className="text-[var(--gray)] shrink-0" />
                      <p className="label !m-0">Start</p>
                    </div>
                    <p className="body ml-0.5">{new Date(detailEvent.start_date).toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })}</p>
                  </div>
                )}
                {detailEvent.end_date && (
                  <div>
                    <div className="flex items-center gap-1.5">
                      <CalendarDays size={14} className="text-[var(--gray)] shrink-0" />
                      <p className="label !m-0">End</p>
                    </div>
                    <p className="body ml-0.5">{new Date(detailEvent.end_date).toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })}</p>
                  </div>
                )}
                {detailEvent.location && (
                  <div>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-[var(--gray)] shrink-0" />
                      <p className="label !m-0">Location</p>
                    </div>
                    <p className="body ml-0.5">{detailEvent.location}</p>
                  </div>
                )}
                {detailEvent.capacity != null && (
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Users size={14} className="text-[var(--gray)] shrink-0" />
                      <p className="label !m-0">Capacity</p>
                    </div>
                    <p className="body ml-0.5">{detailEvent.capacity}</p>
                  </div>
                )}
              </div>

              {detailEvent.description && (
                <div>
                  <p className="label mb-1">Description</p>
                  <p className="body whitespace-pre-wrap text-[var(--gray)]">{detailEvent.description}</p>
                </div>
              )}
            </div>

            {/* right column: Registrations + Attendance */}
            <div className="flex flex-col gap-4 flex-1">

              {/* sub-tab toggle */}
              <div className="flex rounded-xl overflow-hidden border border-[rgba(45,42,74,0.10)] w-fit items-center">
                <button
                  onClick={() => setDetailTab("registrations")}
                  className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${detailTab === "registrations" ? "bg-[var(--primary-dark)] text-white" : "text-[var(--gray)] hover:bg-[var(--lavender)]"}`}
                >
                  <Users size={14} /> Registrations
                </button>
                <button
                  onClick={() => setDetailTab("attendance")}
                  className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${detailTab === "attendance" ? "bg-[var(--primary-dark)] text-white" : "text-[var(--gray)] hover:bg-[var(--lavender)]"}`}
                >
                  <ClipboardCheck size={14} /> Attendance
                </button>
              </div>

              {/* registrations panel */}
              {detailTab === "registrations" && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Users size={15} className="text-[var(--gray)]" />
                      {loadingRegs ? (
                        <span className="caption text-[var(--gray)]">Loading…</span>
                      ) : (
                        <span className="caption">
                          <strong>{registrations.length}</strong> registered user{registrations.length !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    {!loadingRegs && registrations.length > 0 && (
                      <Button variant="soft" size="sm" onClick={() => handleCopyEmails(registrations)} title="Copy all emails to clipboard">
                        {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy emails</>}
                      </Button>
                    )}
                  </div>

                  {loadingRegs ? (
                    <div className="flex items-center justify-center gap-2 py-8 text-[var(--gray)]">
                      <Loader2 size={18} className="animate-spin" />
                      <span className="caption">Loading registrations…</span>
                    </div>
                  ) : registrations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-8 rounded-xl border border-dashed border-[rgba(45,42,74,0.12)]">
                      <Users size={24} className="text-[var(--gray)] opacity-40" />
                      <p className="caption text-[var(--gray)]">No registrations yet.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col max-h-[420px] overflow-y-auto pr-1">
                      <div className="grid grid-cols-[1fr_1fr_44px] gap-3 px-3 sticky top-0 bg-white">
                        <span className="label">Name</span>
                        <span className="label">Email</span>
                        <span className="label text-center">Present</span>
                      </div>
                      <div className="divider my-0" />
                      {registrations.map((user, i) => (
                        <UserRow key={user.registration_id} user={user} i={i} showCheckbox />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Attendance panel */}
              {detailTab === "attendance" && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <ClipboardCheck size={15} className="text-[var(--gray)]" />
                      {loadingRegs ? (
                        <span className="caption text-[var(--gray)]">Loading…</span>
                      ) : (
                        <span className="caption">
                          <strong>{attendanceCount}</strong> attended out of <strong>{registrations.length}</strong> registered
                        </span>
                      )}
                    </div>
                    {!loadingRegs && attendedUsers.length > 0 && (
                      <Button variant="soft" size="sm" onClick={() => handleCopyEmails(attendedUsers)} title="Copy all emails to clipboard">
                        {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy emails</>}
                      </Button>
                    )}
                  </div>

                  {loadingRegs ? (
                    <div className="flex items-center justify-center gap-2 py-8 text-[var(--gray)]">
                      <Loader2 size={18} className="animate-spin" /><span className="caption">Loading…</span>
                    </div>
                  ) : attendedUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-8 rounded-xl border border-dashed border-[rgba(45,42,74,0.12)]">
                      <ClipboardCheck size={24} className="text-[var(--gray)] opacity-40" />
                      <p className="caption">No attendees marked yet.</p>
                      <p className="caption text-center max-w-[250px]">Mark attendance in the Registrations tab using the checkboxes.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1 max-h-[420px] overflow-y-auto pr-1">
                      <div className="grid grid-cols-[1fr_1fr] gap-3 px-3 py-1.5 sticky top-0 bg-white">
                        <span className="label">Name</span>
                        <span className="label">Email</span>
                      </div>
                      <div className="divider my-0" />
                      {attendedUsers.map((user, i) => (
                        <UserRow key={user.registration_id} user={user} i={i} showCheckbox={false} />
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        )}
      </Modal>

      {/* confirm delete modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => { if (!deletingId) { setDeleteTarget(null); setDeletePassword(""); } }}
        title="Delete Event?"
        subtitle="This action cannot be undone. All registrations and data tied to this event will be permanently removed."
        footer={
          <div className="flex gap-3 w-full">
            <Button variant="ghost" className="flex-1" onClick={() => { setDeleteTarget(null); setDeletePassword(""); }} disabled={!!deletingId}>Cancel</Button>
            <Button variant="primary" className="flex-1 !bg-[var(--error)]" onClick={confirmDelete} disabled={!!deletingId || !deletePassword.trim()}>
              {deletingId ? "Deleting..." : "Yes, Delete"}
            </Button>
          </div>
        }
      >
        {deleteTarget && (
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-xl bg-[var(--pink-light)] border border-[rgba(244,123,123,0.2)]">
              <p className="text-sm text-[var(--error)] font-bold mb-1">Warning</p>
              <p className="text-sm text-[var(--primary-dark)]">You are about to delete: <strong className="break-words">{deleteTarget.title}</strong></p>
            </div>
            <div>
              <label className="label block mb-2">Enter your password to confirm deletion</label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="w-full px-3 py-2 border border-[rgba(45,42,74,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                placeholder="Password"
                disabled={!!deletingId}
                autoComplete="off"
              />
            </div>
          </div>
        )}
      </Modal>

      {/* floating toast notification */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999 }}>
          <Toast variant={toast.variant} title={toast.title} message={toast.message} />
        </div>
      )}

    </div>
  );
}