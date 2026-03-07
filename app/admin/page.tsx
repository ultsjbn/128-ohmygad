"use client";

import React, { useEffect, useState } from "react";
import { Paper } from "@/components/paper";
import { Card } from "@/components/card";
import { Typography } from '@/components/typography';
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

// --- MOCK DATA ---

const eventAttendanceData = [
  { month: "Sep", attendees: 45 },
  { month: "Oct", attendees: 85 },
  { month: "Nov", attendees: 120 },
  { month: "Dec", attendees: 90 },
  { month: "Jan", attendees: 160 },
  { month: "Feb", attendees: 140 },
];

const initialSexAtBirthData = [
  { name: "Male", value: 45 },
  { name: "Female", value: 50 },
  { name: "Intersex", value: 5 },
];

const initialGenderIdentityData = [
  { name: "Man", value: 42 },
  { name: "Woman", value: 48 },
  { name: "Non-binary", value: 7 },
  { name: "Other", value: 3 },
];

const sexAtBirthColors = [
  "var(--color-decorative-blue-70)", 
  "var(--color-decorative-pink-70)",       
  "var(--color-decorative-yellow-70)"
];

const genderIdentityColors = [
  "var(--color-icon-success)",
  "var(--color-icon-warning)",
  "var(--color-decorative-pink-70)",
  "var(--color-decorative-purple-70)"
];

const initialRoleDistributionData = [
  { role: "Student", count: 210 },
  { role: "Faculty", count: 15 },
  { role: "Admin", count: 5 },
];

// colors for each role bar
const roleColors = [
  "var(--color-decorative-blue-70)",
  "var(--color-decorative-green-70)",
  "var(--color-decorative-purple-70)",
  "var(--color-decorative-yellow-70)",
];

const initialBreakdownData = [
  { category: "CS", value: 110 },
  { category: "CAC", value: 65 },
  { category: "CSS", value: 55 },
];

