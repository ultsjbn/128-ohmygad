/*
Reusable toolbar layout for admin list pages.

Search input on the left and action buttons (sort / filter / primary action) 
on the right.

Extracted from the repeated flex wrapper structure in:
app/admin/courses/page.tsx  (course management toolbar)
app/admin/events/page.tsx   (events management toolbar)
app/admin/users/users-client.tsx (users management toolbar)

Currently used by:
app/admin/courses/page.tsx
app/admin/events/page.tsx
app/admin/users/users-client.tsx
*/

"use client";

import { Search } from "lucide-react";
import { InputText } from "@snowball-tech/fractal";

interface ListToolbarProps {

  searchPlaceholder: string;
  /* Current search value (controlled). */
  searchValue: string;

  /* Called when the search input changes. */
  onSearchChange: (...args: any[]) => void;

  /* Sort dropdown, filter dropdown, and primary action button. */
  children?: React.ReactNode;
}

/*
A flex toolbar that places a full-width search input on the left and
arbitrary action buttons (passed as `children`) on the right.

Used in:
app/admin/courses/page.tsx  (search + sort + filter + "Add Course")
app/admin/events/page.tsx   (search + sort + filter + "Add Event")
app/admin/users/users-client.tsx  (search + sort + filter + "Add User")
*/
export default function ListToolbar({
  searchPlaceholder,
  searchValue,
  onSearchChange,
  children,
}: ListToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <InputText
        placeholder={searchPlaceholder}
        fullWidth
        maxLength={64}
        prefix={<Search size={18} />}
        onChange={onSearchChange}
        value={searchValue}
      />
      <div className="flex items-center gap-2 shrink-0 relative">
        {children}
      </div>
    </div>
  );
}
