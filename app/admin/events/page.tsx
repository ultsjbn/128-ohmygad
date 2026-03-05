"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader, Paper } from "@snowball-tech/fractal";
import { InputText } from "@snowball-tech/fractal";
import { Plus, Pencil, Trash2, Search, ArrowUpDown, SlidersHorizontal, X, ChevronUp, ChevronDown } from "lucide-react";
import type { EventFormData } from "@/components/admin/event-form";
import { Button } from "@/components/button";
import { Typography } from "@/components/typography";
import { Pagination } from "@/components/pagination";
import { paginate, totalPages, PER_PAGE } from "./event.utils";

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

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventFormData[]>([]);
  const [filtered, setFiltered] = useState<EventFormData[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [modalContent, setModalContent] = useState<{ label: string; text: string } | null>(null);
  const [sort, setSort] = useState<SortState>({ field: "start_date", direction: "desc" });
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    category: [],
  });


  // next fix: case sensitivity of database inputs, pero ganto muna
  const statuses = Array.from(
    new Set(
      events
        .map((e) => e.status?.toLowerCase().trim())
        .filter(Boolean)
    )
  );
  const categories = Array.from(new Set(events.map((e) => e.category).filter(Boolean)));

  const hasActiveFilters =
    filters.status.length > 0 ||
    filters.category.length > 0;
  const [page, setPage] = useState(1);

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

  // Search, filters, and sorting
  useEffect(() => {
    const q = search.toLowerCase();
    let result = events;

    // Text search
    result = result.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.category?.toLowerCase().includes(q) ||
        e.location?.toLowerCase().includes(q)
    );

    // Status filter
    if (filters.status.length > 0) {
      result = result.filter((e) => filters.status.includes(e.status));
    }

    // Category filter
    if (filters.category.length > 0) {
      result = result.filter((e) => filters.category.includes(e.category));
    }

    // Sorting
    result = sortEvents(result, sort);
    setFiltered(result);
  }, [search, events, sort, filters]);

  const sortEvents = (eventsToSort: EventFormData[], sortState: SortState): EventFormData[] => {
    const { field, direction } = sortState;
    const sorted = [...eventsToSort];

    sorted.sort((a, b) => {
      let aVal: any = a[field as keyof EventFormData];
      let bVal: any = b[field as keyof EventFormData];

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return direction === "asc" ? 1 : -1;
      if (bVal == null) return direction === "asc" ? -1 : 1;

      if (field === "start_date") {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      // Handle string comparisons (case-insensitive)
      if (typeof aVal === "string" && typeof bVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

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

  const clearFilters = () => {
    setFilters({
      status: [],
      category: [],
    });
    setSearch("");
  };

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

  const getSortIndicator = (field: SortField) => {
    if (sort.field !== field) return null;
    return sort.direction === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  const sortOptions: { label: string; field: SortField }[] = [
    { label: "Title", field: "title" },
    { label: "Category", field: "category" },
    { label: "Status", field: "status" },
    { label: "Date", field: "start_date" },
    { label: "Capacity", field: "capacity" },
    { label: "Location", field: "location" },
  ];


  return (
    <div className="mx-auto h-full flex flex-col gap-6">

      <div className="flex flex-col gap-1">
        <Typography variant="heading-2">Events Management</Typography>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <InputText
          placeholder="Search by title, category, or location..."
          fullWidth
          prefix={<Search size={18} />}
          onChange={(e) => setSearch(e.target.value)}
          value={search}
        />

        <div className="flex items-center gap-2 shrink-0 relative">
          {/* Sort Button with Dropdown Menu */}
          <div className="relative">
            <Button
              label={`Sort${sort.field !== "start_date" ? ": " + sortOptions.find(o => o.field === sort.field)?.label : ""}`}
              variant="display"
              icon={<ArrowUpDown size={18} />}
              iconPosition="left"
              onClick={() => { setShowSortMenu(!showSortMenu); setShowFilterMenu(false); }}
              className="whitespace-nowrap"
            />

            {showSortMenu && (
              <div className="absolute top-full right-0 mt-2 bg-white border-2 border-fractal-border-default rounded-s shadow-brutal-1 z-40 min-w-[180px]">
                {sortOptions.map((option) => (
                  <button
                    key={option.field}
                    onClick={() => handleSort(option.field)}
                    className={`w-full text-left px-4 py-2 text-sm font-median hover:bg-fractal-base-grey-90 transition-colors flex items-center justify-between ${sort.field === option.field ? "bg-fractal-base-grey-90" : ""
                      }`}
                  >
                    <span>{option.label}</span>
                    {sort.field === option.field && (
                      <span className="ml-2">
                        {sort.direction === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filter */}
          <div className="relative">
            <Button
              label="Filter"
              variant={hasActiveFilters ? "primary-dark" : "display"}
              icon={<SlidersHorizontal size={18} />}
              iconPosition="left"
              onClick={() => { setShowFilterMenu(!showFilterMenu); setShowSortMenu(false); }}
              className="whitespace-nowrap"
            />

            {showFilterMenu && (
              <div className="absolute top-full right-0 mt-2 bg-white border-2 border-fractal-border-default rounded-s shadow-brutal-1 z-40 min-w-[240px] max-h-96 overflow-y-auto">

                {/* Status Filter */}
                {statuses.length > 0 && (
                  <div className="border-b border-fractal-border-default p-3">
                    <Typography variant="body-2-median" className="mb-2 block">
                      Status
                    </Typography>
                    {statuses.map((status) => (
                      <label
                        key={status}
                        className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-fractal-base-grey-90 rounded transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={filters.status.includes(status)}
                          onChange={() => toggleFilter("status", status)}
                          className="w-4 h-4 appearance-none border-2 border-fractal rounded-full bg-white checked:bg-fractal-brand-primary" // to do: update to fractal checkbox 
                        />
                        <Typography variant="body-2" className="capitalize">
                          {status}
                        </Typography>
                      </label>
                    ))}
                  </div>
                )}

                {/* Category */}
                {categories.length > 0 && (
                  <div className="border-b border-fractal-border-default p-3">
                    <Typography variant="body-2-median" className="mb-2 block">
                      Category
                    </Typography>
                    {categories.map((category) => (
                      <label
                        key={category}
                        className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-fractal-base-grey-90 rounded transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={filters.category.includes(category)}
                          onChange={() => toggleFilter("category", category)}
                          className="w-4 h-4 appearance-none border-2 border-fractal rounded-full bg-white checked:bg-fractal-brand-primary" // to do: update to fractal checkbox 
                        />
                        <Typography variant="body-2">{category}</Typography>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <Button
            label="Add Event"
            variant="primary-dark"
            icon={<Plus size={18} />}
            iconPosition="left"
            onClick={() => router.push("/admin/events/create")}
          />
        </div>

      </div>



      <Paper elevation="elevated" className="overflow-hidden p-0">
        {isLoading ? (
          <div className="p-8 text-center">
            <Loader size="xl" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <Typography
              variant="body-1"
              className="text-fractal-text-placeholder"
            >
              {hasActiveFilters
                ? "No events match your filters."
                : search
                  ? "No events match your search."
                  : "No events yet. Create one to get started."}
            </Typography>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b-2 border-fractal-border-default bg-fractal-base-grey-90 sticky top-0">
              <tr>
                <th
                  className="text-left p-3 font-median cursor-pointer hover:bg-fractal-base-grey-80 transition-colors"
                  onClick={() => handleSort("title")}
                  title="Click to sort"
                >
                  <div className="flex items-center gap-1">
                    Title
                    {getSortIndicator("title")}
                  </div>
                </th>
                <th
                  className="text-left p-3 font-median cursor-pointer hover:bg-fractal-base-grey-80 transition-colors"
                  onClick={() => handleSort("category")}
                  title="Click to sort"
                >
                  <div className="flex items-center gap-1">
                    Category
                    {getSortIndicator("category")}
                  </div>
                </th>
                <th
                  className="text-left p-3 font-median cursor-pointer hover:bg-fractal-base-grey-80 transition-colors"
                  onClick={() => handleSort("status")}
                  title="Click to sort"
                >
                  <div className="flex items-center gap-1">
                    Status
                    {getSortIndicator("status")}
                  </div>
                </th>
                <th
                  className="text-left p-3 font-median cursor-pointer hover:bg-fractal-base-grey-80 transition-colors"
                  onClick={() => handleSort("start_date")}
                  title="Click to sort"
                >
                  <div className="flex items-center gap-1">
                    Date
                    {getSortIndicator("start_date")}
                  </div>
                </th>
                <th
                  className="text-left p-3 font-median cursor-pointer hover:bg-fractal-base-grey-80 transition-colors"
                  onClick={() => handleSort("capacity")}
                  title="Click to sort"
                >
                  <div className="flex items-center gap-1">
                    Capacity
                    {getSortIndicator("capacity")}
                  </div>
                </th>
                <th
                  className="text-left p-3 font-median cursor-pointer hover:bg-fractal-base-grey-80 transition-colors"
                  onClick={() => handleSort("location")}
                  title="Click to sort"
                >
                  <div className="flex items-center gap-1">
                    Location
                    {getSortIndicator("location")}
                  </div>
                </th>
                <th className="text-right p-3 font-median">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginate(filtered, page, PER_PAGE).map((event, i) => (
                <tr
                  key={event.id}
                  className={`border-b border-fractal-border-default hover:bg-fractal-base-grey-90 transition-colors ${i % 2 === 0
                    ? "bg-fractal-bg-body-white"
                    : "bg-fractal-bg-body-default"
                    }`}
                >
                  <td
                    className="p-3 font-median max-w-[200px] truncate cursor-pointer hover:underline"
                    onClick={() => setModalContent({ label: "Title", text: event.title })}
                    title="Click to view full title"
                  >
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
                  <td
                    className="p-3 text-fractal-text-placeholder max-w-[150px] truncate cursor-pointer hover:underline"
                    onClick={() => setModalContent({ label: "Location", text: event.location || "—" })}
                    title="Click to view full location"
                  >
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
                        className="p-2 hover:bg-fractal-decorative-yellow-90 border-2 border-fractal-border-default rounded-s shadow-brutal-1 transition-colors disabled:opacity-50"
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

      {/* Pagination */}
      {!isLoading && filtered.length > 0 && (
        <div className="flex items-center justify-between px-1 text-sm text-fractal-base-grey-30">
          <span>
            Showing {Math.min((page - 1) * PER_PAGE + 1, filtered.length)}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} events
          </span>
          <Pagination page={page} total={totalPages(filtered.length, PER_PAGE)} onChange={setPage} />
        </div>
      )}

      {/* Detail Modal */}
      {modalContent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 transition-opacity"
          onClick={() => setModalContent(null)}
        >
          <div
            className="relative bg-white rounded-lg border-2 border-fractal-border-default shadow-brutal-1 p-6 max-w-lg w-[90%] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalContent(null)}
              className="absolute top-3 right-3 p-1 hover:bg-fractal-decorative-yellow-90 border-2 border-fractal-border-default rounded-s shadow-brutal-1 transition-colors"
              title="Close"
            >
              <X size={16} />
            </button>
            <Typography variant="body-1-median" className="mb-3">
              {modalContent.label}
            </Typography>
            <Typography variant="body-1" className="break-words whitespace-pre-wrap">
              {modalContent.text}
            </Typography>
          </div>
        </div>
      )}
    </div>
  );
}