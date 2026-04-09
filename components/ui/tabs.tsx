"use client";

import { useState } from "react";

// Tabs 
interface TabsProps {
  tabs: string[];
  defaultTab?: string;
  onChange?: (tab: string) => void;
}

export function Tabs({ tabs, defaultTab, onChange }: TabsProps) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]);

  function handleClick(t: string) {
    setActive(t);
    onChange?.(t);
  }

  return (
    <div className="tabs">
      {tabs.map((t) => (
        <button
          key={t}
          className={`tab${active === t ? " active" : ""}`}
          onClick={() => handleClick(t)}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

// PeriodSelector
export type AttendancePeriod = "M" | "S" | "Y";

const PERIOD_LABELS: Record<AttendancePeriod, string> = {
  M: "Monthly",
  S: "Semester",
  Y: "Annual",
};

interface PeriodSelectorProps {
  defaultPeriod?: AttendancePeriod;
  onChange?: (period: AttendancePeriod) => void;
}

export function PeriodSelector({ defaultPeriod = "M", onChange }: PeriodSelectorProps) {
  const [period, setPeriod] = useState<AttendancePeriod>(defaultPeriod);

  function handleClick(p: AttendancePeriod) {
    setPeriod(p);
    onChange?.(p);
  }

  return (
    <div className="period-selector">
      {(["M", "S", "Y"] as AttendancePeriod[]).map((p) => (
        <button
          key={p}
          className={`period-btn${period === p ? " active" : ""}`}
          onClick={() => handleClick(p)}
        >
          {PERIOD_LABELS[p]}
        </button>
      ))}
    </div>
  );
}

/*
How to use this component?


*/