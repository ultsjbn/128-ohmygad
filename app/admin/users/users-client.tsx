"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown, UserPlus, Pencil, Trash2, ChevronUp, ChevronDown, Loader2, SlidersHorizontal } from "lucide-react";
import type { Profile, SortState } from "./profile.types";
import { sortProfiles, paginate, totalPages } from "./profile.utils";
import { PER_PAGE } from "@/lib/pagination.utils";
import { Pagination } from "@/components/pagination";
import UserForm from "@/components/admin/user-form";
import { deleteUser } from "./action";

import {
  Button,
  Badge,
  SearchBar,
  Card,
  DataTable,
  type Column,
  Dropdown,
  DropdownItem,
  DropdownDivider,
  FilterChips,
  Modal,
  Toast,
} from "@/components/ui";

interface UsersClientProps {
  initialProfiles: Profile[];
  fetchError: string | null;
}

const ROLE_VARIANT: Record<string, "pink" | "periwinkle" | "success"> = {
  admin: "success",
  faculty: "periwinkle",
  student: "pink",
};

const ROLES = ["student", "faculty", "admin"];
const GSO_STATUSES = ["attended", "pending"];

function CheckItem({
  label, active, onToggle, capitalize = false,
}: { label: string; active: boolean; onToggle: () => void; capitalize?: boolean; }) {
  return (
    <DropdownItem onClick={onToggle}>
      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 14, height: 14, borderRadius: 4, flexShrink: 0,
          border: `1.5px solid ${active ? "var(--primary-dark)" : "rgba(45,42,74,0.20)"}`,
          background: active ? "var(--primary-dark)" : "transparent",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}>
          {active && (
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M1 4l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
        <span className={capitalize ? "capitalize" : ""}>{active ? <strong>{label}</strong> : label}</span>
      </span>
    </DropdownItem>
  );
}

export const UsersClient = ({ initialProfiles, fetchError }: UsersClientProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [sort, setSort] = useState<SortState>({ field: "created_at", direction: "desc" });

  // Filters
  const [roleFilters, setRoleFilters] = useState<Set<string>>(new Set());
  const [gsoFilters, setGsoFilters] = useState<Set<string>>(new Set());
  const [activeChip, setActiveChip] = useState("All");

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Profile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // sync the URL search param to local search 
  useEffect(() => {
    const s = searchParams.get("search");
    if (s !== null) setSearch(s);
  }, [searchParams]);

  const filtered = useMemo(() => {
    let result = profiles;
    
    if (search.trim()) {
      result = result.filter((p) =>
        `${p.full_name ?? ""} ${p.email ?? ""} ${p.role ?? ""}`
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    if (roleFilters.size > 0) {
      result = result.filter((p) => roleFilters.has(p.role?.toLowerCase() ?? ""));
    }

    if (gsoFilters.size > 0) {
      result = result.filter((p) => {
        const status = p.gso_attended ? "attended" : "pending";
        return gsoFilters.has(status);
      });
    }

    return sortProfiles(result, sort.field, sort.direction);
  }, [profiles, sort, roleFilters, gsoFilters, search]);

  const paginatedProfiles = paginate(filtered, page, PER_PAGE);
  const pageCount = totalPages(filtered.length, PER_PAGE);

  // Filter toggle helpers
  function toggleRole(r: string) {
    setRoleFilters((prev) => {
      const next = new Set(prev);
      next.has(r) ? next.delete(r) : next.add(r);
      return next;
    });
    setActiveChip("All");
    setPage(1);
  }

  function toggleGso(g: string) {
    setGsoFilters((prev) => {
      const next = new Set(prev);
      next.has(g) ? next.delete(g) : next.add(g);
      return next;
    });
    setPage(1);
  }

  function clearAllFilters() {
    setRoleFilters(new Set());
    setGsoFilters(new Set());
    setActiveChip("All");
    setPage(1);
  }

  const handleChipChange = (chip: string) => {
    setActiveChip(chip);
    if (chip === "All") {
      setRoleFilters(new Set());
    } else {
      setRoleFilters(new Set([chip.toLowerCase()]));
    }
    setPage(1);
  };

  const handleSort = (field: SortState["field"]) => {
    setSort((prev) => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
    setPage(1);
  };

  const openEditModal = async (userId: string) => {
    setEditUser(null);
    setEditError(null);
    setEditLoading(true);
    setEditModalOpen(true);
    try {
      const res = await fetch(`/api/admin/get-user?id=${userId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch user");
      setEditUser(data);
    } catch (err: any) {
      setEditError(err.message || "Unknown error");
    } finally {
      setEditLoading(false);
    }
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditUser(null);
    setEditError(null);
  };

  const openDeleteModal = (profile: Profile) => {
    setDeleteTarget(profile);
    setDeleteError(null);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (isDeleting) return;
    setDeleteModalOpen(false);
    setDeleteTarget(null);
    setDeleteError(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const result = await deleteUser(deleteTarget.id);
      if (result.success) {
        setProfiles((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        router.refresh();
        closeDeleteModal();
      }
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete user.");
    } finally {
      setIsDeleting(false);
    }
  };

  function SortIcon({ field }: { field: SortState["field"] }) {
    if (sort.field !== field) return <ArrowUpDown size={12} style={{ opacity: 0.35 }} />;
    return sort.direction === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  }

  const activeFilterCount = roleFilters.size + gsoFilters.size;
  const hasActiveFilters = activeFilterCount > 0;

  const columns: Column<Profile>[] = [
    {
      key: "full_name",
      header: "User",
      width: "46%",
      render: (p) => (
        <div className="flex items-center gap-3">
          <div>
            <div className="font-semibold text-[13px] text-primary-dark">{p.full_name ?? "—"}</div>
            <div className="text-[11px] text-gray-500">{p.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      width: "16%",
      render: (p) => (
        <Badge variant={ROLE_VARIANT[p.role?.toLowerCase() ?? ""] ?? "dark"}>
          <span className="capitalize">{p.role ?? "—"}</span>
        </Badge>
      ),
    },
    {
      key: "gso_attended",
      header: "GSO",
      width: "18%",
      render: (p) => (
        <Badge variant={p.gso_attended ? "success" : "warning"}>
          {p.gso_attended ? "Attended" : "Pending"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      width: "20%",
      render: (p) => (
        <div style={{ display: "flex", justifyContent: "flex-start", gap: 4 }}>
          <Button variant="icon" title="Edit user" onClick={() => openEditModal(p.id)}>
            <Pencil size={14} />
          </Button>
          <Button
            variant="icon"
            title="Delete user"
            style={{ color: "var(--error)" }}
            onClick={() => openDeleteModal(p)}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* toolbar */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <SearchBar
            placeholder="Search by name, email or role…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            containerStyle={{ flex: 1, minWidth: 220 }}
          />

          <Dropdown
            trigger={
              <Button variant="ghost">
                <ArrowUpDown size={15} /> Sort
              </Button>
            }
          >
            {(["full_name", "email", "role"] as SortState["field"][]).map((field) => (
              <DropdownItem key={field} onClick={() => handleSort(field)}>
                <span className="flex items-center justify-between gap-6 w-full">
                  <span className="capitalize">{field === "created_at" ? "Date joined" : field.replace("_", " ")}</span>
                  <SortIcon field={field} />
                </span>
              </DropdownItem>
            ))}
            <DropdownDivider />
            <DropdownItem onClick={() => { setSort({ field: "created_at", direction: "desc" }); setPage(1); }}>
              Reset sort
            </DropdownItem>
          </Dropdown>

          <Dropdown
            trigger={
              <Button variant={hasActiveFilters ? "pink" : "ghost"}>
                <SlidersHorizontal size={15} /> Filter
                {hasActiveFilters && (
                  <span
                    className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold text-white"
                    style={{ background: "var(--primary-dark)", marginLeft: 2 }}
                  >
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            }
          >
            <div style={{ padding: "4px 12px 6px" }}>
              <p className="label" style={{ marginBottom: 4 }}>Role</p>
            </div>
            {ROLES.map((r) => (
              <CheckItem
                key={r}
                label={r}
                active={roleFilters.has(r)}
                onToggle={() => toggleRole(r)}
                capitalize
              />
            ))}

            <DropdownDivider />
            
            <div style={{ padding: "6px 12px 4px" }}>
              <p className="label" style={{ marginBottom: 4 }}>GSO Attended</p>
            </div>
            {GSO_STATUSES.map((g) => (
              <CheckItem
                key={g}
                label={g === "attended" ? "Attended" : "Pending"}
                active={gsoFilters.has(g)}
                onToggle={() => toggleGso(g)}
              />
            ))}

            <DropdownDivider />
            <DropdownItem onClick={clearAllFilters}>
              Clear all filters
            </DropdownItem>
          </Dropdown>

          <Button variant="primary" onClick={() => router.push("/admin/users/create")}>
            <UserPlus size={16} /> Add User
          </Button>
        </div>

        <FilterChips
          chips={["All", "Student", "Faculty", "Admin"]}
          defaultActive={activeChip}
          onChange={handleChipChange}
        />
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap -mt-2">
          <span className="caption">Active filters:</span>

          {[...roleFilters].map((r) => (
            <Badge key={r} variant="pink" dot>
              <span className="capitalize">{r}</span>
              <button onClick={() => { toggleRole(r); setActiveChip("All"); }} style={{ marginLeft: 6 }}>×</button>
            </Badge>
          ))}

          {[...gsoFilters].map((g) => (
            <Badge key={g} variant="warning" dot>
              <span className="capitalize">{g === "attended" ? "Attended" : "Pending"}</span>
              <button onClick={() => toggleGso(g)} style={{ marginLeft: 6 }}>×</button>
            </Badge>
          ))}

          <Button variant="soft" size="sm" onClick={clearAllFilters}>
            Clear all
          </Button>
        </div>
      )}

      {fetchError && <Toast variant="error" title="Failed to load users" message={fetchError} />}

      {/* table / empty */}
      {!fetchError && (
        filtered.length === 0 ? (
          <Card>
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <p className="caption">
                {search || hasActiveFilters ? "No users match your search or filters." : "No users found."}
              </p>
              {(search || hasActiveFilters) && (
                <Button variant="ghost" size="sm" onClick={() => { setSearch(""); clearAllFilters(); }}>
                  Clear search & filters
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <DataTable
            columns={columns}
            rows={paginatedProfiles}
            keyExtractor={(p) => p.id}
          />
        )
      )}

      {/* pagination */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between flex-wrap gap-3">
          <span className="caption">
            Showing {Math.min((page - 1) * PER_PAGE + 1, filtered.length)}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} users
          </span>
          <Pagination
            page={page}
            total={totalPages(filtered.length, PER_PAGE)}
            onChange={setPage}
          />
        </div>
      )}

      {/* edit modal */}
      <Modal
        open={editModalOpen}
        onClose={closeEditModal}
        title="Edit User"
        subtitle={editUser ? (editUser.full_name ?? editUser.email) : undefined}
      >
        {editLoading ? (
          <div className="flex items-center justify-center gap-3 py-8 text-gray-400">
            <Loader2 size={20} className="animate-spin" />
            <span className="caption">Loading user data…</span>
          </div>
        ) : editError ? (
          <div className="flex flex-col gap-4">
            <Toast variant="error" title="Failed to load user" message={editError} />
            <Button variant="ghost" className="w-full" onClick={closeEditModal}>Close</Button>
          </div>
        ) : editUser ? (
          <UserForm
            initialData={editUser}
            onSuccess={() => {
              closeEditModal();
              router.refresh();
            }}
          />
        ) : null}
      </Modal>

      {/* delete modal */}
      <Modal
        open={deleteModalOpen}
        onClose={closeDeleteModal}
        title="Delete User?"
        subtitle={deleteTarget ? (deleteTarget.full_name ?? deleteTarget.email ?? undefined) : undefined}
        footer={
          <div className="flex gap-3 w-full">
            <Button variant="ghost" style={{ flex: 1 }} disabled={isDeleting} onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button variant="primary" style={{ flex: 1, background: "var(--error)" }} disabled={isDeleting} onClick={handleDelete}>
              {isDeleting ? <><Loader2 size={14} className="animate-spin mr-2" /> Deleting…</> : <><Trash2 size={14} className="mr-2" /> Delete User</>}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-3">
          <Toast variant="warning" title="This action cannot be undone." message="The user's profile and all associated data will be permanently removed." />
          {deleteError && <Toast variant="error" title="Deletion failed" message={deleteError} />}
        </div>
      </Modal>

    </div>
  );
};