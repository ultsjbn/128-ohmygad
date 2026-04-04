"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { SlidersHorizontal, Loader2, Clock, X, ArrowUpDown, ClipboardList, ChevronRight } from "lucide-react";
import ScrollToTop from "@/components/ui/scroll-to-top";
import { Toast } from "@/components/ui";
import type { SurveyFormData } from "@/components/admin/survey-form";

import {
  SearchBar,
  Badge,
  FilterChips,
  Button,
  Card,
  Modal,
  Dropdown,
  DropdownItem,
  DropdownDivider,
} from "@/components/ui";
import { useRouter, useSearchParams } from "next/navigation";

// sort types
type SortField = "title" | "status" | "open_at" | "close_at";
type SortDirection = "asc" | "desc";

interface SortState {
  field: SortField;
  direction: SortDirection;
}

// sort options
const SORT_OPTIONS: { label: string; field: SortField }[] = [
  { label: "Title",    field: "title"    },
  { label: "Status",   field: "status"   },
  { label: "Opens At", field: "open_at"  },
  { label: "Closes",   field: "close_at" },
];

type BadgeVariant = "pink" | "periwinkle" | "dark" | "success" | "warning" | "error";
const STATUS_VARIANT: Record<string, BadgeVariant> = {
  open:   "success",
  closed: "dark",
};

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
      <span className="flex items-center gap-2">
        <span className={`w-[14px] h-[14px] rounded shrink-0 border-[1.5px] inline-flex items-center justify-center ${active ? "border-[var(--primary-dark)] bg-[var(--primary-dark)]" : "border-[rgba(45,42,74,0.20)] bg-transparent"}`}>
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

interface SurveysListPageProps {
  basePath: string; // "/student/surveys" or "/faculty/surveys"
}

