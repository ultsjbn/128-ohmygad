"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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

export type EventFormData = {
  id?: string;
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  capacity: number;
  registration_open: string;
  registration_close: string;
  category: string;
  status: string;
};

type EventFormProps = {
  initialData?: EventFormData;
  mode: "create" | "edit";
};

const CATEGORIES = ["Orientation", "Forum", "Research", "Training", "Workshop"];
const STATUSES = ["upcoming", "past"];

export default function EventForm({ initialData, mode }: EventFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [location, setLocation] = useState(initialData?.location ?? "");
  const [start_date, setStartDate] = useState(initialData?.start_date?.slice(0, 16) ?? "");
  const [end_date, setEndDate] = useState(initialData?.end_date?.slice(0, 16) ?? "");
  const [capacity, setCapacity] = useState<number | "">(initialData?.capacity ?? "");
  const [registration_open, setRegistrationOpen] = useState(initialData?.registration_open?.slice(0, 16) ?? "");
  const [registration_close, setRegistrationClose] = useState(initialData?.registration_close?.slice(0, 16) ?? "");
  const [category, setCategory] = useState(initialData?.category ?? "");
  const [status, setStatus] = useState(initialData?.status ?? "draft");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    const payload = {
      title,
      description,
      location,
      start_date,
      end_date,
      capacity: capacity === "" ? null : Number(capacity),
      registration_open,
      registration_close,
      category,
      status,
      updated_at: new Date().toISOString(),
    };

    console.log("Payload being sent:", payload);

    try {
      if (mode === "create") {
        const { error } = await supabase.from("event").insert(payload);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("event")
          .update(payload)
          .eq("id", initialData!.id);
        if (error) throw error;
      }
      router.push("/admin/events");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-4">
          <Paper elevation="elevated" className="flex flex-col gap-4 p-4">
            <Typography variant="body-1-median">Basic Information</Typography>

            <div className="grid gap-2">
              <Label htmlFor="title">Title <span className="text-fractal-brand-primary">*</span></Label>
              <Input
                id="title"
                type="text"
                placeholder="e.g. Gender Sensitivity Orientation"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                placeholder="Describe the event..."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">Location <span className="text-fractal-brand-primary">*</span></Label>
              <Input
                id="location"
                type="text"
                placeholder="e.g. Malcolm Hall, Room 101"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="capacity">Capacity <span className="text-fractal-brand-primary">*</span></Label>
              <Input
                id="capacity"
                type="number"
                min={1}
                placeholder="e.g. 30"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value === "" ? "" : Number(e.target.value))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category <span className="text-fractal-brand-primary">*</span></Label>
              <Select onValueChange={setCategory} defaultValue={category} required>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status <span className="text-fractal-brand-primary">*</span></Label>
              <Select onValueChange={setStatus} defaultValue={status}>
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
            <Typography variant="body-1-median">Event Schedule</Typography>

            <div className="grid gap-2">
              <Label htmlFor="start_date">Start Date & Time <span className="text-fractal-brand-primary">*</span></Label>
              <Input
                id="start_date"
                type="datetime-local"
                required
                value={start_date}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="end_date">End Date & Time</Label>
              <Input
                id="end_date"
                type="datetime-local"
                value={end_date}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="registration_open">Registration Opens <span className="text-fractal-brand-primary">*</span></Label>
              <Input
                id="registration_open"
                type="datetime-local"
                required
                value={registration_open}
                onChange={(e) => setRegistrationOpen(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="registration_close">Registration Closes <span className="text-fractal-brand-primary">*</span></Label>
              <Input
                id="registration_close"
                type="datetime-local"
                required
                value={registration_close}
                onChange={(e) => setRegistrationClose(e.target.value)}
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
              onClick={() => router.push("/admin/events")}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? mode === "create" ? "Creating..." : "Saving..."
                : mode === "create" ? "Create Event" : "Save Changes"
              }
            </Button>
          </div>
        </div>

      </div>
    </form>
  );
}