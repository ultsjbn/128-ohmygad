"use client";

import { ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/button";

type SortField = "title" | "start_time" | "end_time" | "semester" | "status";
type SortDirection = "asc" | "desc";

interface Props {
  field: SortField;
  direction: SortDirection;
  onChange: (field: SortField) => void;
}

const options: { label: string; field: SortField }[] = [
  { label: "Title", field: "title" },
  { label: "Start Time", field: "start_time" },
  { label: "End Time", field: "end_time" },
  { label: "Semester", field: "semester" },
  { label: "Status", field: "status" },
];

export default function CourseSort({ field, direction, onChange }: Props) {
  return (
    <div className="flex gap-2">

      {options.map((o) => (
        <Button
          key={o.field}
          variant="display"
          label={o.label}
          icon={
            field === o.field
              ? direction === "asc"
                ? <ChevronUp size={16} />
                : <ChevronDown size={16} />
              : <ArrowUpDown size={16} />
          }
          onClick={() => onChange(o.field)}
        />
      ))}

    </div>
  );
}