"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitFormData } from "@/lib/form-submit.utils";
import { MapPin, Users, AlignLeft, Type } from "lucide-react";
import { Card, Input, Select, Button, DateTimePicker } from "@/components/ui"; 

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

const CATEGORY_OPTIONS = [
  { value: "Orientation", label: "Orientation" },
  { value: "Forum", label: "Forum" },
  { value: "Research", label: "Research" },
  { value: "Training", label: "Training" },
  { value: "Workshop", label: "Workshop" },
];

// const STATUS_OPTIONS = [
//   { value: "upcoming", label: "Upcoming" },
//   { value: "past", label: "Past" },
// ];

export default function EventForm({ initialData, mode }: EventFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [location, setLocation] = useState(initialData?.location ?? "");
  
  // removed the slice(0,16) because datetimepicker handles full iso strings
  const [start_date, setStartDate] = useState(initialData?.start_date ?? "");
  const [end_date, setEndDate] = useState(initialData?.end_date ?? "");
  const [capacity, setCapacity] = useState<number | "">(initialData?.capacity ?? "");
  const [registration_open, setRegistrationOpen] = useState(initialData?.registration_open ?? "");
  const [registration_close, setRegistrationClose] = useState(initialData?.registration_close ?? "");
  const [category, setCategory] = useState(initialData?.category ?? "");
  const [status, setStatus] = useState(initialData?.status ?? "");

  // submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

    const result = await submitFormData("event", payload, mode, initialData?.id);

    if (result.success) {
      router.push("/admin/events");
      router.refresh();
    } else {
      setError(result.error || "An error occurred");
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full lg:h-auto w-full min-h-0 relative">
      
      {/* scrollable wrapper for mobile, fully expanded on desktop */}
      <div className="flex-1 overflow-y-auto lg:overflow-visible custom-scrollbar pr-1 lg:pr-0 pb-4 lg:pb-0 min-h-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* left column: basic information */}
          <div className="flex flex-col gap-6">
            <Card className="flex flex-col gap-4 p-3 h-full">
              <div className="border-b border-[rgba(45,42,74,0.08)] pb-3 mb-1">
                <h3 className="heading-md">Basic Information</h3>
              </div>

              <Input
                label="Title *"
                placeholder="e.g. Gender Sensitivity Orientation"
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
                    placeholder="Describe the event..."
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input pl-[42px] py-3 resize-y"
                  />
                </div>
              </div>

              <Input
                label="Location *"
                placeholder="e.g. Sarmiento Hall"
                required
                prefixIcon={<MapPin size={15} />}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label="Capacity *"
                  type="number"
                  min={1}
                  placeholder="e.g. 30"
                  required
                  prefixIcon={<Users size={15} />}
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value === "" ? "" : Number(e.target.value))}
                />

                <Select 
                  label="Category *"
                  required
                  options={[{ value: "", label: "Select category" }, ...CATEGORY_OPTIONS]}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>

            </Card>
          </div>

          {/* right column: event schedule & actions */}
          <div className="flex flex-col gap-6">
            <Card className="flex flex-col gap-4 p-6">
              <div className="border-b border-[rgba(45,42,74,0.08)] pb-3 mb-1">
                <h3 className="heading-md">Event Schedule</h3>
              </div>

              <DateTimePicker
                label="Start Date & Time"
                mode="datetime"
                required
                value={start_date}
                onChange={setStartDate}
              />

              <DateTimePicker
                label="End Date & Time"
                mode="datetime"
                value={end_date}
                onChange={setEndDate}
              />

              <DateTimePicker
                label="Registration Opens"
                mode="datetime"
                required
                value={registration_open}
                onChange={setRegistrationOpen}
              />

              <DateTimePicker
                label="Registration Closes"
                mode="datetime"
                required
                value={registration_close}
                onChange={setRegistrationClose}
              />
            </Card>

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
          onClick={() => router.push("/admin/events")}
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
            : mode === "create" ? "Create Event" : "Save Changes"
          }
        </Button>
      </div>
      
    </form>
  );
}