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

const CATEGORIES = ["All", "Orientation", "Forum", "Research", "Training", "Workshop"];
const STATUSES = ["All", "upcoming", "past"];
const SORT_OPTIONS = ["Newest", "Oldest"];

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventFormData[]>([]);
  const [filtered, setFiltered] = useState<EventFormData[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [modalContent, setModalContent] = useState<{ label: string; text: string } | null>(null);
  const [sortOrder, setSortOrder] = useState("Newest");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
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

  // Apply search, filter, sort
  useEffect(() => {
    const q = search.toLowerCase();
    let result = events;

    // Text search
    result = result.filter(
      (e) =>
        `${e.title} ${e.category || ""} ${e.location || ""}`
          .toLowerCase()
          .includes(q)
    );

    // Category filter
    result = result.filter(
      (e) => categoryFilter === "All" || e.category === categoryFilter
    );

    // Status filter
    result = result.filter(
      (e) => statusFilter === "All" || e.status === statusFilter
    );

    // Sorting
    result = result.sort((a, b) => {
      const dateA = new Date(a.start_date ?? "").getTime();
      const dateB = new Date(b.start_date ?? "").getTime();
      return sortOrder === "Newest" ? dateB - dateA : dateA - dateB;
    });

    setFiltered(result);
  }, [search, events, sortOrder, categoryFilter, statusFilter]);

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
    <div className="mx-auto min-h-full flex flex-col gap-6">

      <div className="flex flex-col gap-1">
        <Typography variant="heading-2">Events Management</Typography>
      </div>

      {/* Search + Sort + Filter row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
        <InputText
          placeholder="Search by title, category, or location..."
          fullWidth
          prefix={<Search size={18} />}
          onChange={(_e, value) => setSearch(value)}
          value={search}
        />
        <div className="flex items-center gap-2 shrink-0 relative">
          {/* Sort button + dropdown */}
          <div className="relative">
            <Button
              label="Sort"
              variant="display"
              icon={<ArrowUpDown size={18} />}
              iconPosition="left"
              onClick={() => { setShowSortMenu((p) => !p); setShowFilterMenu(false); }}
              className="whitespace-nowrap"
            />
            {showSortMenu && (
              <div className="absolute right-0 top-full mt-1 z-10 bg-white border-2 border-fractal-border-default rounded-s shadow-brutal-2 min-w-[140px]">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => { setSortOrder(opt); setShowSortMenu(false); }}
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
              onClick={() => { setShowFilterMenu((p) => !p); setShowSortMenu(false); }}
              className="whitespace-nowrap"
            />
            {showFilterMenu && (
              <div className="absolute right-0 top-full mt-1 z-10 bg-white border-2 border-fractal-border-default rounded-s shadow-brutal-2 min-w-[200px] p-3 flex flex-col gap-3">
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
                  onClick={() => { setCategoryFilter("All"); setStatusFilter("All"); setShowFilterMenu(false); }}
                  className="text-xs text-fractal-text-placeholder underline text-left mt-1 hover:text-fractal-text-default transition-colors"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>

          <Button 
            label="Add Event" 
            variant="primary-dark" 
            icon={<Plus size={18} />} 
            iconPosition="left" 
            onClick={() => router.push("/admin/events/create")} 
            className="whitespace-nowrap"
          />
        </div>
      </div>

      {/* Applied filters display */}
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

      <Paper elevation="elevated" className="overflow-auto p-0">
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
              {search ? "No events match your search." : "No events available."}
            </Typography>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b-2 border-fractal-border-default bg-fractal-base-grey-90 sticky top-0">
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
                    onClick={() => setModalContent({ label: event.title, text: event.description })}
                    title="Click to view full title and event description"
                  >
                    {event.title}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-s text-xs font-median border-2 border-fractal-border-default bg-fractal-base-grey-90">
                      {event.category}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-s text-xs font-median capitalize border border-fractal-border-default">
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