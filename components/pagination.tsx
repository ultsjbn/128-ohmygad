import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui";

interface PaginationProps {
  page:     number;
  total:    number;
  onChange: (p: number) => void;
}

export function Pagination({ page, total, onChange }: PaginationProps) {
  const getPageNumbers = (): (number | "...")[] => {
    const all = Array.from({ length: total }, (_, i) => i + 1);
    if (total <= 7) return all;
    if (page <= 4)         return [...all.slice(0, 5), "...", total];
    if (page >= total - 3) return [1, "...", ...all.slice(total - 5)];
    return [1, "...", page - 1, page, page + 1, "...", total];
  };

  return (
    <div className="flex items-center gap-1">

      {/* prev */}
      <Button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="btn btn-icon"
        aria-label="Previous page"
        style={{ width: 32, height: 32 }}
      >
        <ChevronLeft size={14} />
      </Button>

      {/* page numbers */}
      {getPageNumbers().map((p, i) =>
        p === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className="caption"
            style={{ padding: "0 4px" }}
          >
            …
          </span>
        ) : (
          <Button
            key={p}
            onClick={() => onChange(p as number)}
            style={{
              width:      32,
              height:     32,
              borderRadius: "var(--radius-full)",
              fontSize:   13,
              fontWeight: page === p ? 700 : 500,
              cursor:     "pointer",
              transition: "var(--transition)",
              border:     page === p
                ? "1.5px solid var(--primary-dark)"
                : "1.5px solid rgba(45,42,74,0.12)",
              background: page === p
                ? "var(--primary-dark)"
                : "transparent",
              color: page === p
                ? "white"
                : "var(--primary-dark)",
              boxShadow: page === p
                ? "var(--shadow-card)"
                : "none",
            }}
          >
            {p}
          </Button>
        )
      )}

      {/* next */}
      <Button
        onClick={() => onChange(page + 1)}
        disabled={page === total}
        className="btn btn-icon"
        aria-label="Next page"
        style={{ width: 32, height: 32 }}
      >
        <ChevronRight size={14} />
      </Button>

    </div>
  );
}