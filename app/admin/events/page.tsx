"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Plus, ArrowUpDown, SlidersHorizontal, Pencil, Trash2, Loader2, ChevronUp, ChevronDown, Copy, Check, Users, AlignLeft } from "lucide-react";
import type { EventFormData } from "@/components/admin/event-form";
import { paginate, totalPages, PER_PAGE } from "@/lib/pagination.utils";
import { Pagination } from "@/components/pagination";

import {
  Button,
  Badge,
  FilterChips,
  SearchBar,
  Card,
  DataTable,
  type Column,
  Dropdown,
  DropdownItem,
  DropdownDivider,
  Modal,
} from "@/components/ui";

// constants 
const CATEGORIES = ["Orientation", "Forum", "Research", "Training", "Workshop"];
const STATUSES = ["upcoming", "past"];
const SORT_FIELDS = ["title", "category", "status", "start_date"] as const;

type SortField = typeof SORT_FIELDS[number];
type BadgeVariant = "pink" | "periwinkle" | "dark" | "success" | "warning" | "error";

const CATEGORY_VARIANT: Record<string, BadgeVariant> = {
  Orientation: "pink",
  Forum: "periwinkle",
  Research: "dark",
  Training: "success",
  Workshop: "warning",
};

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  upcoming: "periwinkle",
  past: "dark",
};

