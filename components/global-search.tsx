"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui";

interface GlobalSearchProps {
  role: "admin" | "faculty" | "student";
  placeholder?: string;
}

interface SearchResult {
  id: string;
  title: string;
  type: "Course" | "Event" | "User";
}

export default function GlobalSearch({ role, placeholder = "Search events, users, courses..." }: GlobalSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // fetch results
  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }


    async function fetchResults() {
      setLoading(true);
      try {
        const res = await fetch(`/api/global-search?q=${encodeURIComponent(debouncedQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
          setOpen(true);
        }
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, [debouncedQuery]);

  // close dropdown on click outside
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  const handleSelect = (r: SearchResult) => {
    setOpen(false);
    setQuery("");

    if (r.type === "Course") {
      router.push(`/${role}/courses?search=${encodeURIComponent(r.title)}`);
    } else if (r.type === "Event") {
      router.push(`/${role}/events?search=${encodeURIComponent(r.title)}`);
    } else if (r.type === "User" && role === "admin") {
      router.push(`/admin/users?search=${encodeURIComponent(r.title)}`);
    }
  };

  return (
    <div className="search-wrap" style={{ flex: 1, maxWidth: 360, position: "relative" }} ref={containerRef}>
      <span className="search-icon"><Search size={15} /></span>
      <input
        className="search-input"
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          if (!open && e.target.value.trim().length >= 2) setOpen(true);
        }}
        onFocus={() => { if (query.trim().length >= 2) setOpen(true); }}
      />

      {open && query.trim().length >= 2 && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          marginTop: 8,
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          border: "1px solid rgba(45,42,74,0.08)",
          zIndex: 100,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          maxHeight: 400,
        }}>
          {loading ? (
            <div style={{ padding: 16, display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", gap: 8, color: "var(--gray)", fontSize: 13 }}>
              <Loader2 size={16} className="animate-spin" /> Searching...
            </div>
          ) : results.length > 0 ? (
            <div style={{ padding: "8px 0", overflowY: "auto" }}>
              {results.map(r => (
                <div
                  key={r.id + r.type}
                  onClick={() => handleSelect(r)}
                  className="global-search-item"
                  style={{
                    padding: "10px 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    transition: "background 0.2s"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(45,42,74,0.04)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <span style={{ fontSize: 14, color: "var(--primary-dark)", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "70%" }}>
                    {r.title}
                  </span>
                  <Badge variant={r.type === "User" ? "pink" : r.type === "Course" ? "periwinkle" : "dark"}>
                    {r.type}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: 16, textAlign: "center", color: "var(--gray)", fontSize: 13 }}>
              No results found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
