/*
Reusable edit / delete action buttons for admin table rows.

Extracted from identical edit + delete icon button cells in:
app/admin/courses/page.tsx  (course row actions)
app/admin/events/page.tsx   (event row actions)

Currently used by:
app/admin/courses/page.tsx
app/admin/events/page.tsx
*/

"use client";

import { Pencil, Trash2 } from "lucide-react";

interface RowActionsProps {
  editUrl: string;
  onDelete: () => void;
  isDeleting?: boolean;
  editTitle?: string;
  deleteTitle?: string;
}

/*
icon buttons (edit + delete) design tokens.

Used in:
app/admin/courses/page.tsx  (course row edit/delete actions)
app/admin/events/page.tsx   (event row edit/delete actions)
*/
export default function RowActions({
  editUrl,
  onDelete,
  isDeleting = false,
  editTitle = "Edit",
  deleteTitle = "Delete",
}: RowActionsProps) {
  return (
    <td className="p-3">
      <div className="flex gap-2 justify-end">
        <a
          href={editUrl}
          className="p-2 hover:bg-fractal-decorative-yellow-90 border-2 border-fractal-border-default rounded-s shadow-brutal-1 transition-colors"
          title={editTitle}
        >
          <Pencil size={14} />
        </a>
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="p-2 hover:bg-fractal-decorative-yellow-90 border-2 border-fractal-border-default rounded-s shadow-brutal-1 transition-colors disabled:opacity-50"
          title={deleteTitle}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </td>
  );
}