type RegisteredUser = {
  display_name: string | null;
  full_name: string | null;
  email: string | null;
  registration_date: string | null;
  // status: string | null;
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

// events page proper
export default function EventsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [events, setEvents] = useState<EventFormData[]>([]);
  const [filtered, setFiltered] = useState<EventFormData[]>([]);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sort, setSort] = useState<{ field: SortField; direction: "asc" | "desc" }>({ field: "start_date", direction: "desc" });
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [statusFilters, setStatusFilters] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  
  // for the delete confirmation modal
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  // ── Event detail modal ──
  const [detailEvent, setDetailEvent] = useState<EventFormData | null>(null);
  const [detailTab, setDetailTab] = useState<"info" | "registrations">("info");
  const [registrations, setRegistrations] = useState<RegisteredUser[]>([]);
  const [loadingRegs, setLoadingRegs] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchRegistrations = async (eventId: string) => {
    setLoadingRegs(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("event_registration")
      .select(`
        status,
        registration_date,
        profile:user_id (
          display_name,
          full_name,
          email
        )
      `)
      .eq("event_id", eventId);
      // .neq("status", "cancelled");

      if (data) {
      setRegistrations(
        data.map((r: any) => ({
          display_name:      r.profile?.display_name ?? null,
          full_name:         r.profile?.full_name    ?? null,
          email:             r.profile?.email        ?? null,
          registration_date: r.registration_date,
          status:            r.status || "registered",
        }))
      );
    }
    setLoadingRegs(false);
  };

  const openDetail = (event: EventFormData) => {
    setDetailEvent(event);
    setDetailTab("info");
    setRegistrations([]);
    setCopied(false);
  };

  const handleTabChange = (tab: "info" | "registrations") => {
    setDetailTab(tab);
    if (tab === "registrations" && detailEvent && registrations.length === 0) {
      fetchRegistrations(detailEvent.id!);
    }
  };

  const handleCopyEmails = () => {
    const emails = registrations.map((r) => r.email).filter(Boolean).join(", ");
    navigator.clipboard.writeText(emails);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  // sync the url search param to local search 
  useEffect(() => {
    const s = searchParams.get("search");
    if (s !== null) setSearch(s);
  }, [searchParams]);

  // filter / sort 
  useEffect(() => {
    const q = search.toLowerCase();
    let result = events;

    result = result.filter((e) =>
      `${e.title} ${e.category || ""} ${e.location || ""}`.toLowerCase().includes(q)
    );

    // category filter
    if (categoryFilter !== "All") {
      result = result.filter((e) => e.category === categoryFilter);
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
  }, [search, events, sort, categoryFilter, statusFilters]);

  // toggle helpers 
  function toggleStatus(s: string) {
    setStatusFilters((prev) => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });
  }

  function clearAllFilters() {
    setCategoryFilter("All");
    setStatusFilters(new Set());
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
    
    setDeletingId(deleteTarget.id);
    const supabase = createClient();
    
    const { error } = await supabase.from("event").delete().eq("id", deleteTarget.id);
    
    if (error) {
      alert("Failed to delete event: " + error.message);
    } else {
      setEvents((prev) => prev.filter((e) => e.id !== deleteTarget.id));
    }
    
    setDeletingId(null);
    setDeleteTarget(null);
  };

  const activeFilterCount = (categoryFilter !== "All" ? 1 : 0) + statusFilters.size;
  const hasActiveFilters = activeFilterCount > 0;

  // datatable columns 
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
            onClick={() => router.push(`/admin/events/${event.id}/edit`)}
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

  return (
    <div className="flex flex-col gap-6">

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
            <DropdownItem onClick={() => { setSort({ field: "start_date", direction: "desc" }); setPage(1); }}>
              Reset sort
            </DropdownItem>
          </Dropdown>

          {/* filter status only */}
          <Dropdown
            trigger={
            <Button variant={hasActiveFilters ? "pink" : "ghost"}>
              <SlidersHorizontal size={15} /> Filter
              {hasActiveFilters && (
                  <span
                    className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold text-white"
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
            <DropdownItem onClick={clearAllFilters}>
              Clear all filters
            </DropdownItem>
          </Dropdown>

          <Button variant="primary" onClick={() => router.push("/admin/events/create")}>
            <Plus size={16} /> Add Event
          </Button>
        </div>

        {/* category filter chips - single select */}
        <FilterChips
          chips={["All", ...CATEGORIES]}
          defaultActive={categoryFilter}
          onChange={(active) => setCategoryFilter(active)}
        />
      </div>

      {/* active filter pills */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap -mt-2">
          <span className="caption">Active filters:</span>

          {categoryFilter !== "All" && (
            <Badge variant="pink" dot>
              {categoryFilter}
              <button
                onClick={() => setCategoryFilter("All")}
                aria-label={`Remove ${categoryFilter} filter`}
                style={{ marginLeft: 6 }}
              >×</button>
            </Badge>
          )}

          {[...statusFilters].map((s) => (
            <Badge key={s} variant="warning" dot>
              <span className="capitalize">{s}</span>
              <button
                onClick={() => toggleStatus(s)}
                aria-label={`Remove ${s} filter`}
                style={{ marginLeft: 6 }}
              >×</button>
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

      {/* ── Event detail modal ── */}
      <Modal open={!!detailEvent} onClose={() => setDetailEvent(null)} title={detailEvent?.title}>
        {detailEvent && (
          <div className="flex flex-col gap-4">

            {/* tab switcher */}
            <div className="flex rounded-xl overflow-hidden border border-[rgba(45,42,74,0.10)] w-fit">
              <button
                onClick={() => handleTabChange("info")}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${detailTab === "info" ? "bg-[var(--primary-dark)] text-white" : "text-[var(--gray)] hover:bg-[var(--lavender)]"}`}
              >
                <AlignLeft size={14} /> Info
              </button>
              <button
                onClick={() => handleTabChange("registrations")}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${detailTab === "registrations" ? "bg-[var(--primary-dark)] text-white" : "text-[var(--gray)] hover:bg-[var(--lavender)]"}`}
              >
                <Users size={14} /> Registrations
              </button>
            </div>

            {/* Info tab */}
            {detailTab === "info" && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  {detailEvent.category && <Badge variant={CATEGORY_VARIANT[detailEvent.category] ?? "dark"}>{detailEvent.category}</Badge>}
                  {detailEvent.status && <Badge variant={STATUS_VARIANT[detailEvent.status] ?? "dark"}><span className="capitalize">{detailEvent.status}</span></Badge>}
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  {detailEvent.start_date && (
                    <div>
                      <p className="label mb-0.5">Start</p>
                      <p className="body">{new Date(detailEvent.start_date).toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })}</p>
                    </div>
                  )}
                  {detailEvent.end_date && (
                    <div>
                      <p className="label mb-0.5">End</p>
                      <p className="body">{new Date(detailEvent.end_date).toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })}</p>
                    </div>
                  )}
                  {detailEvent.location && (
                    <div>
                      <p className="label mb-0.5">Location</p>
                      <p className="body">{detailEvent.location}</p>
                    </div>
                  )}
                  {detailEvent.capacity != null && (
                    <div>
                      <p className="label mb-0.5">Capacity</p>
                      <p className="body">{detailEvent.capacity}</p>
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
            )}

            {/* Registrations tab */}
            {detailTab === "registrations" && (
              <div className="flex flex-col gap-3">

                {/* count + copy */}
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
                    <Button variant="soft" size="sm" onClick={handleCopyEmails} title="Copy all emails to clipboard">
                      {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy emails</>}
                    </Button>
                  )}
                </div>

                {/* list */}
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
                  <div className="flex flex-col gap-1 max-h-[320px] overflow-y-auto pr-1">
                    <div className="grid grid-cols-[1fr_1fr] gap-3 px-3 py-1.5">
                      <span className="label">Name</span>
                      <span className="label">Email</span>
                    </div>
                    <div className="divider my-0" />
                    {registrations.map((user, i) => (
                      <div
                        key={i}
                        className={`grid grid-cols-[1fr_1fr] gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--lavender)] transition-colors ${i % 2 !== 0 ? "bg-[rgba(45,42,74,0.02)]" : ""}`}
                      >
                        <span className="body truncate font-medium">
                          {user.display_name || user.full_name || <span className="text-[var(--gray)]">—</span>}
                        </span>
                        <span className="caption truncate text-[var(--gray)]">{user.email || "—"}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        )}
      </Modal>

      {/* confirm delete modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => !deletingId && setDeleteTarget(null)}
        title="Delete Event?"
        subtitle="This action cannot be undone. All registrations and data tied to this event will be permanently removed."
        footer={
          <div className="flex gap-3 w-full">
            <Button variant="ghost" className="flex-1" onClick={() => setDeleteTarget(null)} disabled={!!deletingId}>
              Cancel
            </Button>
            <Button variant="primary" className="flex-1 !bg-[var(--error)]" onClick={confirmDelete} disabled={!!deletingId}>
              {deletingId ? "Deleting..." : "Yes, Delete"}
            </Button>
          </div>
        }
      >
        {deleteTarget && (
          <div className="p-4 rounded-xl bg-[var(--pink-light)] border border-[rgba(244,123,123,0.2)]">
            <p className="text-sm text-[var(--error)] font-bold mb-1">Warning</p>
            <p className="text-sm text-[var(--primary-dark)]">You are about to delete: <strong className="break-words">{deleteTarget.title}</strong></p>
          </div>
        )}
      </Modal>

    </div>
  );
}