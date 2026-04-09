"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import { Card, Badge, Button } from "@/components/ui";
import { Pagination } from "@/components/pagination";
import { paginate, totalPages } from "@/lib/pagination.utils";

interface SearchResult {
  id: string;
  title: string;
  type: "Course" | "Event" | "User" | "Survey";
}

function SearchResultsContent({ role }: { role: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const PER_PAGE_SEARCH = 10;

  useEffect(() => {
    async function fetchAll() {
      if (!query || query.trim().length < 2) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/global-search?q=${encodeURIComponent(query)}&all=true`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
          setPage(1);
        }
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, [query]);

  const handleSelect = (r: SearchResult) => {
    if (r.type === "Course") {
      router.push(`/${role}/courses?search=${encodeURIComponent(r.title)}`);
    } else if (r.type === "Event") {
      router.push(`/${role}/events?search=${encodeURIComponent(r.title)}`);
    } else if (r.type === "User" && role === "admin") {
      router.push(`/admin/users?search=${encodeURIComponent(r.title)}`);
    } else if (r.type === "Survey") {
      router.push(`/${role}/surveys?search=${encodeURIComponent(r.title)}`);
    }
  };

  const paginatedResults = paginate(results, page, PER_PAGE_SEARCH);
  const total = totalPages(results.length, PER_PAGE_SEARCH);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="heading-md" style={{ color: "var(--primary-dark)" }}>
          Search Results for "{query}"
        </h2>
      </div>

      {loading ? (
        <Card>
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-[var(--gray)]">
            <Loader2 size={24} className="animate-spin" />
            <span className="caption">Searching across all records...</span>
          </div>
        </Card>
      ) : results.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <Search size={32} style={{ opacity: 0.2 }} />
            <p className="caption">No results found for your search.</p>
            <Button variant={"outline"} size="sm" onClick={() => router.back()}>
              Go back
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <Card>
            <div className="flex flex-col">
              {paginatedResults.map((r, i) => (
                <div
                  key={r.id + r.type + i}
                  onClick={() => handleSelect(r)}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 cursor-pointer hover:bg-[rgba(45,42,74,0.02)] transition-colors border-b border-black/[0.05] last:border-0"
                >
                  <div className="flex flex-col gap-1">
                    <span
                      className="font-medium text-[var(--primary-dark)] group-hover:underline underline-offset-2"
                      style={{ fontSize: 15 }}
                    >
                      {r.title}
                    </span>
                  </div>
                  <Badge variant={r.type === "User" ? "pink" : r.type === "Course" ? "periwinkle" : r.type === "Survey" ? "pink" : "dark"}>
                    {r.type}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {total > 0 && (
            <div className="flex items-center justify-between flex-wrap gap-3 mt-2">
              <span className="caption">
                Showing {Math.min((page - 1) * PER_PAGE_SEARCH + 1, results.length)}–{Math.min(page * PER_PAGE_SEARCH, results.length)} of {results.length} results
              </span>
              <Pagination
                page={page}
                total={total}
                onChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

import { Suspense } from "react";

export default function SearchResultsPage({ role }: { role: string }) {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 size={24} className="animate-spin text-[var(--gray)]" />
        <span className="caption">Loading...</span>
      </div>
    }>
      <SearchResultsContent role={role} />
    </Suspense>
  );
}
