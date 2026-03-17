"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, StatCard, Button } from "@/components/ui";
import { 
  Users, CalendarCheck, UserCheck, 
  UserPlus, CalendarPlus, BookOpen, ClipboardList 
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { eventAttendanceData, TOOLTIP_STYLE } from "./dashboard.constants";

import { useDashboardData } from "./hooks/use-dashboard-data";

const BRAND_COLORS = [
  "#B8B5E8", // periwinkle
  "#F4A7B9", // soft-pink
  "#6DC5A0", // success (green)
  "#F4C97A", // warning (yellow)
  "#9B9BB4", // gray
  "#2D2A4A", // primary-dark
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md border border-[rgba(45,42,74,0.08)] shadow-float rounded-xl p-3 min-w-[120px] animate-in fade-in zoom-in-95 duration-200">
        {label && <p className="text-[11px] font-bold text-[var(--gray)] uppercase tracking-wider mb-1.5">{label}</p>}
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <span 
              className="w-2.5 h-2.5 rounded-full shrink-0" 
              style={{ backgroundColor: entry.color || entry.payload.fill }} 
            />
            <span className="text-[13px] font-semibold text-[var(--primary-dark)] capitalize">
              {entry.name || entry.dataKey}: {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const router = useRouter();
  const {
    eventAttendanceData,
    sexAtBirthData,
    genderIdentityData,
    breakdownData,
    userStats,
    gadEventsCount,
  } = useDashboardData();

  // ----- data filter -----
  const validColleges = ["CS", "CAC", "CSS"];
  const filteredColleges = breakdownData?.filter((item: any) => 
    validColleges.some((c) => item.category?.toUpperCase().includes(c))
  ) || [];

  const validGenders = ["man", "woman", "self-describe", "non-binary", "prefer not to say", "not-specified"];
  const filteredGenders = genderIdentityData?.filter((item: any) => {
    const itemName = (item.name || item.category || "").toLowerCase();
    return validGenders.some((vg) => itemName.includes(vg));
  }) || [];
  // ---------------------------------

  const softAxisColor = "rgba(45,42,74,0.12)";
  const tickColor = "rgba(45,42,74,0.5)";

  return (
    <div className="w-full flex flex-col gap-6 lg:gap-8 animate-in fade-in duration-500 pb-8">

      {/* header section */}
      <div className="flex flex-col animate-in slide-in-from-bottom-2 duration-500">
        <p className="body text-[var(--gray)] font-medium">Welcome back,</p>
        <h1 className="heading-xl mt-1">Admin Dashboard</h1>
      </div>

      {/* TOP ROW: Quick Actions (1/4) | Attendance (3/4) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 mt-2">
        
        {/* 1. Quick Actions Panel (1/4 width) */}
        <Card className="lg:col-span-1 flex flex-col p-5 lg:p-6 min-h-[350px]">
          <h2 className="heading-md mb-6 shrink-0">Quick Actions</h2>
          <div className="flex flex-col gap-3 flex-1 justify-center">
            <Button variant="soft" onClick={() => router.push('/admin/users/create')} className="w-full justify-start py-5 shadow-soft hover:-translate-y-1 transition-transform">
              <UserPlus size={18} className="mr-3 shrink-0" /> Create User
            </Button>
            <Button variant="soft" onClick={() => router.push('/admin/events/create')} className="w-full justify-start py-5 shadow-soft hover:-translate-y-1 transition-transform">
              <CalendarPlus size={18} className="mr-3 shrink-0" /> New Event
            </Button>
            <Button variant="soft" onClick={() => router.push('/admin/courses/create')} className="w-full justify-start py-5 shadow-soft hover:-translate-y-1 transition-transform text-white">
              <BookOpen size={18} className="mr-3 shrink-0" /> Add Course
            </Button>
            <Button variant="soft" onClick={() => router.push('/admin/surveys/create')} className="w-full justify-start py-5 bg-white border border-[rgba(45,42,74,0.08)] shadow-soft hover:-translate-y-1 transition-transform">
              <ClipboardList size={18} className="mr-3 shrink-0 text-[var(--primary-dark)]" /> New Survey
            </Button>
          </div>
        </Card>

        {/* 2. Attendance Over Time (3/4 width) */}
        <Card className="lg:col-span-3 flex flex-col p-5 lg:p-6 min-h-[350px]">
          <h2 className="heading-md mb-6 shrink-0">Attendance Over Time</h2>
          <div className="flex-1 w-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={eventAttendanceData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={softAxisColor} vertical={false} />
                <XAxis dataKey="month" stroke={softAxisColor} tick={{ fill: tickColor, fontSize: 11 }} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke={softAxisColor} tick={{ fill: tickColor, fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: softAxisColor, strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area type="monotone" dataKey="attendees" name="Attendees" stroke="#B8B5E8" strokeWidth={3} fill="var(--periwinkle-light)" fillOpacity={0.6} activeDot={{ r: 6, fill: "var(--periwinkle)", stroke: "white", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>

      {/* SECONDARY ROW: College | Sex at Birth | Gender Identity (1/1/1 split) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        
        {/* 1. Users per College (Filtered) */}
        <Card className="flex flex-col p-5 lg:p-6 min-h-[320px]">
          <h2 className="heading-md mb-6 shrink-0">Users per College</h2>
          <div className="flex-1 w-full min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredColleges} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={softAxisColor} />
                <XAxis dataKey="category" stroke={softAxisColor} tick={{ fill: tickColor, fontSize: 11 }} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke={softAxisColor} tick={{ fill: tickColor, fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(45,42,74,0.03)' }} />
                <Bar dataKey="value" name="Users" stroke="transparent" radius={[4, 4, 0, 0]} barSize={38}>
                  {filteredColleges.map((entry: any, idx: number) => (
                    <Cell key={`cell-col-${idx}`} fill={BRAND_COLORS[idx % BRAND_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* 2. Sex at birth donut */}
        <Card className="flex flex-col p-5 lg:p-6 min-h-[320px]">
          <h2 className="heading-md mb-2 shrink-0">Sex at Birth</h2>
          <div className="flex-1 w-full min-h-[220px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sexAtBirthData}
                  cx="50%"
                  cy="45%"
                  innerRadius="55%"
                  outerRadius="80%"
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  stroke="white" 
                  strokeWidth={2}
                >
                  {sexAtBirthData?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={BRAND_COLORS[index % BRAND_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  wrapperStyle={{ paddingTop: '20px'}}
                  formatter={(value) => <span className="text-[11px] font-bold text-[var(--gray)] uppercase tracking-wider">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* 3. Gender identity donut (Filtered) */}
        <Card className="flex flex-col p-5 lg:p-6 min-h-[320px]">
          <h2 className="heading-md mb-2 shrink-0">Gender Identity</h2>
          <div className="flex-1 w-full min-h-[220px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={filteredGenders}
                  cx="50%"
                  cy="45%"
                  innerRadius="55%"
                  outerRadius="80%"
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  stroke="white"
                  strokeWidth={2}
                >
                  {filteredGenders.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={BRAND_COLORS[index % BRAND_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  wrapperStyle={{ paddingTop: '20px'}}
                  formatter={(value) => <span className="text-[11px] font-bold text-[var(--gray)] uppercase tracking-wider">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>

      <div className="w-full h-[1px] bg-[rgba(45,42,74,0.08)] my-2" />

      {/* KPI ROW: Anchored at the bottom */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-bold tracking-widest uppercase text-[var(--gray)]">Primary Metrics</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          <StatCard
            icon={<Users size={20} className="text-[var(--periwinkle)]" />}
            iconBg="var(--periwinkle-light)"
            value={userStats?.total || 0}
            label="Total Registered Users"
          />
          <StatCard
            icon={<UserCheck size={20} className="text-[var(--success)]" />}
            iconBg="rgba(109, 197, 160, 0.15)"
            value={userStats?.onboarded || 0}
            label="Fully Onboarded Users"
          />
          <StatCard
            icon={<CalendarCheck size={20} className="text-[var(--soft-pink)]" />}
            iconBg="var(--pink-light)"
            value={gadEventsCount || 0}
            label="Total GAD Events"
          />
        </div>
      </div>
      
    </div>
  );
}