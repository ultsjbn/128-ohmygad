"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown, UserPlus, Pencil, Trash2, ChevronUp, ChevronDown, Loader2 } from "lucide-react";
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
  Tabs,
  Modal,
  Toast,
} from "@/components/ui";

type TabKey = "all" | "admin" | "faculty" | "student";

interface UsersClientProps {
  initialProfiles: Profile[];
  fetchError: string | null;
}

const ROLE_VARIANT: Record<string, "pink" | "periwinkle" | "dark"> = {
  admin: "dark",
  faculty: "periwinkle",
  student: "pink",
};

const TABS = ["all", "student", "faculty", "admin"];
const TAB_LABELS: Record<string, string> = {
  all: "All Users",
  student: "Students",
  faculty: "Faculty",
  admin: "Admin",
};

export const UsersClient = ({ initialProfiles, fetchError }: UsersClientProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [sort, setSort] = useState<SortState>({ field: "created_at", direction: "desc" });

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
    if (activeTab !== "all") result = result.filter((p) => p.role?.toLowerCase() === activeTab);
    if (search.trim()) {
      result = result.filter((p) =>
        `${p.full_name ?? ""} ${p.email ?? ""} ${p.role ?? ""}`
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }
    return sortProfiles(result, sort.field, sort.direction);
  }, [profiles, sort, activeTab, search]);

  const paginatedProfiles = paginate(filtered, page, PER_PAGE);
  const pageCount = totalPages(filtered.length, PER_PAGE);

  const handleTabChange = (tab: string) => { setActiveTab(tab as TabKey); setPage(1); };

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

  const columns: Column<Profile>[] = [
    {
      key: "full_name",
      header: "User",
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
      render: (p) => (
        <Badge variant={ROLE_VARIANT[p.role?.toLowerCase() ?? ""] ?? "dark"}>
          <span className="capitalize">{p.role ?? "—"}</span>
        </Badge>
      ),
    },
    {
      key: "gso_attended",
      header: "GSO",
      render: (p) => (
        <Badge variant={p.gso_attended ? "success" : "warning"}>
          {p.gso_attended ? "Attended" : "Pending"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (p) => (
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 4 }}>
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

      {/* page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap mt-1">
        <div>
          <h1 className="heading-lg">Users Management</h1>
          <p className="caption mt-1">{profiles.length} total users</p>
        </div>
        <Button variant="primary" onClick={() => router.push("/admin/users/create")}>
          <UserPlus size={16} /> Add User
        </Button>
      </div>

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
            {(["full_name", "email", "role", "created_at"] as SortState["field"][]).map((field) => (
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
        </div>

        <Tabs
          tabs={TABS.map((t) => TAB_LABELS[t])}
          defaultTab={TAB_LABELS[activeTab]}
          onChange={(label) => handleTabChange(TABS.find((t) => TAB_LABELS[t] === label) ?? "all")}
        />
      </div>

      {fetchError && <Toast variant="error" title="Failed to load users" message={fetchError} />}

      {/* table / empty */}
      {!fetchError && (
        filtered.length === 0 ? (
          <Card>
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <p className="caption">
                {search ? "No users match your search." : "No users found."}
              </p>
              {search && (
                <Button variant="ghost" size="sm" onClick={() => setSearch("")}>
                  Clear search
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