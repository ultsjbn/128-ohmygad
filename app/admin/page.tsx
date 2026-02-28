"use client";

import React, { useEffect, useState } from "react";
//import { Paper } from "@snowball-tech/fractal";
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

// colors for each college bar, will cycle if more categories
const collegeColors = [
  "var(--color-decorative-purple-70)",
  "var(--color-decorative-blue-70)",
  "var(--color-decorative-green-70)",
  "var(--color-decorative-yellow-70)",
  "var(--color-decorative-pink-70)"
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
    <div className="max-w-[1400px] w-full h-full flex flex-col">
      
      {/* HEADER SECTION WITH TOTAL USERS */}
      <div className="mb-4 shrink-0 flex items-end justify-between">
        <div>
          <Typography variant="heading-3">
            Welcome,
          </Typography>
          <Typography variant="heading-1" className="tracking-tighter leading-none font-median">
            Admin Name Yipee
          </Typography>
        </div>
        <div className="flex flex-col items-center">
          <Typography variant="body-1-median">Total Users</Typography>
          <Typography variant="heading-1" className="text-4xl tracking-tighter">{userStats.total}</Typography>
        </div>
      </div>

      {/* ANALYTICS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 min-h-0">
        
        {/* COLUMN 1 & 2: Event Analytics Container */}
        <Paper elevation="elevated" title="Event Analytics" titleVariant="heading-4" className="lg:col-span-2 flex flex-col gap-1 h-full">
          
          {/* Top Wide Card - Light Blue */}
          <Card color="blue" title="Attendance Over Time" style={{ height: '480px' }} className="flex flex-col mb-2">
            <div className="flex-1 w-full pt-2 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={eventAttendanceData} margin={{ top: 3, right: 5, left: -30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#000" opacity={0.1} />
                  <XAxis dataKey="month" stroke="#000" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#000" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ border: '3px solid black', borderRadius: '8px', boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)', backgroundColor: '#fff' }}
                  />
                  <Area type="monotone" dataKey="attendees" stroke="#000" strokeWidth={3} fill="#A7F3D0" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Bottom Row - Purple and Yellow Cards */}
          <div className="grid grid-cols-2 gap-4 shrink-0 h-[110px]">
            <Card color="purple" title="Total GAD Events" className="h-full flex flex-col justify-between">
              <Typography variant="heading-2" className="text-right tracking-tighter">{gadEventsCount}</Typography>
            </Card>
            <Card color="yellow" title="Total GAD Events" className="h-full flex flex-col justify-between">
                <Typography variant="heading-2" className="text-right tracking-tighter">
                  {userStats.onboarded}
                </Typography>
            </Card>
          </div>

        </Paper>

        {/* COLUMN 3: Sex and Gender Distribution */}
        <div className="flex flex-col gap-4 lg:col-span-1 h-full min-h-0">
          {/* Sex at Birth Distribution */}
          <Paper elevation="elevated" title="Sex at Birth" titleVariant="body-1-median" className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sexAtBirthData}
                    cx="50%"
                    cy="50%"
                    innerRadius="40%"
                    outerRadius="80%"
                    paddingAngle={2}
                    dataKey="value"
                    stroke="#000"
                    strokeWidth={2}
                  >
                    {sexAtBirthData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={sexAtBirthColors[index % sexAtBirthColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ border: '3px solid black', borderRadius: '8px', backgroundColor: '#fff', boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Paper>
          
          {/* Gender Identity Distribution */}
          <Paper elevation="elevated" title="Gender Identity" titleVariant="body-1-median" className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderIdentityData}
                    cx="50%"
                    cy="50%"
                    innerRadius="40%"
                    outerRadius="80%"
                    paddingAngle={2}
                    dataKey="value"
                    stroke="#000"
                    strokeWidth={2}
                  >
                    {genderIdentityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={genderIdentityColors[index % genderIdentityColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ border: '3px solid black', borderRadius: '8px', backgroundColor: '#fff', boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Paper>
        </div>

        {/* COLUMN 4: Roles & Breakdown Analytics */}
        <div className="flex flex-col gap-4 lg:col-span-1 h-full min-h-0">
          {/* Short Card */}
          <Paper elevation="elevated" title="Users by Role" titleVariant="body-1-median" className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 w-full min-h-0 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roleDistributionData} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.2} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="role" type="category" stroke="#000" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ border: '3px solid black', borderRadius: '8px', boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)' }} />
                  <Bar dataKey="count" stroke="#000" strokeWidth={2} radius={[0, 4, 4, 0]} barSize={24}>
                    {roleDistributionData.map((entry, idx) => (
                      <Cell
                        key={`cell-role-${idx}`}
                        fill={roleColors[idx % roleColors.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Paper>
          
          {/* Tall Card */}
          <Paper elevation="elevated" title="Users per College" titleVariant="body-1-median" className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 w-full min-h-0 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breakdownData} margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis dataKey="category" stroke="#000" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ border: '3px solid black', borderRadius: '8px', boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)' }} />
                  <Bar dataKey="value" stroke="#000" strokeWidth={2} radius={[4, 4, 0, 0]} >
                    {breakdownData.map((entry, idx) => (
                      <Cell
                        key={`cell-col-${idx}`}
                        fill={collegeColors[idx % collegeColors.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Paper>
        </div>

      </div>
    </div>
  );
}