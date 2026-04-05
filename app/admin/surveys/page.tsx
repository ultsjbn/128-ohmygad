"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Plus, ArrowUpDown, SlidersHorizontal, Pencil, Trash2, Loader2 } from "lucide-react";
import type { SurveyFormData } from "@/components/admin/survey-form";
import { paginate, totalPages, PER_PAGE } from "@/lib/pagination.utils";
import { Pagination } from "@/components/pagination";

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
  Modal,
} from "@/components/ui";

// constants
const STATUSES = ["open", "closed"];
const SORT_OPTIONS = ["Newest", "Oldest"] as const;

// variant helpers
type BadgeVariant = "pink" | "periwinkle" | "dark" | "success" | "warning" | "error";

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  open: "success",
  closed: "dark",
};

// checkbox item
function CheckItem({
  label,
  active,
  onToggle,
  capitalize = false,
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
  capitalize?: boolean;
}) {
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
              <path d="M1 4l2 2 4-4" stroke="white" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
        <span className={capitalize ? "capitalize" : ""}>
          {active ? <strong>{label}</strong> : label}
        </span>
      </span>
    </DropdownItem>
  );
}

export default function SurveysPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [surveys, setSurveys] = useState<SurveyFormData[]>([]);
  const [filtered, setFiltered] = useState<SurveyFormData[]>([]);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [modalContent, setModalContent] = useState<{ label: string; text: string } | null>(null);
  const [sortOrder, setSortOrder] = useState<"Newest" | "Oldest">("Newest");
  const [statusFilters, setStatusFilters] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);

  // for the delete confirmation modal
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  // Fetch
  const getSurveys = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("survey")
      .select("id, title, description, status, event_id, open_at, close_at")
      .order("open_at", { ascending: false });

    if (!error && data) {
      const normalized = data.map((s) => ({ ...s, status: s.status ?? "" }));
      setSurveys(normalized);
      setFiltered(normalized);
    }
    setIsLoading(false);
  };

  useEffect(() => { getSurveys(); }, []);

  // sync URL search param
  useEffect(() => {
    const s = searchParams.get("search");
    if (s !== null) setSearch(s);
  }, [searchParams]);

  // filter / sort
  useEffect(() => {
    const q = search.toLowerCase();
    let result = surveys;

    result = result.filter((s) =>
      `${s.title} ${s.status || ""}`.toLowerCase().includes(q)
    );

    if (statusFilters.size > 0)
      result = result.filter((s) => statusFilters.has(s.status ?? ""));

    result = result.sort((a, b) => {
      const da = new Date(a.open_at ?? "").getTime();
      const db = new Date(b.open_at ?? "").getTime();
      return sortOrder === "Newest" ? db - da : da - db;
    });

    setFiltered(result);
    setPage(1);
  }, [search, surveys, sortOrder, statusFilters]);

  // toggle helpers
  function toggleStatus(s: string) {
    setStatusFilters((prev) => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });
  }

  function clearAllFilters() {
    setStatusFilters(new Set());
  }

  // delete execution logic triggered by the modal
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    
    setDeletingId(deleteTarget.id);
    const supabase = createClient();
    
    const { error } = await supabase.from("survey").delete().eq("id", deleteTarget.id);
    
    if (error) {
      alert("Failed to delete survey: " + error.message);
    } else {
      setSurveys((prev) => prev.filter((e) => e.id !== deleteTarget.id));
    }
    
    setDeletingId(null);
    setDeleteTarget(null);
  };

  const formatDate = (val?: string | null) =>
    val ? new Date(val).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }) : "—";

  const activeFilterCount = statusFilters.size;
  const hasActiveFilters = activeFilterCount > 0;

  // DataTable columns
  const columns: Column<SurveyFormData>[] = [
    {
      key: "title",
      header: "Title",
      width: "40%",
      render: (survey) => (
        <button
          className="text-left font-semibold hover:underline underline-offset-4 max-w-[240px] truncate block"
          style={{ color: "var(--primary-dark)", fontSize: 13 }}
          onClick={() => setModalContent({ label: survey.title, text: survey.description ?? "No description provided." })}
          title="Click to view description"
        >
          {survey.title}
        </button>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "15%",
      render: (survey) => (
        <Badge variant={STATUS_VARIANT[survey.status ?? ""] ?? "dark"}>
          <span className="capitalize">{survey.status || "—"}</span>
        </Badge>
      ),
    },
    {
      key: "open_at",
      header: "Opens",
      width: "16%",
      render: (survey) => (
        <span className="caption whitespace-nowrap">{formatDate(survey.open_at)}</span>
      ),
    },
    {
      key: "close_at",
      header: "Closes",
      width: "16%",
      render: (survey) => (
        <span className="caption whitespace-nowrap">{formatDate(survey.close_at)}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      width: "13%",
      render: (survey) => (
        <div style={{ display: "flex", justifyContent: "flex-start", gap: 4 }}>
          <Button
            variant="icon"
            title="Edit survey"
            onClick={() => router.push(`/admin/surveys/${survey.id}/edit`)}
          >
            <Pencil size={14} />
          </Button>
          <Button
            variant="icon"
            title="Delete survey"
            disabled={deletingId === survey.id}
            style={deletingId === survey.id ? { opacity: 0.5 } : { color: "var(--error)" }}
            onClick={() => setDeleteTarget({ id: survey.id!, title: survey.title })}
          >
            {deletingId === survey.id
              ? <Loader2 size={14} className="animate-spin" />
              : <Trash2 size={14} />}
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
            placeholder="Search by title or status…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            containerStyle={{ flex: 1, minWidth: 220 }}
          />

          {/* sort */}
          <Dropdown
            trigger={
              <Button variant="ghost">
                <ArrowUpDown size={15} /> {sortOrder}
              </Button>
            }
          >
            {SORT_OPTIONS.map((opt) => (
              <DropdownItem key={opt} onClick={() => setSortOrder(opt)}>
                {sortOrder === opt ? <strong>{opt}</strong> : opt}
              </DropdownItem>
            ))}
          </Dropdown>

          {/* filter */}
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
              <p className="label" style={{ marginBottom: 4 }}>Status</p>
            </div>
            {STATUSES.map((s) => (
              <CheckItem
                key={s}
                label={s}
                active={statusFilters.has(s)}
                onToggle={() => toggleStatus(s)}
                capitalize
              />
            ))}
            <DropdownDivider />
            <DropdownItem onClick={clearAllFilters}>Clear all filters</DropdownItem>
          </Dropdown>

            <Button variant="primary" onClick={() => router.push("/admin/surveys/create")}>
                <Plus size={16} /> Add Survey
            </Button>
        </div>
      </div>

      {/* active filter pills */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap -mt-2">
          <span className="caption">Active filters:</span>
          {[...statusFilters].map((s) => (
            <Badge key={s} variant="warning" dot>
              <span className="capitalize">{s}</span>
              <button
                onClick={() => toggleStatus(s)}
                aria-label={`Remove ${s} filter`}
                style={{ marginLeft: 6 }}
              >×</button>
            </Badge>
          ))}
          <Button variant="soft" size="sm" onClick={clearAllFilters}>
            Clear all
          </Button>
        </div>
      )}

      {/* table / empty / loading */}
      {isLoading ? (
        <Card>
          <div className="flex items-center justify-center gap-3 py-10" style={{ color: "var(--gray)" }}>
            <Loader2 size={20} className="animate-spin" />
            <span className="caption">Loading surveys…</span>
          </div>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <p className="caption">
              {search || hasActiveFilters
                ? "No surveys match your search or filters."
                : "No surveys yet. Add your first survey to get started."}
            </p>
            {(search || hasActiveFilters) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setSearch(""); clearAllFilters(); }}
              >
                Clear search &amp; filters
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <DataTable
          columns={columns}
          rows={paginate(filtered, page, PER_PAGE)}
          keyExtractor={(survey) => survey.id!}
        />
      )}

      {/* pagination */}
      {!isLoading && filtered.length > 0 && (
        <div className="flex items-center justify-between flex-wrap gap-3">
          <span className="caption">
            Showing {Math.min((page - 1) * PER_PAGE + 1, filtered.length)}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} surveys
          </span>
          <Pagination
            page={page}
            total={totalPages(filtered.length, PER_PAGE)}
            onChange={setPage}
          />
        </div>
      )}

      {/* detail modal */}
      <Modal
        open={!!modalContent}
        onClose={() => setModalContent(null)}
        title={modalContent?.label}
      >
        <p style={{ fontSize: 14, lineHeight: 1.8, color: "var(--primary-dark)", whiteSpace: "pre-wrap" }}>
          {modalContent?.text || "No description provided."}
        </p>
      </Modal>

      {/* confirm delete modal */}
        <Modal
            open={!!deleteTarget}
            onClose={() => !deletingId && setDeleteTarget(null)}
            title="Delete Survey?"
            subtitle="This action cannot be undone."
            footer={
            <div className="flex gap-3 w-full">
                <Button variant="ghost" className="flex-1" onClick={() => setDeleteTarget(null)} disabled={!!deletingId}>
                Cancel
                </Button>
                <Button variant="primary" className="flex-1 !bg-[var(--error)]" onClick={confirmDelete} disabled={!!deletingId}>
                {deletingId ? "Deleting..." : "Yes, Delete"}
                </Button>
            </div>
            }
        >
            {deleteTarget && (
            <div className="p-4 rounded-xl bg-[var(--pink-light)] border border-[rgba(244,123,123,0.2)]">
                <p className="text-sm text-[var(--error)] font-bold mb-1">Warning</p>
                <p className="text-sm text-[var(--primary-dark)]">You are about to delete: <strong className="break-words">{deleteTarget.title}</strong></p>
            </div>
            )}
        </Modal>

    </div>
  );
}