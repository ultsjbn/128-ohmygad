"use client";

import { Clock } from "lucide-react";

export interface TimelineEvent {
  time: string;
  title: string;
  location?: string;
  category: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  orientation: "var(--periwinkle)",
  forum:       "var(--soft-pink)",
  research:    "#9B9BB4",
  training:    "var(--success)",
  workshop:    "var(--warning)",
};

function categoryColor(cat: string) {
  return CATEGORY_COLORS[cat.toLowerCase()] ?? "var(--periwinkle)";
}

interface TodayTimelineProps {
  events: TimelineEvent[];
  loading?: boolean;
}

export function TodayTimeline({ events, loading }: TodayTimelineProps) {
  const todayLabel = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col gap-3">
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[13px] font-bold text-[var(--primary-dark)]">{todayLabel}</p>
          <p className="text-[10px] text-[var(--gray)]">Today&apos;s timeline</p>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-[var(--periwinkle-light)] text-[var(--periwinkle)] text-[10px] font-bold">
          {loading ? "…" : events.length}
        </span>
      </div>

      {/* loading skeleton */}
      {loading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-2.5 animate-pulse">
              <span className="w-[34px] h-[28px] rounded bg-black/[0.06] shrink-0" />
              <div className="flex-1 h-[42px] rounded-[8px] bg-black/[0.06]" />
              <span className="w-[3px] self-stretch rounded-full bg-black/[0.06] shrink-0" />
            </div>
          ))}
        </div>

      /* empty state */
      ) : events.length === 0 ? (
        <p className="text-[11px] text-[var(--gray)] text-center py-4">
          No events scheduled today
        </p>

      /* event list */
      ) : (
        <div className="flex flex-col gap-2">
          {events.map((item, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="text-[10px] font-semibold text-[var(--gray)] w-[34px] shrink-0 pt-[3px]">
                {item.time}
              </span>
              <div className="flex-1 min-w-0 rounded-[8px] border border-black/[0.06] bg-white/60 px-2.5 py-2">
                <p className="text-[11px] font-semibold text-[var(--primary-dark)] truncate">
                  {item.title}
                </p>
                {item.location && (
                  <p className="text-[10px] text-[var(--gray)] flex items-center gap-1 mt-0.5">
                    <Clock size={9} className="shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </p>
                )}
              </div>
              <span
                className="w-[3px] self-stretch rounded-full shrink-0 mt-0.5"
                style={{ background: categoryColor(item.category) }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}