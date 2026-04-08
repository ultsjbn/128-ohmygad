"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Users, Calendar, UserCheck, ClipboardList, BookOpen,
} from "lucide-react";
import {
  Card, StatCard, PeriodSelector, Button, MiniCalendar, TodayTimeline,
} from "@/components/ui";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar,
} from "recharts";
import { useDashboardData } from "./hooks/use-dashboard-data";
import GlobalSearch from "@/components/global-search";

// constants ------------------------------------------------
const BRAND_COLORS = ["#B8B5E8", "#F4A7B9", "#6DC5A0", "#F4C97A", "#9B9BB4", "#2D2A4A"];
const AXIS_COLOR   = "rgba(45,42,74,0.10)";
const TICK_COLOR   = "rgba(45,42,74,0.45)";

// quick actions ------------------------------------------------
const QUICK_ACTIONS = [
  { icon: <Calendar size={16} />, label: "New Event",   href: "/admin/events/create"  },
  { icon: <Users size={16} />, label: "Create User", href: "/admin/users/create"   },
  { icon: <BookOpen size={16} />, label: "Add Course",  href: "/admin/courses/create" },
  { icon: <ClipboardList size={16} />, label: "New Survey",  href: "/admin/surveys/create" },
];

// timeline for today ------------------------------------------------
const CATEGORY_COLORS: Record<string, string> = {
  orientation: "var(--periwinkle)",
  forum:       "var(--soft-pink)",
  research:    "#9B9BB4",
  training:    "var(--success)",
  workshop:    "var(--warning)",
};

