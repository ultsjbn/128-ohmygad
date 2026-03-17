import React from "react";

type ProgressVariant = "gradient" | "pink" | "dark" | "periwinkle";

interface ProgressBarProps {
  value: number; // 0–100
  variant?: ProgressVariant;
  label?: string;
  sublabel?: string;
}

export function ProgressBar({ value, variant = "gradient", label, sublabel }: ProgressBarProps) {
  const fillClass =
    variant === "pink"       ? "progress-fill progress-fill-pink"
    : variant === "dark"     ? "progress-fill"
    : variant === "periwinkle" ? "progress-fill"
    : "progress-fill";

  const fillStyle: React.CSSProperties = {
    width: `${Math.min(100, Math.max(0, value))}%`,
    ...(variant === "dark"        ? { background: "var(--primary-dark)" }  : {}),
    ...(variant === "periwinkle"  ? { background: "var(--periwinkle)" }    : {}),
  };

  return (
    <div>
      {(label || sublabel) && (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          {label    && <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>}
          {sublabel && <span className="caption">{sublabel}</span>}
        </div>
      )}
      <div className="progress-track">
        <div className={fillClass} style={fillStyle} />
      </div>
    </div>
  );
}

/*
How to use this component?


*/