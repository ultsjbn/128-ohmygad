"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitFormData } from "@/lib/form-submit.utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Paper, Typography } from "@snowball-tech/fractal";

export type CourseFormData = {
  id?: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  semester: string;
  status: string;
};

type CourseFormProps = {
  initialData?: CourseFormData;
  mode: "create" | "edit";
};

const SEMESTERS = ["1st", "2nd", "Mid-Year"];
const STATUSES = ["Open", "Closed"];

export default function CourseForm({ initialData, mode }: CourseFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [start_time, setStartTime] = useState(initialData?.start_time?.slice(0, 16) ?? "");
  const [end_time, setEndTime] = useState(initialData?.end_time?.slice(0, 16) ?? "");
  const [semester, setSemester] = useState(initialData?.semester ?? "");
  const [status, setStatus] = useState(initialData?.status ?? "Open");

  // Submit handler — uses shared submitFormData utility from lib/form-submit.utils
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const payload = {
      title,
      description,
      start_time: start_time ? new Date(start_time).toISOString() : null,
      end_time: end_time ? new Date(end_time).toISOString() : null,
      semester,
      status,
      updated_at: new Date().toISOString(),
    };

    console.log("Payload being sent:", payload);

    const result = await submitFormData("course", payload, mode, initialData?.id);

    if (result.success) {
      router.push("/admin/courses");
      router.refresh();
    } else {
      setError(result.error || "An error occurred");
    }

    setIsLoading(false);
  };

   return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

       {/* LEFT COLUMN */}
        <div className="flex flex-col gap-4">
          <Paper elevation="elevated" className="flex flex-col gap-4 p-4">
            <Typography variant="body-1-median">Course Information</Typography>

            <div className="grid gap-2">
              <Label htmlFor="title">Title <span className="text-fractal-brand-primary">*</span></Label>
              <Input
                id="title"
                type="text"
                placeholder="e.g. Gender and Technology"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                        id="description"
                        placeholder="Describe the course..."
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

            <div className="grid gap-2">
                            <Label htmlFor="category">Semester <span className="text-fractal-brand-primary">*</span></Label>
                            <Select value={semester} onValueChange={setSemester} required>
                            <SelectTrigger id="semester">
                                <SelectValue placeholder="Select semester" />
                            </SelectTrigger>
                            <SelectContent>
                                {SEMESTERS.map((cat) => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                        </div>

            <div className="grid gap-2">
                            <Label htmlFor="status">Status <span className="text-fractal-brand-primary">*</span></Label>
                            <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger id="status">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                {STATUSES.map((s) => (
                                <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                        </div>
                        </Paper>
                    </div>

            {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-4">
          <Paper elevation="elevated" className="flex flex-col gap-4">
            <Typography variant="body-1-median">Course Schedule</Typography>

            <div className="grid gap-2">
              <Label htmlFor="start_time">Start Time <span className="text-fractal-brand-primary">*</span></Label>
              <Input
                id="start_time"
                type="datetime-local"
                required
                value={start_time}
                onChange={(e) => setStartTime(e.target.value)}
                className="bg-white text-black [color-scheme:light]"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="end_time">End Time</Label>
              <Input
                id="end_time"
                type="datetime-local"
                value={end_time}
                onChange={(e) => setEndTime(e.target.value)}
                className="bg-white text-black [color-scheme:light]"
              />
            </div>
          </Paper>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500 border border-red-200 bg-red-50 rounded-s p-3">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              onClick={() => router.push("/admin/courses")}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
                {isLoading
                    ? mode === "create" ? "Creating..." : "Saving..."
                    : mode === "create" ? "Create Course" : "Save Changes"
                }
                </Button>
     </div>
        </div>
</div>
     
    </form>
  );
}

