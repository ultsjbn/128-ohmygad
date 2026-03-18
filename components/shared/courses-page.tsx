"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Typography, InputText } from "@snowball-tech/fractal";
import { useSearchParams } from "next/navigation";
import { 
  SlidersHorizontal, 
  Loader2, 
  BookOpen, 
  Clock, 
  X, 
  ArrowUpDown, 
  Search, 
  Calendar, 
  GraduationCap 
} from "lucide-react";

import {
  SearchBar,
  Badge,
  FilterChips,
  Button,
  Card,
  Modal,
  Dropdown,
  DropdownItem,
  DropdownDivider,
  Toast,
} from "@/components/ui";

// --- Types & Constants ---

type Course = {
  id: string;
  title: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  days?: string;
  instructor_id?: string;
  status?: string;
  semester?: string;
  capacity?: number;
  enrolled_count?: number;
};

type SortField = "title" | "semester" | "status" | "start_time";
type SortDirection = "asc" | "desc";

interface SortState {
  field: SortField;
  direction: SortDirection;
}

interface FilterState {
  status: Set<string>;
  semester: Set<string>;
}

const SORT_OPTIONS: { label: string; field: SortField }[] = [
  { label: "Title", field: "title" },
  { label: "Semester", field: "semester" },
  { label: "Status", field: "status" },
  { label: "Start Time", field: "start_time" },
];

const STATUS_VARIANT: Record<string, "success" | "warning" | "error" | "dark" | "pink"> = {
  open: "success",
  closed: "error",
  ongoing: "warning",
  archived: "dark",
};

const CATEGORY_GRADIENT: Record<string, string> = {
  "1st Semester": "linear-gradient(135deg, #F4A7B9 0%, #B8B5E8 100%)",
  "2nd Semester": "linear-gradient(135deg, #F4A7B9 0%, #FAF8FF 100%)",
  "Mid-Year": "linear-gradient(135deg, #B8B5E8 0%, #FAF8FF 100%)",
};
const DEFAULT_GRADIENT = "linear-gradient(135deg, #B8B5E8 0%, #2D2A4A 100%)";

// --- Helper Component ---

