"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Plus, ArrowUpDown, Pencil, Trash2, Loader2, ChevronUp, ChevronDown } from "lucide-react";
import CourseForm, { type CourseFormData } from "@/components/admin/course-form";
import { paginate, totalPages, PER_PAGE } from "@/lib/pagination.utils";
import { Pagination } from "@/components/pagination";

import {
  Button,
  Badge,
  SearchBar,
  Card,
  DataTable,
  type Column,
  DropdownItem,
  Modal,
  Toast,
} from "@/components/ui";

function formatTime(time?: string) {
  if (!time) return "—"

  const [hour, minute] = time.split(":")
  const h = Number(hour)
  const suffix = h >= 12 ? "PM" : "AM"
  const hour12 = h % 12 || 12

  return `${hour12}:${minute} ${suffix}`
}

const SORT_FIELDS = ["title", "status", "semester", "start_time"] as const;
type SortField = typeof SORT_FIELDS[number];
type SortDirection = "asc" | "desc";

// variant helpers 
type BadgeVariant = "pink-light" | "periwinkle" | "dark" | "success" | "warning" | "error";


const STATUS_VARIANT: Record<string, BadgeVariant> = {
  open: "periwinkle",
  closed: "dark",
};

// courses page proper
export default function CoursesPage() {
  const searchParams = useSearchParams();

  const [courses, setCourses] = useState<CourseFormData[]>([]);
  const [filtered, setFiltered] = useState<CourseFormData[]>([]);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [modalContent, setModalContent] = useState<{ label: string; text: string } | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CourseFormData | null>(null);
  const [sort, setSort] = useState<{ field: SortField; direction: SortDirection }>({ field: "start_time", direction: "desc" });

  const [semesterFilter, setSemesterFilter] = useState<string>("All");
  const [statusFilters, setStatusFilters] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);

  // for the delete confirmation modal
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  const [toast, setToast] = useState<{ variant: "success"|"error"; title: string; message?: string } | null>(null);

  const showToast = (variant: "success"|"error", title: string, message?: string) => {
    setToast({ variant, title, message });
    setTimeout(() => setToast(null), 3000);
  };

  //  Fetch 
  const getCourses = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("course")
      .select("id, title, description, semester, status, start_time, end_time, days")
      .order("start_time", { ascending: false });

    if (!error && data) {
      setCourses(data);
      setFiltered(data);
    }
    setIsLoading(false);
  };

  useEffect(() => { getCourses(); }, []);

  // sync the URL search param to the local search state
  useEffect(() => {
    const s = searchParams.get("search");
    if (s !== null) setSearch(s);
  }, [searchParams]);

  //  filter / sort 
  useEffect(() => {
    const q = search.toLowerCase();
    let result = courses;

    result = result.filter((e) =>
      `${e.title} ${e.days} ${e.start_time} ${e.end_time} ${e.semester ?? ""}`.toLowerCase().includes(q)
    );

    // Semester filter (single-select)
    if (semesterFilter !== "All") {
      result = result.filter((e) => e.semester === semesterFilter);
    }

    // Status filter (multi-select)
    if (statusFilters.size > 0) {
      result = result.filter((e) => statusFilters.has(e.status ?? ""));
    }

    // Sorting (multi-field)
    result = result.sort((a, b) => {
      let aVal: any = a[sort.field as keyof CourseFormData];
      let bVal: any = b[sort.field as keyof CourseFormData];

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return sort.direction === "asc" ? 1 : -1;
      if (bVal == null) return sort.direction === "asc" ? -1 : 1;

      if (sort.field === "start_time") {
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
  }, [search, courses, sort, semesterFilter, statusFilters]);

  //  toggle helpers 
  function toggleStatus(s: string) {
    setStatusFilters((prev) => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });
  }

  function clearAllFilters() {
    setSemesterFilter("All");
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
    
    const { error } = await supabase.from("course").delete().eq("id", deleteTarget.id);
    
    if (error) {
      showToast("error", "Failed to delete guideline", error.message);
    } else {
      setCourses((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      showToast("success", "Guideline deleted successfully");
    }
    
    setDeletingId(null);
    setDeleteTarget(null);
  };

  const activeFilterCount = (semesterFilter !== "All" ? 1 : 0) + statusFilters.size;
  const hasActiveFilters = activeFilterCount > 0;

  // DataTable columns 
  const columns: Column<CourseFormData>[] = [
    {
      key: "title",
      header: "Title",
      render: (course) => (
        <button
          className="text-left font-semibold hover:underline underline-offset-4 max-w-[200px] truncate block"
          style={{ color: "var(--primary-dark)", fontSize: 13 }}
          onClick={() => setModalContent({ label: course.title, text: course.description })}
          title="Click to view description"
        >
          {course.title}
        </button>
      ),
    },

{
  key: "description",
  header: "Description",
  render: (course) => (
    <span 
      style={{ color: "var(--primary-dark)", fontSize: 13 }}
      className="capitalize truncate block max-w-xs" 
      title={course.description}
    >
      {course.description}
    </span>
  ),
},



    {
      key: "actions",
      header: "Actions",
      render: (course) => (
        <div style={{ display: "flex", justifyContent: "flex-start", gap: 4 }}>
          <Button
            variant="icon"
            title="Edit course"
            onClick={() => setEditTarget(course)}
          >
            <Pencil size={14} />
          </Button>
          <Button
            variant="icon"
            title="Delete course"
            disabled={deletingId === course.id}
            style={deletingId === course.id ? { opacity: 0.5 } : { color: "var(--error)" }}
            onClick={() => setDeleteTarget({ id: course.id!, title: course.title })}
          >
            {deletingId === course.id
              ? <Loader2 size={14} className="animate-spin" />
              : <Trash2 size={14} />}
          </Button>
        </div>
      ),
    },
  ];

  // 
  return (
    <div className="flex flex-col gap-6 py-2">
      {/*  toolbar  */}
      <div className="flex flex-col gap-3">

        {/* search, sort, filter */}
        <div className="flex items-center gap-3 flex-wrap">

          <SearchBar
            placeholder="Search by Title"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            containerStyle={{ flex: 1, minWidth: 220 }}
          />

          <Button 
            variant="ghost" 
            onClick={() => handleSort("title")}
            className="flex items-center gap-2"
          >
            <SortIcon field="title" />
            <span>Sort by Title</span>
          </Button>


            <Button variant="primary" onClick={() => setCreateModalOpen(true)}>
                <Plus size={16} /> Add Guideline
            </Button>
        </div>

     
      </div>

      {/*  active filter pills  */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap -mt-2">
          <span className="caption">Active filters:</span>

          {semesterFilter !== "All" && (
            <Badge variant="pink-light" dot>
              {semesterFilter}
              <button
                onClick={() => setSemesterFilter("All")}
                aria-label={`Remove ${semesterFilter} filter`}
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

      {/*  table / empty / loading  */}
      {isLoading ? (
        <Card>
          <div className="flex items-center justify-center gap-3 py-10" style={{ color: "var(--gray)" }}>
            <Loader2 size={20} className="animate-spin" />
            <span className="caption">Loading guidelines…</span>
          </div>
        </Card>

      ) : filtered.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <p className="caption">
              {search || hasActiveFilters
                ? "No courses match your search or filters."
                : "No courses yet. Add your first course to get started."}
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
          keyExtractor={(course) => course.id!}
        />
      )}

      {/*  pagination  */}
      {!isLoading && filtered.length > 0 && (
        <div className="flex items-center justify-between flex-wrap gap-3">
          <span className="caption">
            Showing {Math.min((page - 1) * PER_PAGE + 1, filtered.length)}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} courses
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
        title="Add Guideline"
        modalStyle={{ maxWidth: 860 }}
      >
        <CourseForm
          mode="create"
          onSuccess={() => { setCreateModalOpen(false); getCourses(); }}
          onCancel={() => setCreateModalOpen(false)}
        />
      </Modal>

      {/* edit modal */}
      <Modal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Edit Guideline"
        subtitle={editTarget?.title}
        modalStyle={{ maxWidth: 860 }}
      >
        {editTarget && (
          <CourseForm
            key={editTarget.id}
            mode="edit"
            initialData={editTarget}
            onSuccess={() => { setEditTarget(null); getCourses(); }}
            onCancel={() => setEditTarget(null)}
          />
        )}
      </Modal>

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

      {/* confirm delete modal */}
        <Modal
            open={!!deleteTarget}
            onClose={() => !deletingId && setDeleteTarget(null)}
            title="Delete Course?"
            subtitle="This action cannot be undone."
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

      {/* floating toast notification */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999 }}>
          <Toast variant={toast.variant} title={toast.title} message={toast.message} />
        </div>
      )}

    </div>
  );
}