export default function SurveysListPage({ basePath }: SurveysListPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [surveys, setSurveys] = useState<SurveyFormData[]>([]);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<SortState>({ field: "open_at", direction: "desc" });
  const [statusFilters, setStatusFilters] = useState<Set<string>>(new Set());
  const [activeChip, setActiveChip] = useState("All");

  // Detail modal
  const [detailSurvey, setDetailSurvey] = useState<SurveyFormData | null>(null);

  // Completion tracking
  const [respondedIds, setRespondedIds] = useState<Set<string>>(new Set());

  const [toast, setToast] = useState<{
    variant: "success" | "error" | "warning" | "info";
    title: string;
    message?: string;
  } | null>(null);

  const showToast = (t: typeof toast) => {
    setToast(t);
    setTimeout(() => setToast(null), 3500);
  };

  const statuses = Array.from(new Set(surveys.map((s) => s.status?.toLowerCase().trim()).filter(Boolean))) as string[];
  const hasActiveFilters = statusFilters.size > 0;
  const activeFilterCount = statusFilters.size;

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Check which surveys this user already responded to via response_token
        const { data: responses } = await supabase
          .from("survey_responses")
          .select("survey_id")
          .eq("response_token", user.id);

        if (responses) {
          setRespondedIds(new Set(responses.map((r) => r.survey_id as string)));
        }
      }

      const { data, error } = await supabase
        .from("survey")
        .select("id, title, description, status, event_id, open_at, close_at")
        .order("open_at", { ascending: false });

      if (error) setError(error.message);
      else if (data) setSurveys(data);
      setIsLoading(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    const s = searchParams.get("search");
    if (s !== null) setSearch(s);
  }, [searchParams]);

  // Sorting
  const sortSurveys = (items: SurveyFormData[], sortState: SortState): SurveyFormData[] => {
    const { field, direction } = sortState;
    return [...items].sort((a, b) => {
      let aVal: any = a[field as keyof SurveyFormData];
      let bVal: any = b[field as keyof SurveyFormData];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return direction === "asc" ? 1 : -1;
      if (bVal == null) return direction === "asc" ? -1 : 1;
      if (field === "open_at" || field === "close_at") { aVal = new Date(aVal).getTime(); bVal = new Date(bVal).getTime(); }
      if (typeof aVal === "string" && typeof bVal === "string") { aVal = aVal.toLowerCase(); bVal = bVal.toLowerCase(); }
      if (aVal < bVal) return direction === "asc" ? -1 : 1;
      if (aVal > bVal) return direction === "asc" ? 1 : -1;
      return 0;
    });
  };

  const handleSort = (field: SortField) =>
    setSort((prev) => ({ field, direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc" }));

  const toggleStatusFilter = (value: string) => {
    setStatusFilters((prev) => {
      const next = new Set(prev);
      next.has(value) ? next.delete(value) : next.add(value);
      return next;
    });
  };

  const clearFilters = () => { setStatusFilters(new Set()); setActiveChip("All"); };

  const handleChipChange = (chip: string) => {
    if (chip === "All" || chip === activeChip) {
      setActiveChip("All");
      setStatusFilters(new Set());
    } else {
      setActiveChip(chip);
      setStatusFilters(new Set([chip]));
    }
  };

  const handleTakeSurvey = (survey: SurveyFormData) => {
    if (survey.status === "closed") {
      showToast({ variant: "warning", title: "Survey closed", message: "This survey is no longer accepting responses." });
      return;
    }
    if (respondedIds.has(survey.id!)) {
      showToast({ variant: "info", title: "Already completed", message: "You have already submitted a response for this survey." });
      return;
    }
    router.push(`${basePath}/${survey.id}`);
  };

  const filtered = sortSurveys(
    surveys
      .filter((s) => `${s.title} ${s.description || ""}`.toLowerCase().includes(search.toLowerCase()))
      .filter((s) => statusFilters.size === 0 || statusFilters.has(s.status?.toLowerCase().trim() ?? "")),
    sort
  );

  const sortLabel = `${SORT_OPTIONS.find((o) => o.field === sort.field)?.label} ${sort.direction === "asc" ? "↑" : "↓"}`;

  const formatDate = (val?: string | null) =>
    val ? new Date(val).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }) : null;

  return (
    <div className="flex flex-col gap-4">

      {/* page header */}
      <div className="hidden md:block">
        <h1 className="heading-lg">Surveys</h1>
      </div>

      {/* search, sort, filter */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 flex-wrap overflow-visible">

          <SearchBar
            placeholder="Search surveys…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            containerStyle={{ flex: 1, minWidth: 120 }}
          />

          <div className="flex items-center gap-2 shrink-0">
            {/* Sort */}
            <Dropdown trigger={
              <Button variant="ghost">
                <ArrowUpDown size={15} />
                <span className="hidden md:inline"> {sortLabel}</span>
              </Button>
            }>
              {SORT_OPTIONS.map(({ label, field }) => {
                const isActive = sort.field === field;
                return (
                  <DropdownItem key={field} onClick={() => handleSort(field)}>
                    <span className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 border-[1.5px] ${isActive ? "bg-[var(--primary-dark)] border-[var(--primary-dark)]" : "bg-transparent border-[rgba(45,42,74,0.20)]"}`} />
                      <span>{isActive ? <strong>{label} {sort.direction === "asc" ? "↑" : "↓"}</strong> : label}</span>
                    </span>
                  </DropdownItem>
                );
              })}
              <DropdownDivider />
              <DropdownItem onClick={() => setSort({ field: "open_at", direction: "desc" })}>Reset sort</DropdownItem>
            </Dropdown>

            {/* Filter */}
            <Dropdown trigger={
              <Button variant={hasActiveFilters ? "pink" : "ghost"}>
                <SlidersHorizontal size={15} />
                <span className="hidden md:inline">Filter</span>
                {hasActiveFilters && (
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold text-white bg-[var(--primary-dark)] ml-0.5">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            }>
              {statuses.length > 0 && (
                <>
                  <div className="px-3 pt-1 pb-1.5"><p className="label mb-1">Status</p></div>
                  {statuses.map((s) => (
                    <CheckItem key={s} label={s} active={statusFilters.has(s)} onToggle={() => toggleStatusFilter(s)} capitalize />
                  ))}
                  <DropdownDivider />
                </>
              )}
              <DropdownItem onClick={clearFilters}>Clear all filters</DropdownItem>
            </Dropdown>
          </div>
        </div>

        {/* status chips */}
        {statuses.length > 0 && (
          <FilterChips
            chips={["All", ...statuses.map((s) => s.charAt(0).toUpperCase() + s.slice(1))]}
            defaultActive={activeChip}
            onChange={(chip) => handleChipChange(chip.toLowerCase())}
          />
        )}
      </div>

      {/* active filter pills */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap -mt-2">
          <span className="caption">Active filters:</span>
          {[...statusFilters].map((s) => (
            <Badge key={s} variant="warning" dot>
              <span className="capitalize">{s}</span>
              <button onClick={() => toggleStatusFilter(s)} className="ml-1.5" aria-label={`Remove ${s} filter`}>×</button>
            </Badge>
          ))}
          <Button variant="soft" size="sm" onClick={clearFilters}>Clear all</Button>
        </div>
      )}

      {/* content */}
      {isLoading ? (
        <Card>
          <div className="flex items-center justify-center gap-3 py-10 text-[var(--gray)]">
            <Loader2 size={20} className="animate-spin" />
            <span className="caption">Loading surveys…</span>
          </div>
        </Card>

      ) : error ? (
        <Card>
          <div className="flex flex-col items-center justify-center gap-3 py-10">
            <p className="caption text-[var(--error)]">Error: {error}</p>
            <Button variant="ghost" size="sm" onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </Card>

      ) : filtered.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <ClipboardList size={28} className="text-[var(--gray)]" />
            <p className="caption">
              {hasActiveFilters ? "No surveys match your filters." : search ? "No surveys match your search." : "No surveys available."}
            </p>
            {(hasActiveFilters || search) && (
              <Button variant="ghost" size="sm" onClick={() => { clearFilters(); setSearch(""); }}>
                Clear search &amp; filters
              </Button>
            )}
          </div>
        </Card>

      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((survey) => {
            const responded  = respondedIds.has(survey.id!);
            const isClosed   = survey.status === "closed";
            const isDisabled = responded || isClosed;

            return (
              <div
                key={survey.id}
                className={`relative cursor-pointer ${isDisabled ? "opacity-70" : ""}`}
                onClick={() => { setDetailSurvey(survey); }}
              >
                <Card className={`flex flex-col gap-3 h-full transition-all ${!isDisabled ? "hover:shadow-md" : "cursor-default"}`}>

                  {/* header row */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="heading-sm flex-1">{survey.title}</h3>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {responded && <Badge variant="success">Done ✓</Badge>}
                      <Badge variant={STATUS_VARIANT[survey.status ?? ""] ?? "dark"}>
                        <span className="capitalize">{survey.status}</span>
                      </Badge>
                    </div>
                  </div>

                  {/* description */}
                  {survey.description && (
                    <p className="caption text-[var(--gray)] line-clamp-2">{survey.description}</p>
                  )}

                  {/* dates */}
                  {(survey.open_at || survey.close_at) && (
                    <div className="flex items-center gap-1.5 caption text-[var(--gray)] mt-auto">
                      <Clock size={12} />
                      {survey.open_at && <span>Opens {formatDate(survey.open_at)}</span>}
                      {survey.open_at && survey.close_at && <span>·</span>}
                      {survey.close_at && <span>Closes {formatDate(survey.close_at)}</span>}
                    </div>
                  )}
                </Card>
              </div>
            );
          })}
        </div>
      )}

      {/* result count */}
      {!isLoading && !error && filtered.length > 0 && (
        <p className="caption">Showing {filtered.length} of {surveys.length} surveys</p>
      )}

      {/* detail modal */}
      <Modal
        open={!!detailSurvey}
        onClose={() => setDetailSurvey(null)}
        hideCloseButton
        modalStyle={{ maxWidth: 500, padding: 0 }}
        footer={
          detailSurvey && (
            <div className="px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:px-4 sm:pb-4 shrink-0">
              <Button
                variant={respondedIds.has(detailSurvey.id!) || detailSurvey.status === "closed" ? "ghost" : "primary"}
                className="w-full"
                disabled={respondedIds.has(detailSurvey.id!) || detailSurvey.status === "closed"}
                onClick={() => handleTakeSurvey(detailSurvey)}
              >
                {respondedIds.has(detailSurvey.id!)
                  ? "Already Completed"
                  : detailSurvey.status === "closed"
                  ? "Survey Closed"
                  : "Take Survey"}
              </Button>
            </div>
          )
        }
      >
        {detailSurvey && (
          <div className="flex flex-col min-h-0">
            {/* cover bar */}
            <div className="h-[80px] relative shrink-0 rounded-t-[var(--radius-xl)] bg-[var(--lavender)] flex items-center justify-center">
              <ClipboardList size={32} className="text-[var(--primary-dark)] opacity-40" />
              <button
                onClick={() => setDetailSurvey(null)}
                aria-label="Close"
                className="absolute top-3 right-3 w-6 h-6 rounded-full border-none cursor-pointer flex items-center justify-center text-[var(--primary-dark)] z-10 backdrop-blur-sm bg-white/80"
              >
                <X size={14} />
              </button>
              <div className="absolute bottom-3 left-3 flex gap-2">
                <Badge variant={STATUS_VARIANT[detailSurvey.status ?? ""] ?? "dark"}>
                  <span className="capitalize">{detailSurvey.status}</span>
                </Badge>
                {respondedIds.has(detailSurvey.id!) && <Badge variant="success">Completed ✓</Badge>}
              </div>
            </div>

            {/* body */}
            <div className="flex flex-col gap-3 p-3 sm:p-5 overflow-y-auto">
              <h2 className="heading-md m-0">{detailSurvey.title}</h2>

              {(detailSurvey.open_at || detailSurvey.close_at) && (
                <div className="flex items-center gap-3 caption sm:text-sm text-[var(--gray)]">
                  <Clock size={15} className="shrink-0" />
                  <span>
                    {detailSurvey.open_at && <>Opens {formatDate(detailSurvey.open_at)}</>}
                    {detailSurvey.open_at && detailSurvey.close_at && <> · </>}
                    {detailSurvey.close_at && <>Closes {formatDate(detailSurvey.close_at)}</>}
                  </span>
                </div>
              )}

              <div className="divider" />

              <div className="flex flex-col gap-2 pb-2">
                <p className="label">ABOUT THIS SURVEY</p>
                <p className="body whitespace-pre-wrap">{detailSurvey.description || "No description provided."}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {toast && (
        <div className="fixed bottom-6 right-4 z-[999] sm:right-6">
          <Toast variant={toast.variant} title={toast.title} message={toast.message} />
        </div>
      )}

      <ScrollToTop hidden={!!detailSurvey} />
    </div>
  );
}