"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";

// helpers ----------------------------------------------------------------------------------------------------------------------
const MONTHS_LONG  = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DOW          = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function daysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function firstDOW  (y: number, m: number) { return new Date(y, m, 1).getDay(); }
function dateToISO (d: Date)  { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
function parseISO  (s: string){ return new Date(s + "T00:00:00"); }
function cmp(a: Date, b: Date){ return a.getTime() - b.getTime(); }

function formatDisplay(from: string, to: string) {
  const f = parseISO(from);
  const t = parseISO(to);
  const sameYear = f.getFullYear() === t.getFullYear();
  const fStr = `${MONTHS_SHORT[f.getMonth()]} ${f.getDate()}${sameYear ? "" : `, ${f.getFullYear()}`}`;
  const tStr = `${MONTHS_SHORT[t.getMonth()]} ${t.getDate()}, ${t.getFullYear()}`;
  return `${fStr} – ${tStr}`;
}

// presets -----------------------------------------------------------------------------------
function buildPresets() {
  const today = new Date();
  const T = dateToISO(today);

  const d7  = new Date(today); d7.setDate(d7.getDate() - 7);
  const d30 = new Date(today); d30.setDate(d30.getDate() - 29);

  // day 0 of next month = last day of current month (works for 28/29/30/31)
  const msStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const msEnd   = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const lmStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lmEnd   = new Date(today.getFullYear(), today.getMonth(), 0);

  const mo = today.getMonth();
  let semStart: Date, semEnd: Date;
  if (mo >= 7) {
    semStart = new Date(today.getFullYear(), 7, 1);             // Aug 1
    semEnd   = new Date(today.getFullYear(), 12, 0);            // Dec 31
  } else {
    semStart = new Date(today.getFullYear(), 0, 1);             // Jan 1
    semEnd   = new Date(today.getFullYear(), 5, 0);             // May 31
  }

  const yrStart = new Date(today.getFullYear(), 0, 1);
  const yrEnd   = new Date(today.getFullYear(), 12, 0);         // Dec 31
  const l12     = new Date(today); l12.setFullYear(l12.getFullYear() - 1); l12.setDate(l12.getDate() + 1);

  return [
    { label: "Last 7 days",    from: dateToISO(d7),      to: T },
    { label: "Last 30 days",   from: dateToISO(d30),     to: T },
    { label: "This month",     from: dateToISO(msStart), to: dateToISO(msEnd) },
    { label: "Last month",     from: dateToISO(lmStart), to: dateToISO(lmEnd) },
    { label: "This semester",  from: dateToISO(semStart),to: dateToISO(semEnd) },
    { label: "This year",      from: dateToISO(yrStart), to: dateToISO(yrEnd) },
    { label: "Last 12 months", from: dateToISO(l12),     to: T },
  ];
}

// types -----------------------------------------------------------------------------------
export interface DateRange { from: string; to: string; }

export interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange) => void;
  placeholder?: string;
}

