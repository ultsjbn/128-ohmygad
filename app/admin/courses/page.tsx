"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

import { Paper, InputText } from "@snowball-tech/fractal";
import { Search, Plus, Edit2, Trash2, Save, X, ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";

import { Button } from "@/components/button";
import { Typography } from "@/components/typography";

import type { CourseFormData } from "@/components/admin/course-form";

type SortField = "title" | "start_time" | "end_time" | "semester" | "status";
type SortDirection = "asc" | "desc";

export default function CoursesPage() {
  const router = useRouter();

  const [courses, setCourses] = useState<CourseFormData[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState<Partial<CourseFormData>>({});

  const [sortField, setSortField] = useState<SortField>("title");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    const supabase = createClient();

    const { data } = await supabase
      .from("course")
      .select("id,title,description,start_time,end_time,semester,status")
      .order("created_at", { ascending: false });

    if (data) setCourses(data);
    setLoading(false);
  }

  const filteredCourses = useMemo(() => {
    const q = search.toLowerCase();

    let result = courses.filter((c) =>
      `${c.title} ${c.start_time ?? ""} ${c.end_time ?? ""}`
        .toLowerCase()
        .includes(q)
    );

    result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (!aVal) return 1;
      if (!bVal) return -1;

      if (sortField.includes("time")) {
        const aTime = new Date(aVal as string).getTime();
        const bTime = new Date(bVal as string).getTime();
        return sortDir === "asc" ? aTime - bTime : bTime - aTime;
      }

      return sortDir === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

    return result;
  }, [courses, search, sortField, sortDir]);

  function toggleSort(field: SortField) {
    if (field === sortField) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  async function updateCourse(id: string) {
    const res = await fetch(`/api/courses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editFields),
    });

    const json = await res.json();

    if (json.success) {
      setCourses((c) => c.map((x) => (x.id === id ? json.course : x)));
      setEditingId(null);
      setEditFields({});
    }
  }

  async function deleteCourse(id: string) {
    if (!confirm("Delete this course?")) return;

    const res = await fetch(`/api/courses/${id}`, { method: "DELETE" });
    const json = await res.json();

    if (json.success) {
      setCourses((c) => c.filter((x) => x.id !== id));
    }
  }

  if (loading) {
    return <Typography>Loading courses...</Typography>;
  }

  return (
    <div className="mx-auto flex flex-col gap-6 max-w-[1400px]">

      <Typography variant="heading-2">Courses</Typography>

      {/* Search + Add */}
      <div className="flex justify-between gap-3">

        <InputText
          prefix={<Search size={18} />}
          placeholder="Search courses..."
          fullWidth
          onChange={(e) => setSearch(e.target.value)}
        />

        <Button
          label="Add Course"
          icon={<Plus size={18} />}
          onClick={() => router.push("/admin/courses/create")}
        />
      </div>

      <Paper title="All Courses">

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

          {filteredCourses.map((course) => {
            const editing = editingId === course.id;

            return (
              <div
                key={course.id}
                className="border rounded p-4 flex flex-col gap-2"
              >
                {editing ? (
                  <InputText
                    value={editFields.title ?? course.title}
                    onChange={(e: any) =>
                      setEditFields({ ...editFields, title: e.target.value })
                    }
                  />
                ) : (
                  <Typography variant="body-1-median">
                    {course.title}
                  </Typography>
                )}

                {editing ? (
                  <InputText
                    value={editFields.description ?? course.description ?? ""}
                    onChange={(e: any) =>
                      setEditFields({
                        ...editFields,
                        description: e.target.value,
                      })
                    }
                  />
                ) : (
                  <Typography variant="body-2">
                    {course.description ?? "—"}
                  </Typography>
                )}

                <div className="flex gap-2 mt-auto">

                  {editing ? (
                    <>
                      <Button
                        label="Save"
                        icon={<Save size={14} />}
                        onClick={() => updateCourse(course.id)}
                      />
                      <Button
                        label="Cancel"
                        icon={<X size={14} />}
                        onClick={() => {
                          setEditingId(null);
                          setEditFields({});
                        }}
                      />
                    </>
                  ) : (
                    <>
                      <Button
                        label="Edit"
                        icon={<Edit2 size={14} />}
                        onClick={() => {
                          setEditingId(course.id);
                          setEditFields(course);
                        }}
                      />
                      <Button
                        label="Delete"
                        icon={<Trash2 size={14} />}
                        onClick={() => deleteCourse(course.id)}
                      />
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