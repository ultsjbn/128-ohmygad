"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Plus, ArrowUpDown, SlidersHorizontal, Pencil, Trash2, Loader2 } from "lucide-react";
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

// variant helpers 
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

// checkbox
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

// events page proper
export default function EventsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [events,          setEvents]          = useState<EventFormData[]>([]);
  const [filtered,        setFiltered]        = useState<EventFormData[]>([]);
  const [search,          setSearch]          = useState(searchParams.get("search") || "");
  const [isLoading,       setIsLoading]       = useState(true);
  const [deletingId,      setDeletingId]      = useState<string | null>(null);
  const [modalContent,    setModalContent]    = useState<{ label: string; text: string } | null>(null);
  const [sortOrder,       setSortOrder]       = useState<"Newest" | "Oldest">("Newest");
  
  const [categoryFilters, setCategoryFilters] = useState<Set<string>>(new Set());
  const [statusFilters,   setStatusFilters]   = useState<Set<string>>(new Set());
  const [page,            setPage]            = useState(1);

  //  Fetch 
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

  useEffect(() => { getEvents(); }, []);

  //  filter / sort 
  useEffect(() => {
    const q = search.toLowerCase();
    let result = events;

    result = result.filter((e) =>
      `${e.title} ${e.category || ""} ${e.location || ""}`.toLowerCase().includes(q)
    );
    // empty set = show all. nonempty = only matching values
    if (categoryFilters.size > 0)
      result = result.filter((e) => categoryFilters.has(e.category ?? ""));
    if (statusFilters.size > 0)
      result = result.filter((e) => statusFilters.has(e.status ?? ""));

    result = result.sort((a, b) => {
      const da = new Date(a.start_date ?? "").getTime();
      const db = new Date(b.start_date ?? "").getTime();
      return sortOrder === "Newest" ? db - da : da - db;
    });

    setFiltered(result);
    setPage(1);
  }, [search, events, sortOrder, categoryFilters, statusFilters]);

  //  toggle helpers 
  function toggleCategory(cat: string) {
    setCategoryFilters((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  }

  function toggleStatus(s: string) {
    setStatusFilters((prev) => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });
  }

  function clearAllFilters() {
    setCategoryFilters(new Set());
    setStatusFilters(new Set());
  }

  // delete 
  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    const supabase = createClient();
    const { error } = await supabase.from("event").delete().eq("id", id);
    if (error) alert("Failed to delete event: " + error.message);
    else setEvents((prev) => prev.filter((e) => e.id !== id));
    setDeletingId(null);
  };

  const activeFilterCount = categoryFilters.size + statusFilters.size;
  const hasActiveFilters  = activeFilterCount > 0;

  // DataTable columns 
  const columns: Column<EventFormData>[] = [
    {
      key: "title",
      header: "Title",
      render: (event) => (
        <button
          className="text-left font-semibold hover:underline underline-offset-4 max-w-[200px] truncate block"
          style={{ color: "var(--primary-dark)", fontSize: 13 }}
          onClick={() => setModalContent({ label: event.title, text: event.description })}
          title="Click to view description"
        >
          {event.title}
        </button>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (event) => (
        <Badge variant={CATEGORY_VARIANT[event.category ?? ""] ?? "dark"}>
          {event.category}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (event) => (
        <Badge variant={STATUS_VARIANT[event.status ?? ""] ?? "dark"}>
          <span className="capitalize">{event.status}</span>
        </Badge>
      ),
    },
    {
      key: "start_date",
      header: "Date",
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
      render: (event) => <span className="caption">{event.capacity}</span>,
    },
    {
      key: "location",
      header: "Location",
      render: (event) => (
        <button
          className="caption text-left hover:underline underline-offset-4 max-w-[150px] truncate block"
          onClick={() => setModalContent({ label: "Location", text: event.location || "—" })}
          title="Click to view full location"
        >
          {event.location}
        </button>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (event) => (
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 4 }}>
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
            onClick={() => handleDelete(event.id!, event.title)}
          >
            {deletingId === event.id
              ? <Loader2 size={14} className="animate-spin" />
              : <Trash2 size={14} />}
          </Button>
        </div>
      ),
    },
  ];

  // 
  return (
    <div className="flex flex-col gap-6">

      {/*  page header  */}
      <div className="flex items-start justify-between gap-4 flex-wrap mt-1">
        <div>
          <h1 className="heading-lg">Events Management</h1>
          <p className="caption mt-1">
            {isLoading ? "Loading…" : `${filtered.length} event${filtered.length !== 1 ? "s" : ""} total`}
          </p>
        </div>
        <Button variant="primary" onClick={() => router.push("/admin/events/create")}>
          <Plus size={16} /> Add Event
        </Button>
      </div>

      {/*  toolbar  */}
      <div className="flex flex-col gap-3">

        {/* search, sort, filter */}
        <div className="flex items-center gap-3 flex-wrap">

          <SearchBar
            placeholder="Search by title, category, or location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            containerStyle={{ flex: 1, minWidth: 220 }}
          />

          {/* sort single select */}
          <Dropdown
            trigger={
              <Button variant="ghost">
                <ArrowUpDown size={15} /> {sortOrder}
              </Button>
            }
          >
            {(["Newest", "Oldest"] as const).map((opt) => (
              <DropdownItem key={opt} onClick={() => setSortOrder(opt)}>
                {sortOrder === opt ? <strong>{opt}</strong> : opt}
              </DropdownItem>
            ))}
          </Dropdown>

          {/* filter multi-select */}
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
              <p className="label" style={{ marginBottom: 4 }}>Category</p>
            </div>
            {CATEGORIES.map((cat) => (
              <CheckItem
                key={cat}
                label={cat}
                active={categoryFilters.has(cat)}
                onToggle={() => toggleCategory(cat)}
              />
            ))}

            <DropdownDivider />

            <div style={{ padding: "6px 12px 4px" }}>
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
        </div>

        {/* category */}
        <FilterChips
          chips={["All", ...CATEGORIES]}
          defaultActive={categoryFilters.size === 0 ? "All" : [...categoryFilters][0]}
          onChange={(active) => {
            if (active === "All") setCategoryFilters(new Set());
            else toggleCategory(active);
          }}
        />
      </div>

      {/*  active filter pills  */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap -mt-2">
          <span className="caption">Active filters:</span>

          {[...categoryFilters].map((cat) => (
            <Badge key={cat} variant="pink" dot>
              {cat}
              <button
                onClick={() => toggleCategory(cat)}
                aria-label={`Remove ${cat} filter`}
                style={{ marginLeft: 6 }}
              >×</button>
            </Badge>
          ))}

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

      {/*  table / empty / loading  */}
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

      {/*  pagination  */}
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

      {/*  detail modal  */}
      <Modal
        open={!!modalContent}
        onClose={() => setModalContent(null)}
        title={modalContent?.label}
      >
        <p style={{ fontSize: 14, lineHeight: 1.8, color: "var(--primary-dark)", whiteSpace: "pre-wrap" }}>
          {modalContent?.text || "No description provided."}
        </p>
      </Modal>

    </div>
  );
}