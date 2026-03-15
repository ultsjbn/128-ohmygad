"use client";
import { useState } from "react";

// Badge
type BadgeVariant = "pink" | "periwinkle" | "dark" | "success" | "warning" | "error";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
}

export function Badge({ children, variant = "pink", dot = false }: BadgeProps) {
  return (
    <span className={`badge badge-${variant}`}>
      {dot && <span className="notif-dot" style={{ width: 6, height: 6 }} />}
      {children}
    </span>
  );
}

// FilterChips 
interface FilterChipsProps {
  chips: string[];
  defaultActive?: string;
  onChange?: (active: string) => void;
}

export function FilterChips({ chips, defaultActive, onChange }: FilterChipsProps) {
  const [active, setActive] = useState(defaultActive ?? chips[0]);

  function handleClick(c: string) {
    setActive(c);
    onChange?.(c);
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {chips.map((c) => (
        <button
          key={c}
          className={`chip${active === c ? " active" : ""}`}
          onClick={() => handleClick(c)}
        >
          {c}
        </button>
      ))}
    </div>
  );
}