// component -----------------------------------------------------------------------------------
export function DateRangePicker({ value, onChange, placeholder = "Select date range" }: DateRangePickerProps) {
  const [open, setOpen]           = useState(false);
  const [stage, setStage]         = useState<"from" | "to">("from");
  const [pendingFrom, setPending]  = useState<string | null>(null);
  const [hovered, setHovered]     = useState<string | null>(null);
  const [calYear, setCalYear]     = useState(() => {
    if (value?.from) return parseISO(value.from).getFullYear();
    return new Date().getFullYear();
  });
  const [calMonth, setCalMonth]   = useState(() => {
    if (value?.from) return parseISO(value.from).getMonth();
    return new Date().getMonth();
  });

  const rootRef = useRef<HTMLDivElement>(null);
  // stable after mount — avoids SSR/client date mismatch
  const [presets, setPresets] = useState<ReturnType<typeof buildPresets>>([]);
  const todayISO = useMemo(() => (typeof window === "undefined" ? "" : dateToISO(new Date())), []);
  useEffect(() => { setPresets(buildPresets()); }, []);

  // close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        resetPicking();
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function resetPicking() {
    setStage("from");
    setPending(null);
    setHovered(null);
  }

  function openPicker() {
    if (open) { setOpen(false); resetPicking(); return; }
    resetPicking();
    if (value?.from) {
      const d = parseISO(value.from);
      setCalYear(d.getFullYear());
      setCalMonth(d.getMonth());
    }
    setOpen(true);
  }

  function applyPreset(from: string, to: string) {
    onChange?.({ from, to });
    setOpen(false);
    resetPicking();
  }

  function prevMonth() {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
  }
  function nextMonth() {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
  }

  function pickDay(day: number) {
    const dateStr = dateToISO(new Date(calYear, calMonth, day));
    if (stage === "from") {
      setPending(dateStr);
      setStage("to");
    } else {
      const a = pendingFrom!, b = dateStr;
      const from = a <= b ? a : b;
      const to   = a <= b ? b : a;
      onChange?.({ from, to });
      setOpen(false);
      resetPicking();
    }
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange?.({ from: "", to: "" });
  }

  // derive display range (preview while picking "to")
  const displayFrom = stage === "to" ? pendingFrom  : (value?.from || null);
  const displayTo   = stage === "to" ? hovered       : (value?.to   || null);

  // calendar grid
  const totalDays = daysInMonth(calYear, calMonth);
  const cells: (number | null)[] = [
    ...Array(firstDOW(calYear, calMonth)).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  function cellClass(day: number | null): string {
    if (!day) return "drp-day empty";
    const d    = new Date(calYear, calMonth, day);
    const dStr = dateToISO(d);
    const today = todayISO;

    const isFrom    = displayFrom === dStr;
    const isTo      = displayTo   === dStr;
    const inRange   = displayFrom && displayTo
      ? cmp(d, parseISO(displayFrom)) > 0 && cmp(d, parseISO(displayTo)) < 0
      : false;
    const isToday   = dStr === today;

    return [
      "drp-day",
      isFrom ? "edge start" : "",
      isTo   ? "edge end"   : "",
      inRange               ? "in-range" : "",
      isToday && !isFrom && !isTo ? "today" : "",
    ].filter(Boolean).join(" ");
  }

  const hasValue = value?.from && value?.to;

  return (
    <div className="drp-root" ref={rootRef}>
      {/* trigger div to avoid nested */}
      <div
        role="button"
        tabIndex={0}
        className={`drp-trigger${open ? " open" : ""}`}
        onClick={openPicker}
        onKeyDown={(e) => e.key === "Enter" && openPicker()}
      >
        <Calendar size={14} className="drp-icon" />
        <span className={`drp-label${!hasValue ? " ph" : ""}`}>
          {hasValue ? formatDisplay(value!.from, value!.to) : placeholder}
        </span>
        {hasValue && (
          <button type="button" className="drp-clear" onClick={clear}>
            <X size={11} />
          </button>
        )}
      </div>

      {/* popover */}
      {open && (
        <div className="drp-popover">

          {/* presets sidebar */}
          <div className="drp-presets">
            {presets.map((p) => {
              const active = value?.from === p.from && value?.to === p.to;
              return (
                <button
                  key={p.label}
                  type="button"
                  className={`drp-preset${active ? " active" : ""}`}
                  onClick={() => applyPreset(p.from, p.to)}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* divider */}
          <div className="drp-divider" />

          {/* calendar */}
          <div className="drp-cal">
            {/* hint */}
            <p className="drp-hint">
              {stage === "from" ? "Select start date" : "Select end date"}
            </p>

            {/* nav */}
            <div className="drp-cal-nav">
              <button type="button" className="drp-nav-btn" onClick={prevMonth}>
                <ChevronLeft size={14} />
              </button>
              <span className="drp-nav-label">{MONTHS_LONG[calMonth]} {calYear}</span>
              <button type="button" className="drp-nav-btn" onClick={nextMonth}>
                <ChevronRight size={14} />
              </button>
            </div>

            {/* day-of-week headers */}
            <div className="drp-dow-row">
              {DOW.map(d => <span key={d} className="drp-dow">{d}</span>)}
            </div>

            {/* grid */}
            <div className="drp-grid">
              {cells.map((day, i) => (
                <button
                  key={i}
                  type="button"
                  disabled={!day}
                  className={cellClass(day)}
                  onClick={() => day && pickDay(day)}
                  onMouseEnter={() => {
                    if (day && stage === "to") setHovered(dateToISO(new Date(calYear, calMonth, day)));
                  }}
                  onMouseLeave={() => stage === "to" && setHovered(null)}
                >
                  {day ?? ""}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
