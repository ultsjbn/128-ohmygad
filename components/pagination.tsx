import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  total: number;
  onChange: (p: number) => void;
}

export function Pagination({ page, total, onChange }: PaginationProps) {
  const getPageNumbers = (): (number | "...")[] => {
    const all = Array.from({ length: total }, (_, i) => i + 1);
    if (total <= 7) return all;
    if (page <= 4) return [...all.slice(0, 5), "...", total];
    if (page >= total - 3) return [1, "...", ...all.slice(total - 5)];
    return [1, "...", page - 1, page, page + 1, "...", total];
  };

  const navBtn =
    "p-1 rounded-full border-2 border-fractal-border-default hover:bg-fractal-bg-body-light transition-colors disabled:opacity-30 disabled:cursor-not-allowed";

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className={navBtn}
      >
        <ChevronLeft size={14} className="text-fractal-icon-dark" />
      </button>
      {getPageNumbers().map((p, i) =>
        p === "..." ? (
          <span key={`e-${i}`} className="px-2 text-sm text-fractal-text-light">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            className={`w-5 h-5 rounded-full text-sm font-median border-2 transition-all ${
              page === p
                ? "border-fractal-border-primary bg-fractal-brand-primary text-fractal-text-dark shadow-soft-sm"
                : "border-fractal-border-default hover:bg-fractal-bg-body-light text-fractal-text-default"
            }`}
          >
            {p}
          </button>
        ),
      )}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === total}
        className={navBtn}
      >
        <ChevronRight size={14} className="text-fractal-icon-dark" />
      </button>
    </div>
  );
}
