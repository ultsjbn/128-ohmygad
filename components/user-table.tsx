import { ArrowDownUp, Ellipsis } from "lucide-react";
import type { Profile, SortState } from "@/app/admin/users/profile.types";
import { TABLE_COLUMNS } from "./profile.constants";
import { UserAvatar } from "./user-avatar";
import { RoleBadge } from "./role-badge";

interface UserTableProps {
  profiles: Profile[];
  sort: SortState;
  onSort: (f: SortState["field"]) => void;
}

export function UserTable({ profiles, sort, onSort }: UserTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-fractal-border-light">
            {TABLE_COLUMNS.map((col) => (
              <th
                key={col.key}
                className="px-5 py-3 text-left text-xs font-median uppercase tracking-wide text-fractal-text-default"
              >
                <button
                  onClick={() => onSort(col.key)}
                  className="inline-flex items-center gap-1.5 hover:text-fractal-text-default transition-colors"
                >
                  {col.label}
                  <ArrowDownUp
                    size={12}
                    className={
                      sort.field === col.key
                        ? "text-fractal-text-default hover:text-fractal-text-primary"
                        : ""
                    }
                  />
                </button>
              </th>
            ))}
            <th className="px-5 py-3 text-right text-xs font-median uppercase tracking-wide text-fractal-text-default">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {profiles.map((profile, i) => (
            <tr
              key={profile.id}
              className={`border-b border-fractal-border-light last:border-0 hover:bg-fractal-decorative-purple-90 transition-colors ${i % 2 !== 0 ? "bg-fractal-bg-body-light/40" : ""}`}
            >
              {/* ---------- Avatar and Name ---------- */}
              <td className="px-5 py-2">
                <div className="flex items-center gap-3">
                  <UserAvatar name={profile.full_name} />
                  <div className="flex flex-col min-w-0">
                    <span className="font-median text-fractal-text-dark truncate">
                      {profile.full_name ?? "—"}
                    </span>
                    <span className="text-xs text-fractal-base-grey-30">
                      {profile.id.slice(0, 8)}...
                    </span>
                  </div>
                </div>
              </td>
              {/* ---------- Role Badge ---------- */}
              <td className="px-5 py-2 items-center">
                <RoleBadge role={profile.role} />
              </td>
              {/* ---------- Email ---------- */}
              <td className="px-5 py-2 text-fractal-text-default">
                {profile.email ?? "—"}
              </td>
              {/* ---------- GSOs attended ---------- */}
              <td className="px-5 py-2 text-fractal-text-default">
                {profile.gso_attended ?? "—"}
              </td>
              <td className="px-5 py-2">
                <button className="p-1.5 rounded-full text-fractal-text-light hover:bg-fractal-bg-body-light hover:text-fractal-text-default transition-colors">
                  <Ellipsis size={20} className="text-fractal-icon-primary" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
