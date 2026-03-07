import type { Profile, SortState } from "@/app/admin/users/profile.types";
import { UserTable } from "./user-table";
import { Pagination } from "./pagination";
import { EmptyState } from "@/components/empty-state";

export interface TableSectionProps {
  profiles: Profile[];
  filtered: Profile[];
  page: number;
  pageCount: number;
  rangeStart: number;
  rangeEnd: number;
  sort: SortState;
  fetchError: string | null;
  onSort: (field: SortState["field"]) => void;
  onPageChange: (p: number) => void;
}

export function TableSection({
  profiles,
  filtered,
  page,
  pageCount,
  rangeStart,
  rangeEnd,
  sort,
  fetchError,
  onSort,
  onPageChange,
}: TableSectionProps) {
  if (fetchError)
    return (
      <EmptyState
        type="error"
        message={`Failed to load users: ${fetchError}`}
      />
    );
  if (filtered.length === 0)
    return <EmptyState type="empty" message="No users found." />;

  return (
    <div className="flex flex-col gap-1 pt-1">
      <div className="rounded-2xl border-2 border-fractal-border-default bg-fractal-bg-body-white shadow-soft-sm overflow-hidden">
        <UserTable profiles={profiles} sort={sort} onSort={onSort} />
      </div>
      <div className="flex items-center justify-between px-1 text-sm text-fractal-base-grey-30">
        <span>
          Showing {rangeStart}–{rangeEnd} of {filtered.length} users
        </span>
        <Pagination page={page} total={pageCount} onChange={onPageChange} />
      </div>
    </div>
  );
}
