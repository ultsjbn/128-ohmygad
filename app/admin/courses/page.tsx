"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { Paper } from "@snowball-tech/fractal";
import { Button } from "@/components/button";
import { Typography } from "@/components/typography";

import CourseCard from "@/components/admin/courses/CourseCard";
import CourseSearch from "@/components/admin/courses/CourseSearch";
import CourseSort from "@/components/admin/courses/CourseSort";

import type { CourseFormData } from "@/components/admin/course-form";

type SortField = "title" | "start_time" | "end_time" | "semester" | "status";
type SortDirection = "asc" | "desc";

export default function CoursesPage() {

  const router = useRouter();

  const [courses, setCourses] = useState<CourseFormData[]>([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState<Partial<CourseFormData>>({});
  const [sortField, setSortField] = useState<SortField>("title");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    const supabase = createClient();

    const { data } = await supabase
      .from("course")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setCourses(data);
  }

  const filtered = useMemo(() => {

    const q = search.toLowerCase();

    let result = courses.filter((c) =>
      `${c.title} ${c.start_time ?? ""} ${c.end_time ?? ""}`
        .toLowerCase()
        .includes(q)
    );

    result.sort((a, b) => {
      const aVal = a[sortField] ?? "";
      const bVal = b[sortField] ?? "";

      return sortDir === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

    return result;

  }, [courses, search, sortField, sortDir]);

  async function updateCourse(id: string) {

    const res = await fetch(`/api/courses/${id}`, {
      method: "PATCH",
      body: JSON.stringify(editFields),
    });

    const json = await res.json();

    if (json.success) {
      setCourses((s) => s.map((c) => (c.id === id ? json.course : c)));
      setEditingId(null);
      setEditFields({});
    }
  }

  async function deleteCourse(id: string) {

    if (!confirm("Delete this course?")) return;

    await fetch(`/api/courses/${id}`, { method: "DELETE" });

    setCourses((s) => s.filter((c) => c.id !== id));
  }

  function changeSort(field: SortField) {
    if (field === sortField) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  return (
    <div className="mx-auto flex flex-col gap-6 max-w-[1400px]">

      <Typography variant="heading-2">
        Courses
      </Typography>

      <div className="flex justify-between gap-3">

        <CourseSearch
          value={search}
          onChange={setSearch}
        />

        <Button
          label="Add Course"
          icon={<Plus size={18} />}
          onClick={() => router.push("/admin/courses/create")}
        />

      </div>

      <CourseSort
        field={sortField}
        direction={sortDir}
        onChange={changeSort}
      />

      <Paper title="All Courses">

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">

          {filtered.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              isEditing={editingId === course.id}
              editFields={editFields}
              setEditFields={setEditFields}
              onEdit={() => {
                setEditingId(course.id);
                setEditFields(course);
              }}
              onSave={() => updateCourse(course.id)}
              onCancel={() => {
                setEditingId(null);
                setEditFields({});
              }}
              onDelete={() => deleteCourse(course.id)}
            />
          ))}

        </div>

      </Paper>

    </div>
  );
}