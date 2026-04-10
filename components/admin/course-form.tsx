"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitFormData } from "@/lib/form-submit.utils";
import { AlignLeft, Type } from "lucide-react";
import { Card, Input, Select, Button, DateTimePicker } from "@/components/ui"; 

export type CourseFormData = {
  id?: string;
  title: string;
  description: string;
  semester: string;
  start_time: string;
  end_time: string;
  days: string;
  status: string;

};

type CourseFormProps = {
  initialData?: CourseFormData;
  mode: "create" | "edit";
};

const SEMESTER_OPTIONS = [
  { value: "1st Semester", label: "1st Semester" },
  { value: "2nd Semester", label: "2nd Semester" },
  { value: "Mid-Year", label: "Mid-Year" },
];

const STATUS_OPTIONS = [
   { value: "open", label: "Open" },
   { value: "closed", label: "Closed" },
 ];

export default function CourseForm({ initialData, mode }: CourseFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");

  const parseTime = (value?: string) => {
    if (!value) return "";
    const match = value.match(/(\d{1,2}:\d{2})/);
    return match ? match[1] : "";
  };

  const [start_time, setStartTime] = useState<string>(parseTime(initialData?.start_time));
  const [end_time, setEndTime] = useState<string>(parseTime(initialData?.end_time));
  const [days, setDays] = useState(initialData?.days ?? "");
  const [semester, setSemester] = useState(initialData?.semester ?? "");
  const [status, setStatus] = useState(initialData?.status ?? "");

  // submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!title || !status || !semester || !start_time || !end_time) {
      setError("Please fill in all required fields.");
      setIsLoading(false);
      return;
    }

    const parseTimeToMinutes = (timeRaw: string) => {
      const timeStr = parseTime(timeRaw);
      if (!timeStr) return null;
      const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
      if (!match) return null;
      const h = Number(match[1]);
      const m = Number(match[2]);
      if (Number.isNaN(h) || Number.isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) return null;
      return h * 60 + m;
    };

    const startMinutes = parseTimeToMinutes(start_time);
    const endMinutes = parseTimeToMinutes(end_time);

    if (startMinutes === null || endMinutes === null) {
      setError("Invalid time format. Please select a valid start and end time.");
      setIsLoading(false);
      return;
    }

    if (startMinutes >= endMinutes) {
      setError("End time must be after the start time.");
      setIsLoading(false);
      return;
    }

    const formatTime = (timeRaw: string) => {
      const parsed = parseTime(timeRaw);
      return parsed.length === 5 ? parsed + ":00" : parsed;
    };

    const payload = {
      title,
      description,
      start_time: start_time ? formatTime(start_time) : null,
      end_time: end_time ? formatTime(end_time) : null,
      semester,
      status,
      days,
      updated_at: new Date().toISOString(),
    };

    const result = await submitFormData("course", payload, mode, initialData?.id);

        if (result.success) {
      router.push("/admin/courses");
      router.refresh();
      } else {
        console.error("Submit error:", result);
        setError(JSON.stringify(result));
      }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full lg:h-auto w-full min-h-0 relative">
      
      {/* scrollable wrapper for mobile, fully expanded on desktop */}
      <div className="flex-1 overflow-y-auto lg:overflow-visible custom-scrollbar pr-1 lg:pr-0 pb-4 lg:pb-0 min-h-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* left column: basic information */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 p-3 h-full">
              <div className="border-b border-[rgba(45,42,74,0.08)] pb-2">
                <h3 className="heading-md">Basic Information</h3>
              </div>

              <Input
                label="Title *"
                placeholder="e.g. Gender and Technology"
                required
                prefixIcon={<Type size={15} />}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

                <div className="input-wrap">
                <label htmlFor="description" className="label">Description</label>
                <div className="input-icon-wrap">
                  <AlignLeft className="input-prefix-icon w-2 h-2 top-5 translate-y-0" />
                  <textarea
                    id="description"
                    placeholder="Describe the course..."
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input pl-[42px] py-3 resize-y"
                  />
                </div>
              </div>

          

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Select
                  label="Status *"
                  required
                  options={[{ value: "", label: "Select status" }, ...STATUS_OPTIONS]}
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                />

                <Select 
                  label="Semester *"
                  required
                  options={[{ value: "", label: "Select semester" }, ...SEMESTER_OPTIONS]}
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                />
              </div>

            </div>
          </div>

          {/* right column: course schedule & actions */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 p-3">
              <div className="border-b border-[rgba(45,42,74,0.08)] pb-2">
                <h3 className="heading-md">Course Schedule</h3>
              </div>

              <DateTimePicker
                label="Start Time"
                mode="time"
                required
                value={start_time}
                onChange={setStartTime}
              />

              <DateTimePicker
                label="End Time"
                mode="time"
                required
                value={end_time}
                onChange={setEndTime}
              />

              <Input
                label="Days"
                placeholder="e.g. MWF, TTh"
                value={days}
                onChange={(e) => setDays(e.target.value)}
              />

             

          
            </div>

            {/* error toast */}
            {error && (
              <div className="toast toast-error">
                <span className="font-semibold text-[var(--error)]">{error}</span>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* sticky footer actions on mobile, standard footer flow on desktop */}
      <div className= "lg:static mt-2 flex gap-3 justify-end shrink-0 z-10">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin/courses")}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
          className="px-8"
        >
          {isLoading
            ? mode === "create" ? "Creating..." : "Saving..."
            : mode === "create" ? "Create Course" : "Save Changes"
          }
        </Button>
      </div>
      
    </form>
  );
}