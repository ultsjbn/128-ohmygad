import { Typography } from "@snowball-tech/fractal";
import EventForm from "@/components/admin/event-form";

export default function CreateEventPage() {
  return (
    <div className="max-w-[1400px] w-full flex flex-col gap-6">
      <EventForm mode="create" />
    </div>
  );
}