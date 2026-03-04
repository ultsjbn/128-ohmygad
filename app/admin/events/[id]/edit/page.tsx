"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Typography } from "@snowball-tech/fractal";
import EventForm, { type EventFormData } from "@/components/admin/event-form";

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<EventFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("event")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        setError("Event not found.");
      } else {
        setEvent(data);
      }
      setIsLoading(false);
    };

    fetchEvent();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Typography variant="body-1" className="text-fractal-text-placeholder">
          Loading event...
        </Typography>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12">
        <Typography variant="body-1" className="text-red-500">
          {error ?? "Event not found."}
        </Typography>
        <button
          onClick={() => router.push("/admin/events")}
          className="underline text-sm"
        >
          Back to Events
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] w-full flex flex-col gap-6">
      <EventForm mode="edit" initialData={event} />
    </div>
  );
}