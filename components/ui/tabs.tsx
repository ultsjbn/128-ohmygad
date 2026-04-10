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
type Period = "D" | "W" | "M" | "Y";

interface PeriodSelectorProps {
  defaultPeriod?: Period;
  onChange?: (period: Period) => void;
}

export function PeriodSelector({ defaultPeriod = "M", onChange }: PeriodSelectorProps) {
  const [period, setPeriod] = useState<Period>(defaultPeriod);

  function handleClick(p: Period) {
    setPeriod(p);
    onChange?.(p);
  }

  return (
    <div className="period-selector">
      {(["D", "W", "M", "Y"] as Period[]).map((p) => (
        <button
          key={p}
          className={`period-btn${period === p ? " active" : ""}`}
          onClick={() => handleClick(p)}
        >
          {p}
        </button>
      ))}
    </div>
  );
}

/*
How to use this component?


*/