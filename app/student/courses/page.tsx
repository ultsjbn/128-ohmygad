"use client";

import React, { useState, useEffect } from "react";
import { Typography, Paper, Button, InputText } from "@snowball-tech/fractal";
import { Search, Users, Plus, Edit2, Trash2, Save, X } from "lucide-react";

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
  const [courses, setCourses] = useState<Course[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: "", description: "", start_time: "", end_time: "", instructor_id: "", status: "active", semester: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState<Partial<Course>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Fetch courses on load
  useEffect(() => {
    fetchCourses();
  }, []);

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

  const filtered = courses.filter((c) =>
    `${c.title} ${c.start_time || ""} ${c.end_time || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="max-w-[1400px] w-full flex flex-col gap-6">
      {/* Course Cards */}
      <Paper elevation="bordered" title="All Courses" titleVariant="heading-2" className="flex flex-col gap-4">
        <div className="flex items-center gap-2 w-full pb-3 border-b border-fractal-base-grey-70">
          <div className="flex items-center gap-2 w-full max-w-sm">
            <Search size={16} className="text-fractal-text-placeholder" />
            <InputText
              value={search}
              onChange={(e: any) => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="flex-1 bg-transparent outline-none text-sm font-sans"
            />
          </div>
        </div>

        {loading && <Typography variant="body-2">Loading courses...</Typography>}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((course) => {
            const isEditing = editingId === course.id;

            return (
              <div
                key={course.id}
                className="flex flex-col gap-2 border-2 border-fractal-border-default rounded-s bg-white hover:shadow-brutal-1 transition-all overflow-hidden"
              >
                {/* Top accent bar */}
                <div className="h-1.5 w-full bg-fractal-decorative-blue-70" />

                <div className="flex items-start justify-between px-4 pt-2">
                  <div className="flex-1">
                    {isEditing ? (
                      <InputText
                        value={editFields.title ?? course.title}
                        onChange={(e: any) => setEditFields({ ...editFields, title: e.target.value })}
                      />
                    ) : (
                      <Typography variant="body-1-median">{course.title}</Typography>
                    )}
                  </div>
                  <span className="px-2 py-0.5 text-xs font-median border-2 border-fractal-border-default rounded-fractal-xs bg-fractal-base-grey-90">
                    {isEditing ? (
                      <InputText
                        value={editFields.status ?? course.status ?? ""}
                        onChange={(e: any) => setEditFields({ ...editFields, status: e.target.value })}
                        className="w-16"
                      />
                    ) : (
                      course.status || "—"
                    )}
                  </span>
                </div>

                {/* Description and details */}
                <div className="flex flex-col gap-1.5 px-4 pb-3">
                  {isEditing ? (
                    <>
                      <InputText
                        value={editFields.description ?? course.description ?? ""}
                        onChange={(e: any) => setEditFields({ ...editFields, description: e.target.value })}
                        placeholder="Description"
                      />
                      <InputText
                        value={editFields.start_time ?? course.start_time ?? ""}
                        onChange={(e: any) => setEditFields({ ...editFields, start_time: e.target.value })}
                        placeholder="Start time"
                      />
                      <InputText
                        value={editFields.end_time ?? course.end_time ?? ""}
                        onChange={(e: any) => setEditFields({ ...editFields, end_time: e.target.value })}
                        placeholder="End time"
                      />
                      <InputText
                        value={editFields.semester ?? course.semester ?? ""}
                        onChange={(e: any) => setEditFields({ ...editFields, semester: e.target.value })}
                        placeholder="Semester"
                      />
                    </>
                  ) : (
                    <>
                      <Typography variant="body-2" className="text-fractal-text-placeholder">
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
                    </>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </Paper>
    </div>
  );
}