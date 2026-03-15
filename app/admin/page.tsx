"use client";

import React from "react";
import { Card, StatCard } from "@/components/ui";
import { Users, CalendarCheck, UserCheck } from "lucide-react";
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
} from "recharts";

import {
  eventAttendanceData,
  sexAtBirthColors,
  genderIdentityColors,
  roleColors,
  collegeColors,
  TOOLTIP_STYLE,
} from "./dashboard.constants";

import { useDashboardData } from "./hooks/use-dashboard-data";

export default function DashboardPage() {
  const {
    sexAtBirthData,
    genderIdentityData,
    roleDistributionData,
    breakdownData,
    userStats,
    gadEventsCount,
  } = useDashboardData();

  const strokeColor = "var(--primary-dark)";

  return (
    <div className="w-full h-full flex flex-col gap-6 animate-in fade-in duration-500">

      {/* HEADER SECTION */}
      <div className="shrink-0 flex items-end justify-between">
        <div className="flex flex-col animate-in slide-in-from-bottom-2 duration-500">
          <p className="body text-[var(--gray)] font-medium">Welcome back,</p>
          <h1 className="heading-xl mt-1">Admin Dashboard</h1>
        </div>
        
        {/* Top-Level Stat Card */}
        <div className="w-48">
          <StatCard
            icon={<Users size={20} className="text-[var(--periwinkle)]" />}
            iconBg="var(--periwinkle-light)"
            value={userStats.total}
            label="Total Registered Users"
          />
        </div>
      </div>

      {/* ANALYTICS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">

        {/* COLUMN 1 & 2: Event Analytics Container */}
        <div className="lg:col-span-2 flex flex-col gap-6 h-full min-h-0">

          {/* Top Wide Card - Area Chart */}
          <Card className="flex-1 flex flex-col min-h-0 p-5">
            <h2 className="heading-md mb-4 shrink-0">Attendance Over Time</h2>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={eventAttendanceData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={strokeColor} opacity={0.08} />
                  <XAxis dataKey="month" stroke={strokeColor} fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke={strokeColor} fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Area type="monotone" dataKey="attendees" stroke={strokeColor} strokeWidth={2} fill="var(--periwinkle-light)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Bottom Row - StatCards */}
          <div className="grid grid-cols-2 gap-6 shrink-0">
            <StatCard
              icon={<CalendarCheck size={20} className="text-[var(--soft-pink)]" />}
              iconBg="var(--pink-light)"
              value={gadEventsCount}
              label="Total GAD Events"
            />
            <StatCard
              icon={<UserCheck size={20} className="text-[var(--success)]" />}
              iconBg="rgba(109, 197, 160, 0.15)"
              value={userStats.onboarded}
              label="Onboarded Users"
            />
          </div>

        </div>

        {/* COLUMN 3: Sex and Gender Distribution */}
        <div className="flex flex-col gap-6 lg:col-span-1 h-full min-h-0">
          
          {/* Sex at Birth Distribution */}
          <Card className="flex-1 flex flex-col min-h-0 p-5">
            <h2 className="heading-sm mb-2 shrink-0">Sex at Birth</h2>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sexAtBirthData}
                    cx="50%"
                    cy="50%"
                    innerRadius="45%"
                    outerRadius="80%"
                    paddingAngle={3}
                    dataKey="value"
                    stroke={strokeColor}
                    strokeWidth={1.5}
                  >
                    {sexAtBirthData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={sexAtBirthColors[index % sexAtBirthColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Gender Identity Distribution */}
          <Card className="flex-1 flex flex-col min-h-0 p-5">
            <h2 className="heading-sm mb-2 shrink-0">Gender Identity</h2>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderIdentityData}
                    cx="50%"
                    cy="50%"
                    innerRadius="45%"
                    outerRadius="80%"
                    paddingAngle={3}
                    dataKey="value"
                    stroke={strokeColor}
                    strokeWidth={1.5}
                  >
                    {genderIdentityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={genderIdentityColors[index % genderIdentityColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* COLUMN 4: Roles & Breakdown Analytics */}
        <div className="flex flex-col gap-6 lg:col-span-1 h-full min-h-0">
          
          {/* Roles Card */}
          <Card className="flex-1 flex flex-col min-h-0 p-5">
            <h2 className="heading-sm mb-2 shrink-0">Users by Role</h2>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roleDistributionData} layout="vertical" margin={{ top: 0, right: 10, left: 15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="role" type="category" stroke={strokeColor} fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(45,42,74,0.04)' }} contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="count" stroke={strokeColor} strokeWidth={1.5} radius={[0, 4, 4, 0]} barSize={20}>
                    {roleDistributionData.map((entry, idx) => (
                      <Cell key={`cell-role-${idx}`} fill={roleColors[idx % roleColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* College Card */}
          <Card className="flex-1 flex flex-col min-h-0 p-5">
            <h2 className="heading-sm mb-2 shrink-0">Users per College</h2>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breakdownData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                  <XAxis dataKey="category" stroke={strokeColor} fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke={strokeColor} fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(45,42,74,0.04)' }} contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="value" stroke={strokeColor} strokeWidth={1.5} radius={[4, 4, 0, 0]} barSize={32}>
                    {breakdownData.map((entry, idx) => (
                      <Cell key={`cell-col-${idx}`} fill={collegeColors[idx % collegeColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

        </div>

      </div>
    </div>
  );
}