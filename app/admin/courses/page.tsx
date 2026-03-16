"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Plus, ArrowUpDown, SlidersHorizontal, Pencil, Trash2, Loader2 } from "lucide-react";
import type { CourseFormData } from "@/components/admin/course-form";
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
const SEMESTERS = ["1st Semester", "2nd Semester", "Mid-Year"];
const STATUSES = ["open", "closed"];

// variant helpers 
type BadgeVariant = "pink" | "periwinkle" | "dark" | "success" | "warning" | "error";

const SEMESTER_VARIANT: Record<string, BadgeVariant> = {
  "1st Semester": "pink",
  "2nd Semester": "periwinkle",
  "Mid-Year": "dark",
};


const STATUS_VARIANT: Record<string, BadgeVariant> = {
  open: "periwinkle",
  closed: "dark",
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

// courses page proper
export default function CoursesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [courses, setCourses] = useState<CourseFormData[]>([]);
  const [filtered, setFiltered] = useState<CourseFormData[]>([]);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [modalContent, setModalContent] = useState<{ label: string; text: string } | null>(null);
  const [sortOrder, setSortOrder] = useState<"Newest" | "Oldest">("Newest");

  const [semesterFilters, setSemesterFilters] = useState<Set<string>>(new Set());
  const [statusFilters, setStatusFilters] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);

  //  Fetch 
  const getCourses = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("course")
      .select("id, title, description, semester, status, start_time, end_time, Days")
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
      `${e.title} ${e.semester ?? ""}`.toLowerCase().includes(q)
    );
    // empty set = show all. nonempty = only matching values
    if (semesterFilters.size > 0)
      result = result.filter((e) => semesterFilters.has(e.semester ?? ""));
    if (statusFilters.size > 0)
      result = result.filter((e) => statusFilters.has(e.status ?? ""));

    result = result.sort((a, b) => {
      const da = new Date(a.start_time ?? "").getTime();
      const db = new Date(b.start_time ?? "").getTime();
      return sortOrder === "Newest" ? db - da : da - db;
    });

    setFiltered(result);
    setPage(1);
  }, [search, courses, sortOrder, semesterFilters, statusFilters]);

  //  toggle helpers 
  function toggleSemester(semester: string) {
    setSemesterFilters((prev) => {
      const next = new Set(prev);
      next.has(semester) ? next.delete(semester) : next.add(semester);
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
    setSemesterFilters(new Set());
    setStatusFilters(new Set());
  }

  // delete 
  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    const supabase = createClient();
    const { error } = await supabase.from("course").delete().eq("id", id);
    if (error) alert("Failed to delete course: " + error.message);
    else setCourses((prev) => prev.filter((e) => e.id !== id));
    setDeletingId(null);
  };

  const activeFilterCount = semesterFilters.size + statusFilters.size;
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
      key: "semester",
      header: "Semester",
      render: (course) => (
        <Badge variant={SEMESTER_VARIANT[course.semester ?? ""] ?? "dark"}>
          {course.semester}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (course) => (
        <Badge variant={STATUS_VARIANT[course.status ?? ""] ?? "dark"}>
          <span className="capitalize">{course.status}</span>
        </Badge>
      ),
    },

{
  key: "schedule",
  header: "Schedule",
  render: (course) => {
    const formatTime = (time?: string) =>
      time
        ? new Date(time).toLocaleTimeString("en-PH", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : "";

    const start = formatTime(course.start_time);
    const end = formatTime(course.end_time);

    return (
      <div className="flex flex-col leading-tight">
        <span className="caption text-[12px] opacity-80">
          {course.Days || "—"}
        </span>

        <span className="caption whitespace-nowrap">
          {start && end ? `${start} – ${end}` : "—"}
        </span>
      </div>
    );
  },
},

    {
      key: "actions",
      header: "Actions",
      render: (course) => (
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 4 }}>
          <Button
            variant="icon"
            title="Edit course"
            onClick={() => router.push(`/admin/courses/${course.id}/edit`)}
          >
            <Pencil size={14} />
          </Button>
          <Button
            variant="icon"
            title="Delete course"
            disabled={deletingId === course.id}
            style={deletingId === course.id ? { opacity: 0.5 } : { color: "var(--error)" }}
            onClick={() => handleDelete(course.id!, course.title)}
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
    <div className="flex flex-col gap-6">

      {/*  page header  */}
      <div className="flex items-start justify-between gap-4 flex-wrap mt-1">
        <div>
          <h1 className="heading-lg">Courses Management</h1>
          <p className="caption mt-1">
            {isLoading ? "Loading…" : `${filtered.length} course${filtered.length !== 1 ? "s" : ""} total`}
          </p>
        </div>
        <Button variant="primary" onClick={() => router.push("/admin/courses/create")}>
          <Plus size={16} /> Add Course
        </Button>
      </div>

      {/*  toolbar  */}
      <div className="flex flex-col gap-3">

        {/* search, sort, filter */}
        <div className="flex items-center gap-3 flex-wrap">

          <SearchBar
            placeholder="Search by title, semester or ..."
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
              <p className="label" style={{ marginBottom: 4 }}>Semester</p>
            </div>
            {SEMESTERS.map((semester) => (
              <CheckItem
                key={semester}
                label={semester}
                active={semesterFilters.has(semester)}
                onToggle={() => toggleSemester(semester)}
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

        {/* semester */}
        <FilterChips
          chips={["All", ...SEMESTERS]}
          defaultActive={semesterFilters.size === 0 ? "All" : [...semesterFilters][0]}
          onChange={(active) => {
            if (active === "All") setSemesterFilters(new Set());
            else toggleSemester(active);
          }}
        />
      </div>

      {/*  active filter pills  */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap -mt-2">
          <span className="caption">Active filters:</span>

          {[...semesterFilters].map((semester) => (
            <Badge key={semester} variant="pink" dot>
              {semester}
              <button
                onClick={() => toggleSemester(semester)}
                aria-label={`Remove ${semester} filter`}
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
            <span className="caption">Loading courses…</span>
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