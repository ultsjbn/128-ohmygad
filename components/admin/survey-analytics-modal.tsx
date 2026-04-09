"use client";

/*
  fullscreen(?) modal that displays survey analytics
  im not sure if it should be like this or if analytics should be its own page

  shows survey description at the top, followed by
  per-question analytics cards:
  - multiple_choice → Horizontal Bar Chart
  - yes_no          → Donut Pie Chart
  - rating (Likert) → Stacked Bar Chart + avg / median / stddev
  - text            → Paginated response cards

  used by: app/admin/surveys/page.tsx
*/

import { useEffect, useState, useMemo } from "react";
import {
  X,
  Loader2,
  BarChart3,
  MessageSquareText,
  ChevronLeft,
  ChevronRight,
  Users,
  ClipboardList,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card, Badge } from "@/components/ui";
import type { SurveyFormData } from "@/components/admin/survey-form";
import { getSurveyAnalytics } from "@/app/admin/surveys/actions";
import {
  BRAND_COLORS,
  AXIS_COLOR,
  TICK_COLOR,
  LIKERT_LABELS,
  LIKERT_COLORS,
  CustomTooltip,
} from "./survey-analytics.constants";

interface QuestionRow {
  id: string;
  question_text: string;
  question_type: string;
  options: string[] | null;
  is_required: boolean;
  order_index: number;
}

interface ResponseRow {
  question_id: string;
  response_value: string | null;
  response_token: string;
}

interface Props {
  survey: SurveyFormData;
  open: boolean;
  onClose: () => void;
}

function mean(nums: number[]) {
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
}

