import type { Profile, SortField, SortDirection } from "./profile.types";

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export const sortProfiles = (
  profile: Profile[],
  field: SortField,
  direction: SortDirection,
): Profile[] =>
  [...profile].sort((a, b) => {
    const av = (a[field] ?? "").toString().toLowerCase();
    const bv = (b[field] ?? "").toString().toLowerCase();
    return direction === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
  });

export const filterProfiles = (
  profile: Profile[],
  query: string,
): Profile[] => {
  const q = query.toLowerCase().trim();
  if (!q) return profile;
  return profile.filter(
    (p) =>
      p.full_name?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.role?.toLowerCase().includes(q),
  );
};


export { paginate, totalPages } from "@/lib/pagination.utils";
