"use client";
import { useState } from "react";

// Badge
type BadgeVariant = "pink" | "periwinkle" | "dark" | "success" | "warning" | "error";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
  className?: string;
}

export function Badge({ children, variant = "pink", className = "" }: BadgeProps) {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {children}
    </span>
  );
}

// FilterChips
interface FilterChipsProps {
  chips: string[];
  defaultActive?: string;
  onChange?: (active: string) => void;
  /** Maps chip labels to a color variant class suffix, e.g. { Upcoming: "success", Past: "periwinkle" } */
  colorMap?: Record<string, string>;
}

export function FilterChips({ chips, defaultActive, onChange, colorMap }: FilterChipsProps) {
  const [active, setActive] = useState(defaultActive ?? chips[0]);

  function handleClick(c: string) {
    setActive(c);
    onChange?.(c);
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {chips.map((c) => {
        const colorVariant = colorMap?.[c];
        const className = ["chip", colorVariant ? `chip-${colorVariant}` : "", active === c ? "active" : ""].filter(Boolean).join(" ");
        return (
          <button key={c} className={className} onClick={() => handleClick(c)}>
            {c}
          </button>
        );
      })}
    </div>
  );
}