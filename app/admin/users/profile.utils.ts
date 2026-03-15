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
    // handle nulls
    const av = a[field] ?? "";
    const bv = b[field] ?? "";

    // date sorting logic
    if (field === "created_at") {
      return direction === "asc" 
        ? new Date(av).getTime() - new Date(bv).getTime()
        : new Date(bv).getTime() - new Date(av).getTime();
    }

    // default string sorting
    const strA = av.toString().toLowerCase();
    const strB = bv.toString().toLowerCase();
    return direction === "asc" ? strA.localeCompare(strB) : strB.localeCompare(strA);
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