// tooltip ------------------------------------------------
interface TooltipEntry { color?: string; payload?: { fill?: string }; name?: string; dataKey?: string; value?: number | string; }
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipEntry[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur-md border border-black/[0.07] shadow-[var(--shadow-float)] rounded-xl p-3 min-w-[120px]">
      {label && (
        <p className="text-[11px] font-bold text-[var(--gray)] uppercase tracking-wider mb-1.5">{label}</p>
      )}
      {payload.map((e: TooltipEntry, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: e.color ?? e.payload?.fill }} />
          <span className="text-[13px] font-semibold text-[var(--primary-dark)] capitalize">
            {e.name ?? e.dataKey}: {e.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ------------------------------------------------ DASHBOARD PAGE ------------------------------------------------
export default function DashboardPage() {
    const router = useRouter();
    const [attendancePeriod, setAttendancePeriod] = useState<"D" | "W" | "M" | "Y">("M");

    const {
        eventAttendanceData,
        sexAtBirthData,
        genderIdentityData,
        breakdownData,
        userStats,
        gadEventsCount,
        surveysCount,
        todayEvents,
        loading,
    } = useDashboardData();

    const filteredColleges = useMemo(
        () => (breakdownData ?? []).filter((item: { category?: string }) =>
        ["CS", "CAC", "CSS"].some((c) => item.category?.toUpperCase().includes(c))
        ),
        [breakdownData],
    );
    const filteredGenders = useMemo(
        () => (genderIdentityData ?? []).filter((item: { name?: string; category?: string }) =>
        ["man", "woman", "self-describe", "non-binary", "prefer not to say", "not-specified"]
            .some((g) => (item.name ?? item.category ?? "").toLowerCase().includes(g))
        ),
        [genderIdentityData],
    );

    return (
        <div className="flex gap-5 w-full animate-in fade-in duration-500">

        {/* ------------------------------------------------ MAIN CONTENT ------------------------------------------------*/}
        <div className="flex flex-col gap-5 flex-1 min-w-0 pb-8">

            {/* KPI section + greeting ------------------------------------------------ */}
            <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                    <h2 className="heading-md">Welcome, Admin</h2>
                </div>
                <GlobalSearch role="student" placeholder="Search events, courses, surveys..." />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <StatCard
                        variant="no-hover"
                        icon={<Users size={20} className="text-[var(--periwinkle)]"/>}
                        iconBg="var(--periwinkle-light)"
                        value={userStats?.total ?? 0}
                        label="Registered Users"
                    />
                    <StatCard
                        variant="no-hover"
                        icon={<UserCheck size={20} className="text-[var(--success)]"/>}
                        iconBg="rgba(109,197,160,0.15)"
                        value={userStats?.onboarded ?? 0}
                        label="Onboarded Users"
                    />
                    <StatCard
                        variant="no-hover"
                        icon={<Calendar size={20} className="text-[var(--soft-pink)]"/>}
                        iconBg="var(--pink-light)"
                        value={gadEventsCount ?? 0}
                        label="GAD Events"
                    />
                    <StatCard
                        variant="no-hover"
                        icon={<ClipboardList size={20} className="text-[var(--warning)]"/>}
                        iconBg="rgba(244,201,122,0.18)"
                        value={surveysCount}
                        label="Active Surveys"
                    />
                </div>
            </div>

            {/* attendance and quick actions ------------------------------------------------ */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">

              {/* attendance over time */}
                <Card variant="no-hover" className="flex flex-col p-5 min-h-[320px]">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-4 shrink-0">
                    <div>
                        <h2 className="heading-md">Attendance Over Time</h2>
                        <p className="caption mt-0.5">Total event attendees per period</p>
                    </div>
                    <PeriodSelector defaultPeriod={attendancePeriod} onChange={setAttendancePeriod} />
                    </div>
                    <div className="flex-1 w-full min-h-[200px] cursor-default select-none">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={eventAttendanceData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={AXIS_COLOR} vertical={false} />
                        <XAxis
                            dataKey="month"
                            stroke={AXIS_COLOR}
                            tick={{ fill: TICK_COLOR, fontSize: 11 }}
                            tickLine={false} axisLine={false} dy={10}
                        />
                        <YAxis
                            stroke={AXIS_COLOR}
                            tick={{ fill: TICK_COLOR, fontSize: 11 }}
                            tickLine={false} axisLine={false}
                        />
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ stroke: AXIS_COLOR, strokeWidth: 1, strokeDasharray: "4 4" }}
                        />
                        <Area
                            type="linear"
                            dataKey="attendees"
                            name="Attendees"
                            stroke="#B8B5E8"
                            strokeWidth={2.5}
                            fill="var(--periwinkle-light)"
                            fillOpacity={0.55}
                            activeDot={{ r: 5, fill: "var(--periwinkle)", stroke: "white", strokeWidth: 2 }}
                            style={{ pointerEvents: "none" }}
                        />
                        </AreaChart>
                    </ResponsiveContainer>
                    </div>
                </Card>

              {/* quick actions */}
                <Card variant="no-hover" className="flex flex-col p-5">
                    <h2 className="heading-md mb-1">Quick Actions</h2>
                    <p className="caption mb-4">Jump to common tasks</p>
                    <div className="flex flex-col gap-2">
                    {QUICK_ACTIONS.map((action) => (
                        <Button
                            key={action.label}
                            variant="soft"
                            onClick={() => router.push(action.href)}
                            className="w-full justify-start"
                        >
                            {action.icon}
                            {action.label}
                        </Button>
                    ))}
                    </div>
                </Card>
            </div>

            {/* other analytics */}
            <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    {/* users per college */}
                    <Card variant="no-hover" className="flex flex-col p-5 min-h-[260px]">
                    <h2 className="heading-md mb-0.5">Users per College</h2>
                    <p className="caption mb-3">Registered student breakdown</p>
                    <div className="flex-1 w-full min-h-[170px] cursor-default select-none">
                        <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={filteredColleges} margin={{ top: 8, right: 0, left: -25, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={AXIS_COLOR} />
                            <XAxis
                            dataKey="category"
                            stroke={AXIS_COLOR}
                            tick={{ fill: TICK_COLOR, fontSize: 11 }}
                            tickLine={false} axisLine={false} dy={8}
                            />
                            <YAxis
                            stroke={AXIS_COLOR}
                            tick={{ fill: TICK_COLOR, fontSize: 11 }}
                            tickLine={false} axisLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(45,42,74,0.03)" }} />
                            <Bar dataKey="value" name="Users" radius={[6, 6, 0, 0]} barSize={36} style={{ pointerEvents: "none" }}>
                            {filteredColleges.map((_: unknown, idx: number) => (
                                <Cell key={`col-${idx}`} fill={BRAND_COLORS[idx % BRAND_COLORS.length]} />
                            ))}
                            </Bar>
                        </BarChart>
                        </ResponsiveContainer>
                    </div>
                    </Card>

                    {/* sex at birth */}
                    <Card variant="no-hover" className="flex flex-col p-5 min-h-[260px]">
                    <h2 className="heading-md mb-1">Sex at Birth</h2>
                    <div className="flex-1 w-full min-h-[190px] cursor-default select-none">
                        <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                            data={sexAtBirthData}
                            cx="50%" cy="45%"
                            innerRadius="55%" outerRadius="78%"
                            paddingAngle={2}
                            dataKey="value" nameKey="name"
                            stroke="white" strokeWidth={2}
                            style={{ pointerEvents: "none" }}
                            >
                            {sexAtBirthData?.map((_: unknown, i: number) => (
                                <Cell key={`sex-${i}`} fill={BRAND_COLORS[i % BRAND_COLORS.length]} />
                            ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                            verticalAlign="bottom" align="center" iconType="circle"
                            wrapperStyle={{ paddingTop: 14 }}
                            formatter={(v) => (
                                <span className="text-[10px] font-bold text-[var(--gray)] uppercase tracking-wider">{v}</span>
                            )}
                            />
                        </PieChart>
                        </ResponsiveContainer>
                    </div>
                    </Card>

                    {/* gender identity */}
                    <Card variant="no-hover" className="flex flex-col p-5 min-h-[260px]">
                    <h2 className="heading-md mb-1">Gender Identity</h2>
                    <div className="flex-1 w-full min-h-[190px] cursor-default select-none">
                        <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                            data={filteredGenders}
                            cx="50%" cy="45%"
                            innerRadius="55%" outerRadius="78%"
                            paddingAngle={2}
                            dataKey="value" nameKey="name"
                            stroke="white" strokeWidth={2}
                            style={{ pointerEvents: "none" }}
                            >
                            {filteredGenders.map((_: unknown, i: number) => (
                                <Cell key={`gender-${i}`} fill={BRAND_COLORS[i % BRAND_COLORS.length]} />
                            ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                            verticalAlign="bottom" align="center" iconType="circle"
                            wrapperStyle={{ paddingTop: 14 }}
                            formatter={(v) => (
                                <span className="text-[10px] font-bold text-[var(--gray)] uppercase tracking-wider">{v}</span>
                            )}
                            />
                        </PieChart>
                        </ResponsiveContainer>
                    </div>
                    </Card>

                </div>
            </div>
        </div>

        {/* right panel ------------------------------------------------------------------------------------------------ */}
        <aside className="hidden xl:flex flex-col gap-4 w-[268px] shrink-0 pb-8">
            {/* calendar */}
            <Card className="p-4">
                <MiniCalendar
                    eventDays={new Set([3, 10, 14])}   // optional — defaults to a demo set
                    onAddEvent={() => router.push("/admin/events/create")}
                    onDayClick={(date) => console.log(date)}
                />
            </Card>

            {/* timeline */}
            <Card className="p-4">
                <TodayTimeline events={todayEvents} loading={loading} />
            </Card>
        </aside>

        </div>
    );
}