export default function DashboardPage() {
  const [sexAtBirthData, setSexAtBirthData] = useState(initialSexAtBirthData);
  const [genderIdentityData, setGenderIdentityData] = useState(initialGenderIdentityData);
  const [roleDistributionData, setRoleDistributionData] = useState(initialRoleDistributionData);
  const [breakdownData, setBreakdownData] = useState(initialBreakdownData);
  const [userStats, setUserStats] = useState<{total: number; onboarded: number; percent: number}>({ total: 0, onboarded: 0, percent: 0 });
  const [gadEventsCount, setGadEventsCount] = useState<number>(0);

  useEffect(() => {
    // Fetch sex at birth data
    fetch("/api/sex-at-birth")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.distribution) && json.distribution.length > 0) {
          setSexAtBirthData(json.distribution);
        }
      })
      .catch((err) => console.error("fetch sex at birth error", err));

    // Fetch gender identity data
    fetch("/api/gender-distribution")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.distribution) && json.distribution.length > 0) {
          setGenderIdentityData(json.distribution);
        }
      })
      .catch((err) => console.error("fetch gender distribution error", err));

    // Fetch users by role data
    fetch("/api/users-by-role")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.distribution) && json.distribution.length > 0) {
          setRoleDistributionData(json.distribution);
        }
      })
      .catch((err) => console.error("fetch users by role error", err));

    // Fetch college distribution data
    fetch("/api/college-distribution")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.distribution) && json.distribution.length > 0) {
          setBreakdownData(json.distribution);
        }
      })
      .catch((err) => console.error("fetch college distribution error", err));

    // Fetch user stats
    fetch("/api/user-stats")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setUserStats({
            total: json.total || 0,
            onboarded: json.onboarded || 0,
            percent: json.percent || 0,
          });
        }
      })
      .catch((err) => console.error("fetch user stats error", err));

    // Fetch total GAD events count
    fetch("/api/gad-events-count")
      .then((res) => res.json())
      .then((json) => {
        if (json && json.success && typeof json.count === "number") {
          setGadEventsCount(json.count);
        }
      })
      .catch((err) => console.error("fetch gad events count error", err));
  }, []);

  return (
    <div className="max-w-[1600px] w-full h-full flex flex-col gap-8">
      
      {/* haeder section */}
      <div className="shrink-0 flex flex-col gap-1 mt-4">
        <Typography variant="heading-1" className="tracking-tight text-fractal-text-dark font-median text-4xl">
          Good morning, Admin Yipee
        </Typography>
        <Typography variant="body-1-median" className="text-fractal-text-secondary max-w-2xl">
          Here is what is happening with the KASARIAN Event Management Platform today. You have {userStats.total} registered users and {gadEventsCount} total events managed.
        </Typography>
      </div>

      {/* TOP ROW: PASTEL METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
        <Card className="bg-fractal-decorative-yellow-50 border-none shadow-none rounded-[1.5rem] p-6 flex flex-col justify-between h-36">
          <Typography variant="body-1-median" className="text-black/70">Total Users</Typography>
          <Typography variant="heading-1" className="text-5xl tracking-tighter text-black">{userStats.total}</Typography>
        </Card>
        
        <Card className="bg-fractal-decorative-pink-70 border-none shadow-none rounded-[1.5rem] p-6 flex flex-col justify-between h-36">
          <Typography variant="body-1-median" className="text-black/70">Total GAD Events</Typography>
          <Typography variant="heading-1" className="text-5xl tracking-tighter text-black">{gadEventsCount}</Typography>
        </Card>

        <Card className="bg-fractal-decorative-green-50 border-none shadow-none rounded-[1.5rem] p-6 flex flex-col justify-between h-36">
          <Typography variant="body-1-median" className="text-black/70">Onboarded Users</Typography>
          <Typography variant="heading-1" className="text-5xl tracking-tighter text-black">{userStats.onboarded}</Typography>
        </Card>

        <Card className="bg-fractal-decorative-blue-50 border-none shadow-none rounded-[1.5rem] p-6 flex flex-col justify-between h-36">
          <Typography variant="body-1-median" className="text-black/70">Completion Rate</Typography>
          <Typography variant="heading-1" className="text-5xl tracking-tighter text-black">{userStats.percent}%</Typography>
        </Card>
      </div>

      {/* BOTTOM SECTION: CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[400px]">
        
        {/* MAIN CHART (Span 2 Cols) */}
        <Paper elevation="0" className="lg:col-span-2 bg-white rounded-[1.5rem] border border-fractal-border-default shadow-soft-sm p-6 flex flex-col h-full">
          <div className="mb-4">
             <Typography variant="heading-4" className="font-median">Attendance Over Time</Typography>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={eventAttendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAttendees" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-brand-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-brand-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="month" stroke="var(--color-text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="attendees" stroke="var(--color-brand-primary)" strokeWidth={4} fillOpacity={1} fill="url(#colorAttendees)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Paper>

        {/* SIDE BAR CHARTS (Span 1 Col) */}
        <div className="flex flex-col gap-6 lg:col-span-1 h-full min-h-0">
          
          <Paper elevation="0" className="flex-1 bg-white rounded-[1.5rem] border border-fractal-border-default shadow-soft-sm p-6 flex flex-col min-h-0">
             <Typography variant="body-1-median" className="mb-2">Users by Role</Typography>
             <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roleDistributionData} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="role" type="category" stroke="var(--color-text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={20}>
                    {roleDistributionData.map((entry, idx) => (
                      <Cell key={`cell-role-${idx}`} fill={roleColors[idx % roleColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Paper>

          <Paper elevation="0" className="flex-1 bg-white rounded-[1.5rem] border border-fractal-border-default shadow-soft-sm p-6 flex flex-col min-h-0">
             <Typography variant="body-1-median" className="mb-2">Demographics</Typography>
             <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={genderIdentityData} cx="50%" cy="50%" innerRadius="55%" outerRadius="80%" paddingAngle={4} dataKey="value" stroke="none">
                    {genderIdentityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={genderIdentityColors[index % genderIdentityColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Paper>

        </div>
      </div>
    </div>
  );
}