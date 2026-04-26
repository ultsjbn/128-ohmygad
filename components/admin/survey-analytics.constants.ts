/*
  this is for the survey analytics for peace of mind 
  extracted from app/admin/page.tsx
  used in components/admin/survey-analytics-modal.tsx
*/

import React from "react";

/*
  Color palettes, axis styling, likert labels, likert colors, and tooltip
*/
export const BRAND_COLORS = [
  "#B8B5E8", "#F4A7B9", "#6DC5A0", "#F4C97A", "#9B9BB4", "#2D2A4A",
];
export const AXIS_COLOR = "rgba(45,42,74,0.10)";
export const TICK_COLOR = "rgba(45,42,74,0.45)";

export const LIKERT_LABELS = [
  "Strongly Disagree",
  "Disagree",
  "Neutral",
  "Agree",
  "Strongly Agree",
];

export const LIKERT_COLORS = [
  "#F47B7B", // 1 – Strongly Disagree
  "#F4A7B9", // 2 – Disagree
  "#F4C97A", // 3 – Neutral
  "#9BD4B5", // 4 – Agree
  "#6DC5A0", // 5 – Strongly Agree
];

interface TooltipEntry {
  color?: string;
  payload?: { fill?: string };
  name?: string;
  dataKey?: string;
  value?: number | string;
}

export function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return React.createElement(
    "div", {
    className:
      "bg-white/95 backdrop-blur-md border border-black/[0.07] shadow-[var(--shadow-float)] rounded-xl p-3 min-w-[120px]",
  },
    label
      ? React.createElement(
        "p",
        {
          className:
            "text-[11px] font-bold text-[var(--gray)] uppercase tracking-wider mb-1.5",
        },
        label,
      )
      : null,
    payload.map((e: TooltipEntry, i: number) =>
      React.createElement(
        "div",
        { key: i, className: "flex items-center gap-2" },
        React.createElement("span", {
          className: "w-4 h-4 rounded-full shrink-0",
          style: { background: e.color ?? e.payload?.fill },
        }), // this prolly sucks
        React.createElement(
          "span",
          {
            className:
              "text-[13px] font-semibold text-[var(--primary-dark)] capitalize",
          },
          `${e.name ?? e.dataKey}: ${e.value}`,
        ),
      ),
    ),
  );
}