function median(nums: number[]) {
  if (!nums.length) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function stddev(nums: number[]) {
  if (nums.length < 2) return 0;
  const avg = mean(nums);
  const diffs = nums.map((n) => (n - avg) ** 2);
  return Math.sqrt(diffs.reduce((a, b) => a + b, 0) / nums.length);
}

const RESPONSES_PER_PAGE = 5;

export default function SurveyAnalyticsModal({ survey, open, onClose }: Props) {
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [responses, setResponses] = useState<ResponseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // fetch questions + responses on mount / survey change
  useEffect(() => {
    if (!open || !survey.id) return;
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      const result = await getSurveyAnalytics(survey.id!);

      if (!cancelled) {
        if (result.error) {
          setError(result.error);
        } else {
          const qs = (result.questions ?? []).map((q) => ({
            ...q,
            options: Array.isArray(q.options)
              ? q.options
              : typeof q.options === "string"
                ? JSON.parse(q.options)
                : null,
          }));
          setQuestions(qs);
          setResponses(result.responses ?? []);
        }
        setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [open, survey.id]);

  // total unique respondents
  const totalRespondents = useMemo(() => {
    const tokens = new Set(responses.map((r) => r.response_token));
    return tokens.size;
  }, [responses]);

  // group responses by question id
  const responsesByQuestion = useMemo(() => {
    const map: Record<string, ResponseRow[]> = {};
    for (const r of responses) {
      (map[r.question_id] ??= []).push(r);
    }
    return map;
  }, [responses]);

  if (!open) return null;

  const formatDate = (val?: string | null) =>
    val
      ? new Date(val).toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
      : null;

  return (
    <div className="modal-backdrop" style={{ padding: 0 }} onClick={onClose}>
      <div
        className="modal modal-fullscreen"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Sticky header ── */}
        <div
          className="shrink-0 flex items-center justify-between gap-4 px-6 md:px-10 py-5 border-b border-[rgba(45,42,74,0.08)]"
          style={{ background: "var(--white)" }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <BarChart3 size={22} className="text-[var(--periwinkle)] shrink-0" />
            <div className="min-w-0">
              <h2 className="heading-md truncate">{survey.title}</h2>
              <p className="caption mt-0.5">Survey Analytics</p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* respondent count chip */}
            {!loading && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--lavender)]">
                <Users size={13} className="text-[var(--gray)]" />
                <span className="text-[12px] font-semibold text-[var(--primary-dark)]">
                  {totalRespondents} respondent{totalRespondents !== 1 ? "s" : ""}
                </span>
              </div>
            )}
            <button className="modal-close" style={{ position: "static" }} onClick={onClose}>
              <X size={14} />
            </button>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-5xl mx-auto px-4 md:px-10 py-6 flex flex-col gap-6">
            {/* loading state */}
            {loading ? (
              <div className="flex items-center justify-center gap-3 py-20">
                <Loader2 size={22} className="animate-spin text-[var(--gray)]" />
                <span className="caption">Loading analytics…</span>
              </div>
            ) : error ? (
              <Card className="border-[var(--error)] bg-red-50/50">
                <div className="flex flex-col items-center justify-center gap-3 py-12">
                  <p className="caption text-[var(--error)] font-semibold">Failed to load analytics</p>
                  <p className="text-[12px] text-[var(--error)] opacity-80">{error}</p>
                </div>
              </Card>
            ) : (
              <>
                {/* ── Survey description section ── */}
                <Card className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 border-b border-[rgba(45,42,74,0.08)] pb-3">
                    <ClipboardList size={16} className="text-[var(--periwinkle)]" />
                    <h3 className="heading-sm">About this Survey</h3>
                  </div>

                  {survey.description ? (
                    <p
                      className="body text-[var(--primary-dark)]"
                      style={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}
                    >
                      {survey.description}
                    </p>
                  ) : (
                    <p className="caption text-[var(--gray)]">No description provided.</p>
                  )}

                  {/* dates + status row */}
                  <div className="flex items-center gap-3 flex-wrap mt-1">
                    {survey.status && (
                      <Badge variant={survey.status === "open" ? "success" : "dark"}>
                        <span className="capitalize">{survey.status}</span>
                      </Badge>
                    )}
                    {survey.open_at && (
                      <span className="caption text-[var(--gray)]">
                        Opens {formatDate(survey.open_at)}
                      </span>
                    )}
                    {survey.open_at && survey.close_at && (
                      <span className="caption text-[var(--gray)]">·</span>
                    )}
                    {survey.close_at && (
                      <span className="caption text-[var(--gray)]">
                        Closes {formatDate(survey.close_at)}
                      </span>
                    )}

                    {/* respondent count (mobile) */}
                    <div className="flex sm:hidden items-center gap-1.5 ml-auto">
                      <Users size={12} className="text-[var(--gray)]" />
                      <span className="caption font-semibold">
                        {totalRespondents} respondent{totalRespondents !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </Card>

                {/* ── No responses ── */}
                {totalRespondents === 0 ? (
                  <Card>
                    <div className="flex flex-col items-center justify-center gap-3 py-12">
                      <BarChart3 size={28} className="text-[var(--gray)]" />
                      <p className="caption">No responses have been submitted yet.</p>
                    </div>
                  </Card>
                ) : (
                  <>
                    {/* ── Per-question cards ── */}
                    {questions.map((q, idx) => (
                      <QuestionCard
                        key={q.id}
                        question={q}
                        index={idx}
                        responses={responsesByQuestion[q.id] ?? []}
                        totalRespondents={totalRespondents}
                      />
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/*
Per-Question Card — renders chart by question type
*/
function QuestionCard({
  question,
  index,
  responses,
  totalRespondents,
}: {
  question: QuestionRow;
  index: number;
  responses: ResponseRow[];
  totalRespondents: number;
}) {
  const type = question.question_type;

  const typeLabel =
    type === "multiple_choice"
      ? "Multiple Choice"
      : type === "rating"
        ? "Likert Scale (1–5)"
        : type === "yes_no"
          ? "Yes / No"
          : "Open-ended Text";

  return (
    <Card className="flex flex-col gap-4">
      {/* question header */}
      <div className="flex items-start justify-between gap-3 border-b border-[rgba(45,42,74,0.08)] pb-3">
        <div className="min-w-0">
          <p className="label text-[var(--gray)] mb-1">
            Question {index + 1} · {typeLabel}
          </p>
          <h3 className="heading-sm">{question.question_text}</h3>
        </div>
        <Badge variant="periwinkle">
          {responses.length} response{responses.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {/* chart area */}
      {responses.length === 0 ? (
        <p className="caption text-[var(--gray)] py-4 text-center">
          No responses for this question.
        </p>
      ) : type === "multiple_choice" ? (
        <MultipleChoiceChart question={question} responses={responses} />
      ) : type === "yes_no" ? (
        <YesNoChart responses={responses} />
      ) : type === "rating" ? (
        <LikertChart responses={responses} />
      ) : (
        <TextResponses responses={responses} />
      )}
    </Card>
  );
}

/*
Multiple Choice → Horizontal Bar Chart
*/
function MultipleChoiceChart({
  question,
  responses,
}: {
  question: QuestionRow;
  responses: ResponseRow[];
}) {
  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    // initialize with defined options
    if (question.options) {
      for (const opt of question.options) counts[opt] = 0;
    }
    for (const r of responses) {
      if (r.response_value) {
        counts[r.response_value] = (counts[r.response_value] ?? 0) + 1;
      }
    }
    return Object.entries(counts)
      .map(([name, value]) => ({
        name,
        value,
        pct: responses.length ? Math.round((value / responses.length) * 100) : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [question.options, responses]);

  return (
    <div className="w-full min-h-[200px] cursor-default select-none" style={{ height: Math.max(200, data.length * 48) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 40, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={AXIS_COLOR} horizontal={false} />
          <XAxis
            type="number"
            stroke={AXIS_COLOR}
            tick={{ fill: TICK_COLOR, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <YAxis
            dataKey="name"
            type="category"
            stroke={AXIS_COLOR}
            tick={{ fill: TICK_COLOR, fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={120}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(45,42,74,0.03)" }} />
          <Bar dataKey="value" name="Responses" radius={[0, 6, 6, 0]} barSize={28} style={{ pointerEvents: "none" }}>
            {data.map((_, idx) => (
              <Cell key={`mc-${idx}`} fill={BRAND_COLORS[idx % BRAND_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/*
Yes / No → Donut Pie Chart
*/
function YesNoChart({ responses }: { responses: ResponseRow[] }) {
  const data = useMemo(() => {
    let yes = 0;
    let no = 0;
    for (const r of responses) {
      if (r.response_value?.toLowerCase() === "yes") yes++;
      else if (r.response_value?.toLowerCase() === "no") no++;
    }
    return [
      { name: "Yes", value: yes },
      { name: "No", value: no },
    ].filter((d) => d.value > 0);
  }, [responses]);

  const YES_NO_COLORS = ["#6DC5A0", "#F47B7B"];

  return (
    <div className="w-full min-h-[260px] cursor-default select-none">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius="55%"
            outerRadius="78%"
            paddingAngle={3}
            dataKey="value"
            nameKey="name"
            stroke="white"
            strokeWidth={2}
            style={{ pointerEvents: "none" }}
          >
            {data.map((_, i) => (
              <Cell key={`yn-${i}`} fill={YES_NO_COLORS[i % YES_NO_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            wrapperStyle={{ paddingTop: 14 }}
            formatter={(v) => (
              <span className="text-[10px] font-bold text-[var(--gray)] uppercase tracking-wider">
                {v as string}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

/*
Likert Scale → Stacked Horizontal Bar + Statistics
*/
function LikertChart({ responses }: { responses: ResponseRow[] }) {
  const { chartData, stats } = useMemo(() => {
    const counts = [0, 0, 0, 0, 0]; // index 0→rating 1, etc.
    const nums: number[] = [];

    for (const r of responses) {
      const v = parseInt(r.response_value ?? "", 10);
      if (v >= 1 && v <= 5) {
        counts[v - 1]++;
        nums.push(v);
      }
    }

    const total = nums.length || 1;
    const row: Record<string, string | number> = { name: "Responses" };
    for (let i = 0; i < 5; i++) {
      row[`r${i + 1}`] = counts[i];
    }


    return {
      chartData: [row],
      stats: {
        avg: mean(nums),
        med: median(nums),
        sd: stddev(nums),
        counts,
        total: nums.length,
      },
    };
  }, [responses]);

  return (
    <div className="flex flex-col gap-5">
      {/* stacked bar */}
      <div className="w-full min-h-[80px] cursor-default select-none">
        <ResponsiveContainer width="100%" height={80}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
            barCategoryGap={0}
          >
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" hide />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            {[1, 2, 3, 4, 5].map((n) => (
              <Bar
                key={n}
                dataKey={`r${n}`}
                name={LIKERT_LABELS[n - 1]}
                stackId="stack"
                fill={LIKERT_COLORS[n - 1]}
                radius={
                  n === 1
                    ? [6, 0, 0, 6]
                    : n === 5
                      ? [0, 6, 6, 0]
                      : [0, 0, 0, 0]
                }
                style={{ pointerEvents: "none" }}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* legend */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {LIKERT_LABELS.map((label, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: LIKERT_COLORS[i] }}
            />
            <span className="text-[11px] text-[var(--gray)] font-medium">
              {label} ({stats.counts[i]})
            </span>
          </div>
        ))}
      </div>

      {/* statistics row */}
      <div className="grid grid-cols-3 gap-3">
        <StatBox label="Average" value={stats.avg.toFixed(2)} />
        <StatBox label="Median" value={stats.med.toFixed(1)} />
        <StatBox label="Std Dev" value={stats.sd.toFixed(2)} />
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-[var(--radius-md)] bg-[var(--lavender)]">
      <span className="text-[11px] font-bold text-[var(--gray)] uppercase tracking-wider">
        {label}
      </span>
      <span className="text-lg font-bold text-[var(--primary-dark)]">{value}</span>
    </div>
  );
}

/*
Text (Open-ended) → Paginated List
*/
function TextResponses({ responses }: { responses: ResponseRow[] }) {
  const [page, setPage] = useState(1);

  const nonEmpty = useMemo(
    () => responses.filter((r) => r.response_value && r.response_value.trim() !== ""),
    [responses],
  );

  const totalPages = Math.max(1, Math.ceil(nonEmpty.length / RESPONSES_PER_PAGE));
  const pageItems = nonEmpty.slice(
    (page - 1) * RESPONSES_PER_PAGE,
    page * RESPONSES_PER_PAGE,
  );

  if (nonEmpty.length === 0) {
    return (
      <p className="caption text-[var(--gray)] py-4 text-center">
        No text responses submitted.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">

      {/* response cards */}
      {pageItems.map((r, i) => (
        <TextResponseItem key={`${r.response_token}-${i}`} text={r.response_value || ""} />
      ))}

      {/* pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-1">
          <span className="caption text-[var(--gray)]">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              className="btn btn-icon"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              style={{ opacity: page <= 1 ? 0.35 : 1 }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              className="btn btn-icon"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              style={{ opacity: page >= totalPages ? 0.35 : 1 }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// function for displaying the full text responses for any text response more than 20(?) words
function TextResponseItem({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const words = text.trim().split(/\s+/);
  const isLong = words.length > 20;

  const displayText = !isLong || expanded ? text : words.slice(0, 20).join(" ") + "...";

  return (
    <div
      className={`px-4 py-3 rounded-[var(--radius-md)] bg-[var(--lavender)] border border-[rgba(45,42,74,0.06)] ${isLong ? "cursor-pointer transition-colors hover:bg-[rgba(45,42,74,0.04)]" : ""}`}
      onClick={() => {
        if (isLong) setExpanded(!expanded);
      }}
    >
      <p
        className="body text-[var(--primary-dark)]"
        style={{ whiteSpace: "pre-wrap", lineHeight: 1.7, fontStyle: "italic" }}
      >
        &ldquo;{displayText}&rdquo;
      </p>
      {isLong && (
        <p className="text-[12px] text-[var(--periwinkle)] mt-1.5 font-medium hover:underline w-fit">
          {expanded ? "Show less" : "Read more"}
        </p>
      )}
    </div>
  );
}
