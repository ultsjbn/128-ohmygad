import { ROLE_STYLES, ROLE_STYLE_FALLBACK } from "./profile.constants";
import type { UserRole } from "@/app/admin/users/profile.types";

export function RoleBadge({ role }: { role: UserRole | null }) {
  return (
    <span
      className={`inline-flex items-center px-3 py-0.5 rounded-full capitalize ${ROLE_STYLES[role?.toLowerCase() ?? ""] ?? ROLE_STYLE_FALLBACK}`}
    >
      {role ?? "—"}
    </span>
  );
}
