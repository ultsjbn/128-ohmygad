"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader, Paper } from "@snowball-tech/fractal";
import { Plus, ArrowUpDown, SlidersHorizontal } from "lucide-react";
import type { SurveyFormData } from "@/components/admin/survey-form";
import { Button } from "@/components/button";
import { Typography } from "@/components/typography";
import { Pagination } from "@/components/pagination";
import { paginate, totalPages, PER_PAGE } from "@/lib/pagination.utils";
import DetailModal from "@/components/detail-modal";
import ListToolbar from "@/components/list-toolbar";
import RowActions from "@/components/row-actions";
import { SearchBar } from "@/components/ui";

const STATUSES = ["All", "open", "closed"];
const SORT_OPTIONS = ["Newest", "Oldest"];

export default function SurveysPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [surveys, setSurveys] = useState<SurveyFormData[]>([]);
  const [filtered, setFiltered] = useState<SurveyFormData[]>([]);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [modalContent, setModalContent] = useState<{ label: string; text: string } | null>(null);
  const [sortOrder, setSortOrder] = useState("Newest");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);

  const getSurveys = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("survey")
      .select("id, title, description, status, open_at, close_at")
      .order("open_at", { ascending: false });

    if (!error && data) {
      const normalized = data.map((s) => ({ ...s, status: s.status ?? "" }));
      setSurveys(normalized);
      setFiltered(normalized);
    }
    setIsLoading(false);
  };

  useEffect(() => { getSurveys(); }, []);

  // sync the URL search param to the local search state
  useEffect(() => {
    const s = searchParams.get("search");
    if (s !== null) setSearch(s);
  }, [searchParams]);

  useEffect(() => {
    const q = search.toLowerCase();
    let result = surveys;

    result = result.filter((s) =>
      `${s.title} ${s.status || ""}`.toLowerCase().includes(q)
    );

    if (statusFilter !== "All") {
      result = result.filter((s) => s.status === statusFilter);
    }

    result = result.sort((a, b) => {
      const dateA = new Date(a.open_at ?? "").getTime();
      const dateB = new Date(b.open_at ?? "").getTime();
      return sortOrder === "Newest" ? dateB - dateA : dateA - dateB;
    });

    setFiltered(result);
    setPage(1);
  }, [search, surveys, sortOrder, statusFilter]);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    const supabase = createClient();
    const { error } = await supabase.from("survey").delete().eq("id", id);
    if (error) alert("Failed to delete: " + error.message);
    else setSurveys((prev) => prev.filter((s) => s.id !== id));
    setDeletingId(null);
  };

  const formatDate = (val?: string | null) =>
    val ? new Date(val).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }) : "—";

  return (
    <div className="mx-auto min-h-full flex flex-col gap-6">

      <div className="flex flex-col gap-1">
        <Typography variant="heading-2" className="tracking-tighter leading-none font-median">
          Survey Management
        </Typography>
      </div>

      <ListToolbar
        searchPlaceholder="Search by title or status..."
        searchValue={search}
        onSearchChange={(_e: unknown, value: string) => setSearch(value)}
      >
        {/* Sort */}
        <div className="relative">
          <Button
            label="Sort"
            variant="display"
            icon={<ArrowUpDown size={18} />}
            iconPosition="left"
            onClick={() => { setShowSortMenu((p) => !p); setShowFilterMenu(false); }}
            className="whitespace-nowrap"
          />
          {showSortMenu && (
            <div className="absolute right-0 top-full mt-1 z-10 bg-white border-2 border-fractal-border-default rounded-s shadow-brutal-2 min-w-[140px]">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => { setSortOrder(opt); setShowSortMenu(false); }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-fractal-base-grey-90 transition-colors ${sortOrder === opt ? "font-median bg-fractal-decorative-yellow-90" : ""
                    }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter */}
        <div className="relative">
          <Button
            label="Filter"
            variant="display"
            icon={<SlidersHorizontal size={18} />}
            iconPosition="left"
            onClick={() => { setShowFilterMenu((p) => !p); setShowSortMenu(false); }}
            className="whitespace-nowrap"
          />
          {showFilterMenu && (
            <div className="absolute right-0 top-full mt-1 z-10 bg-white border-2 border-fractal-border-default rounded-s shadow-brutal-2 min-w-[160px] p-3 flex flex-col gap-1">
              <Typography variant="body-2" className="font-median text-fractal-text-placeholder mb-1">
                Status
              </Typography>
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`text-left px-3 py-1.5 text-sm rounded-s capitalize hover:bg-fractal-base-grey-90 transition-colors ${statusFilter === s ? "font-median bg-fractal-decorative-yellow-90 border border-fractal-border-default" : ""
                    }`}
                >
                  {s}
                </button>
              ))}
              <button
                onClick={() => { setStatusFilter("All"); setShowFilterMenu(false); }}
                className="text-xs text-fractal-text-placeholder underline text-left mt-1 hover:text-fractal-text-default transition-colors"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        <Button
          label="Add Survey"
          variant="primary-dark"
          icon={<Plus size={18} />}
          iconPosition="left"
          onClick={() => router.push("/admin/surveys/create")}
          className="whitespace-nowrap"
        />
      </ListToolbar>

      {/* Active filter chip */}
      {
        statusFilter !== "All" && (
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <Typography variant="body-2" className="text-fractal-text-placeholder">Filters:</Typography>
            <span className="px-2 py-0.5 text-xs font-median border-2 border-fractal-border-default rounded-s bg-fractal-decorative-yellow-90 shadow-brutal-1 capitalize flex items-center gap-1">
              {statusFilter}
              <button onClick={() => setStatusFilter("All")} className="ml-1 hover:text-red-500">×</button>
            </span>
          </div>
        )
      }

      <Paper elevation="elevated" className="overflow-auto p-0">
        {isLoading ? (
          <div className="p-8 text-center"><Loader size="xl" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <Typography variant="body-1" className="text-fractal-text-placeholder">
              {search ? "No surveys match your search." : "No surveys yet. Create one to get started."}
            </Typography>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b-2 border-fractal-border-default bg-fractal-base-grey-90 sticky top-0">
              <tr>
                <th className="text-left p-3 font-median">Title</th>
                <th className="text-left p-3 font-median">Status</th>
                <th className="text-left p-3 font-median">Opens</th>
                <th className="text-left p-3 font-median">Closes</th>
                <th className="text-right p-3 font-median">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginate(filtered, page, PER_PAGE).map((survey, i) => (
                <tr
                  key={survey.id}
                  className={`border-b border-fractal-border-default hover:bg-fractal-base-grey-90 transition-colors ${i % 2 === 0 ? "bg-fractal-bg-body-white" : "bg-fractal-bg-body-default"
                    }`}
                >
                  <td
                    className="p-3 font-median max-w-[260px] truncate cursor-pointer hover:underline"
                    onClick={() => setModalContent({ label: survey.title, text: survey.description ?? "—" })}
                    title="Click to view description"
                  >
                    {survey.title}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-s text-xs font-median capitalize border border-fractal-border-default ${survey.status === "open"
                      ? "bg-fractal-decorative-yellow-50"
                      : survey.status === "closed"
                        ? "bg-red-100 text-red-700"
                        : "bg-fractal-base-grey-90"
                      }`}>
                      {survey.status || "—"}
                    </span>
                  </td>
                  <td className="p-3 text-fractal-text-placeholder whitespace-nowrap">
                    {formatDate(survey.open_at)}
                  </td>
                  <td className="p-3 text-fractal-text-placeholder whitespace-nowrap">
                    {formatDate(survey.close_at)}
                  </td>
                  <RowActions
                    editUrl={`/admin/surveys/${survey.id}/edit`}
                    onDelete={() => handleDelete(survey.id!, survey.title)}
                    isDeleting={deletingId === survey.id}
                    editTitle="Edit survey"
                    deleteTitle="Delete survey"
                  />
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Paper>

      {
        !isLoading && filtered.length > 0 && (
          <div className="flex items-center justify-between px-1 text-sm text-fractal-base-grey-30">
            <span>
              Showing {Math.min((page - 1) * PER_PAGE + 1, filtered.length)}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} surveys
            </span>
            <Pagination page={page} total={totalPages(filtered.length, PER_PAGE)} onChange={setPage} />
          </div>
        )
      }

      {
        modalContent && (
          <DetailModal
            label={modalContent.label}
            text={modalContent.text}
            onClose={() => setModalContent(null)}
          />
        )
      }
    </div >
  );
}