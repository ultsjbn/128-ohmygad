"use client";

import React, { useState, useEffect } from "react";
import { Typography, InputText } from "@snowball-tech/fractal";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

type Course = {
  id: string;
  title: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  instructor_id?: string;
  status?: string;
  semester?: string;
  created_at?: string;
  updated_at?: string;
};

export default function CoursesPage() {
  const searchParams = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");

  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoading(true);
        const res = await fetch("/api/courses");
        const json = await res.json();
        if (json.success && Array.isArray(json.courses)) {
          setCourses(json.courses);
        }
      } catch (err) {
        console.error("[fetchCourses] Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  // sync the URL search param to the local search 
  useEffect(() => {
    const s = searchParams.get("search");
    if (s !== null) setSearch(s);
  }, [searchParams]);

  const filtered = courses.filter((c) =>
    `${c.title} ${c.start_time || ""} ${c.end_time || ""} ${c.semester || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto h-full flex flex-col gap-6">

      {/* Search */}
      <div className="shrink-0">
        <InputText
          placeholder="Search courses..."
          fullWidth
          prefix={<Search size={18} />}
          onChange={(_e, value) => setSearch(value)}
          value={search}
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="p-8 text-center">
          <Typography variant="body-1" className="text-fractal-text-placeholder">Loading courses...</Typography>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center">
          <Typography variant="body-1" className="text-fractal-text-placeholder">
            {search ? "No courses match your search." : "No courses available."}
          </Typography>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((course) => (
            <div
              key={course.id}
              className="flex flex-col gap-2 border-2 border-fractal-border-default rounded-s bg-fractal-bg-body-white hover:shadow-brutal-1 transition-all overflow-hidden"
            >
              <div className="h-1.5 w-full bg-fractal-decorative-blue-70" />

              <div className="flex items-start justify-between px-4 pt-2">
                <Typography variant="body-1-median" className="flex-1">{course.title}</Typography>
                <span className="px-2 py-0.5 text-xs font-median border border-fractal-base-grey-70 rounded-s bg-fractal-base-grey-90 capitalize ml-2 shrink-0">
                  {course.status || "—"}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 px-4 pb-3">
                <Typography variant="body-2" className="text-fractal-text-placeholder line-clamp-2">
                  {course.description || "—"}
                </Typography>
                <Typography variant="body-2" className="text-fractal-text-placeholder">
                  <strong>Start:</strong> {course.start_time || "—"}
                </Typography>
                <Typography variant="body-2" className="text-fractal-text-placeholder">
                  <strong>End:</strong> {course.end_time || "—"}
                </Typography>
                <Typography variant="body-2" className="text-fractal-text-placeholder">
                  <strong>Semester:</strong> {course.semester || "—"}
                </Typography>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && (
        <Typography variant="body-2" className="text-fractal-text-placeholder shrink-0">
          Showing {filtered.length} of {courses.length} courses
        </Typography>
      )}
    </div>
  );
}