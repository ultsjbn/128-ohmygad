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
    if (page <= 4)         return [...all.slice(0, 9), "...", total];
    if (page >= total - 3) return [1, "...", ...all.slice(total - 5)];
    return [1, "...", page - 1, page, page + 1, "...", total];
  };

  return (
    <div className="flex items-center gap-1">

      {/* prev */}
      <Button
        variant="icon-sm"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
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
            className={`btn-page-num${page === p ? " active" : ""}`}
          >
            {p}
          </Button>
        )
      )}

      {/* next */}
      <Button
        variant="icon-sm"
        onClick={() => onChange(page + 1)}
        disabled={page === total}
        aria-label="Next page"
      >
        <ChevronRight size={14} />
      </Button>

    </div>
  );
}