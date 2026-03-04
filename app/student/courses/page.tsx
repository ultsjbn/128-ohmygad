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
        <div className="flex items-center gap-2 w-full shadow-brutal-1 pb-4">
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
      </Paper>
    </div>
  );
}