function CheckItem({ label, active, onToggle }: { label: string; active: boolean; onToggle: () => void }) {
  return (
    <DropdownItem onClick={onToggle}>
      <span className="flex items-center gap-2">
        <span className={`w-[14px] h-[14px] rounded shrink-0 border-[1.5px] inline-flex items-center justify-center ${active ? "border-[var(--primary-dark)] bg-[var(--primary-dark)]" : "border-[rgba(45,42,74,0.20)] bg-transparent"}`}>
          {active && <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
        </span>
        <span className="capitalize">{active ? <strong>{label}</strong> : label}</span>
      </span>
    </DropdownItem>
  );
}

// --- Main Component ---

export default function CoursesPage() {
  const searchParams = useSearchParams();

  // State
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [sort, setSort] = useState<SortState>({ field: "title", direction: "asc" });
  const [filters, setFilters] = useState<FilterState>({ status: new Set(), semester: new Set() });
  const [activeSemesterChip, setActiveSemesterChip] = useState("All Semesters");
  const [detailCourse, setDetailCourse] = useState<Course | null>(null);

  // Fetch Logic
  useEffect(() => {
    async function fetchCourses() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/courses");
        const json = await res.json();
        if (json.success) setCourses(json.courses);
      } catch (err) {
        setToast({ variant: "error", title: "Failed to load courses" });
      } finally {
        setIsLoading(false);
      }
    }
    fetchCourses();
  }, []);

  // Filter & Sort Logic
  const semesters = useMemo(() => Array.from(new Set(courses.map((c) => c.semester).filter(Boolean))) as string[], [courses]);
  const statuses = useMemo(() => Array.from(new Set(courses.map((c) => c.status).filter(Boolean))) as string[], [courses]);

  const filteredAndSorted = useMemo(() => {
    return courses
      .filter((c) => {
        const matchesSearch = `${c.title} ${c.semester}`.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = filters.status.size === 0 || filters.status.has(c.status || "");
        const matchesSemester = filters.semester.size === 0 || filters.semester.has(c.semester || "");
        
        return matchesSearch && matchesStatus && matchesSemester;
      })
      .sort((a, b) => {
        const aVal = (a[sort.field] || "").toString().toLowerCase();
        const bVal = (b[sort.field] || "").toString().toLowerCase();
        return sort.direction === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      });
  }, [courses, search, filters, sort]);

  // Handlers
  const toggleFilter = (type: keyof FilterState, value: string) => {
    setFilters((prev) => {
      const next = new Set(prev[type]);
      next.has(value) ? next.delete(value) : next.add(value);
      
      // If we are modifying semesters via dropdown, reset the chip UI to "All" 
      // if more than one is selected, otherwise sync it.
      if (type === "semester") {
        if (next.size === 1) {
          setActiveSemesterChip(Array.from(next)[0]);
        } else {
          setActiveSemesterChip("All Semesters");
        }
      }

      return { ...prev, [type]: next };
    });
  };

  const handleSemesterChip = (sem: string) => {
    setActiveSemesterChip(sem);
    setFilters(prev => ({ 
      ...prev, 
      semester: sem === "All Semesters" ? new Set() : new Set([sem]) 
    }));
  };

  const totalActiveFilters = filters.status.size + filters.semester.size;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="hidden md:block">
        <h1 className="heading-lg">Course Catalog</h1>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <SearchBar
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            containerStyle={{ flex: 1, minWidth: 120 }}
          />

          <div className="flex items-center gap-2">
            {/* Sort Dropdown */}
            <Dropdown trigger={
              <Button variant="ghost">
                <ArrowUpDown size={15} />
                <span className="hidden md:inline ml-2 capitalize">{sort.field}</span>
              </Button>
            }>
              {SORT_OPTIONS.map((opt) => (
                <DropdownItem key={opt.field} onClick={() => setSort({ field: opt.field, direction: sort.field === opt.field && sort.direction === "asc" ? "desc" : "asc" })}>
                  {opt.label} {sort.field === opt.field && (sort.direction === "asc" ? "↑" : "↓")}
                </DropdownItem>
              ))}
            </Dropdown>

            {/* Filter Dropdown */}
            <Dropdown trigger={
              <Button variant={totalActiveFilters > 0 ? "pink" : "ghost"}>
                <SlidersHorizontal size={15} />
                <span className="hidden md:inline ml-2">Filter</span>
                {totalActiveFilters > 0 && (
                  <span className="ml-2 bg-white text-pink-600 px-1.5 rounded-full text-[10px] font-bold">
                    {totalActiveFilters}
                  </span>
                )}
              </Button>
            }>
              {/* Status Section */}
              <div className="px-3 py-2 font-bold text-xs uppercase opacity-50">Status</div>
              {statuses.map(s => (
                <CheckItem 
                  key={s} 
                  label={s} 
                  active={filters.status.has(s)} 
                  onToggle={() => toggleFilter("status", s)} 
                />
              ))}

              <DropdownDivider />

              {/* Semester Section */}
              <div className="px-3 py-2 font-bold text-xs uppercase opacity-50">Semester</div>
              {semesters.map(sem => (
                <CheckItem 
                  key={sem} 
                  label={sem} 
                  active={filters.semester.has(sem)} 
                  onToggle={() => toggleFilter("semester", sem)} 
                />
              ))}

              <DropdownDivider />
              <DropdownItem 
                className="text-red-500"
                onClick={() => {
                  setFilters({ status: new Set(), semester: new Set() });
                  setActiveSemesterChip("All Semesters");
                }}
              >
                Reset All Filters
              </DropdownItem>
            </Dropdown>
          </div>
        </div>

        <FilterChips 
          chips={["All Semesters", ...semesters]} 
          defaultActive={activeSemesterChip} 
          onChange={handleSemesterChip} 
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <Card className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 className="animate-spin mr-2" size={20} /> Loading catalog...
        </Card>
      ) : filteredAndSorted.length === 0 ? (
        <Card className="py-20 text-center text-gray-500">
          <p>No courses found matching your criteria.</p>
          <Button 
            variant="ghost" 
            className="mt-4 text-xs underline"
            onClick={() => {
              setFilters({ status: new Set(), semester: new Set() });
              setSearch("");
              setActiveSemesterChip("All Semesters");
            }}
          >
            Clear all filters
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredAndSorted.map((course) => (
            <Card 
              key={course.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setDetailCourse(course)}
            >
              <div className="flex justify-between items-start mb-2">
                <Badge variant={STATUS_VARIANT[course.status?.toLowerCase() || ""] || "dark"}>{course.status}</Badge>
                <span className="caption text-gray-400">{course.semester}</span>
              </div>
              <h3 className="heading-sm mb-2">{course.title}</h3>
              <div className="flex flex-col gap-1 text-sm text-gray-500">
                <div className="flex items-center gap-2"><Clock size={14}/> {course.start_time} - {course.end_time}</div>
                <div className="flex items-center gap-2"><Calendar size={14}/> {course.days || "TBA"}</div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Modal open={!!detailCourse} onClose={() => setDetailCourse(null)} hideCloseButton modalStyle={{ maxWidth: 500 }}>
        {detailCourse && (
          <div className="flex flex-col gap-4 p-5">
            <div className="flex justify-between items-center">
              <Badge variant="pink">{detailCourse.semester}</Badge>
              <button onClick={() => setDetailCourse(null)}><X size={20}/></button>
            </div>
            <h2 className="heading-md">{detailCourse.title}</h2>
            <div className="divider" />
            <div className="space-y-3">
              <p className="label">Course Description</p>
              <p className="body text-gray-600">{detailCourse.description || "No description provided."}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="flex items-center gap-2 text-sm"><BookOpen size={16}/> Instructor ID: {detailCourse.instructor_id}</div>
              <div className="flex items-center gap-2 text-sm"><GraduationCap size={16}/> Status: {detailCourse.status}</div>
            </div>
            {/* Wag muna to lkjasdljasdlkj */}
            {/* <Button className="w-full mt-4" onClick={() => setToast({ variant: "success", title: "Enrolled Successfully!" })}>
              Enroll in Course
            </Button> */}
          </div>
        )}
      </Modal>

      {detailCourse && (
        <div className="flex flex-col min-h-0">
          <div
            className="h-[200px] sm:h-[180px] relative shrink-0 rounded-t-[var(--radius-xl)]"
            style={{ background: CATEGORY_GRADIENT[detailCourse.semester ?? ""] ?? DEFAULT_GRADIENT }}
          >
            {/* detailCourse.banner_url ? `url(${detailCourse.banner_url}) center/cover no-repeat` : */}
            {/* close button inside cover */}
            <button
              onClick={() => { setDetailCourse(null); }}
              aria-label="Close"
              className="absolute top-3 right-3 w-4 h-4 sm:w-6 sm:h-6 rounded-full border-none cursor-pointer flex items-center justify-center text-[var(--primary-dark)] z-10 backdrop-blur-sm bg-white/80"
            >
              <X size={14} />
            </button>

            {/* category and status badges bottom-left of cover */}
            <div className="absolute bottom-3 left-3 flex gap-2 items-center">
              <span className="badge badge-pink">{detailCourse.semester ?? "Uncategorized"}</span>
              {detailCourse.status && (
                <Badge variant={STATUS_VARIANT[detailCourse.status.toLowerCase().trim()] ?? "dark"}>
                  <span className="capitalize">{detailCourse.status}</span>
                </Badge>
              )}
            </div>
          </div>

          {/* body - overflow-y-auto here so only body scrolls, cover + footer stay fixed */}
          <div className="flex flex-col gap-3 p-3 sm:p-5 overflow-y-auto">
            {/* title */}
            <h2 className="heading-md m-0">{detailCourse.title}</h2>

            {/* details row */}
            <div className="flex flex-col gap-1.5">
              {/* ---------- date ---------- */}
              <div className="flex items-start gap-3 caption sm:text-sm text-[var(--gray)]">
                <Clock size={15} className="shrink-0 mt-0.5" />
                <span>
                  {detailCourse.start_time ? new Date(detailCourse.start_time).toLocaleDateString("en-PH", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : "—"}
                  {detailCourse.end_time && detailCourse.end_time !== detailCourse.start_time && (
                    <> — {new Date(detailCourse.end_time).toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })}</>
                  )}
                </span>
              </div>
            </div>

            {/* divider */}
            <div className="divider" />

            {/* full description */}
            <div className="flex flex-col gap-2 pb-2">
              <p className="label">ABOUT THIS COURSE</p>
              <p className="body whitespace-pre-wrap">{detailCourse.description || "No description provided."}</p>
            </div>
          </div>{/* end body */}
        </div>
      )}
    </div>
  );
}