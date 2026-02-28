"use client";

import React from "react";
import { Typography, Paper } from "@snowball-tech/fractal";
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

const sexAtBirthData = [
  { name: "Male", value: 45 },
  { name: "Female", value: 50 },
  { name: "Intersex", value: 5 },
];

const genderIdentityData = [
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

const roleDistributionData = [
  { role: "Student", count: 210 },
  { role: "Faculty", count: 15 },
  { role: "Admin", count: 5 },
];

const breakdownData = [
  { category: "CS", value: 110 },
  { category: "CAC", value: 65 },
  { category: "CSS", value: 55 },
];

export default function DashboardPage() {
  return (
    // 1. Added h-full to the root container
    <div className="max-w-[1400px] w-full h-full flex flex-col">
      
      {/* HEADER SECTION WITH TOTAL USERS */}
      <div className="mb-4 shrink-0 flex items-end justify-between">
        <div>
          <Typography variant="body-1">
            Welcome,
          </Typography>
          <Typography variant="heading-1" className="tracking-tighter leading-none font-median">
            Admin Name Yipee
          </Typography>
        </div>
        <div className="flex flex-col items-center">
          <Typography variant="body-1-median">Total Users</Typography>
          <Typography variant="heading-1" className="text-4xl tracking-tighter">842</Typography>
        </div>
      </div>

      {/* ANALYTICS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 min-h-0">
        
        {/* COLUMN 1 & 2: Event Analytics Container */}
        <Paper elevation="elevated" title="Event Analytics" titleVariant="heading-2" className="lg:col-span-2 flex flex-col gap-4 h-full min-h-0">
          
          {/* Top Wide Card - Light Blue */}
          <Paper elevation="bordered" title="Attendance Over Time" titleVariant="body-1-median" className="bg-fractal-decorative-blue-90 flex-1 flex flex-col min-h-0 mb-3">
            <div className="flex-1 w-full min-h-0 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={eventAttendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#000" opacity={0.1} />
                  <XAxis dataKey="month" stroke="#000" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#000" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ border: '3px solid black', borderRadius: '8px', boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)', backgroundColor: '#fff' }}
                  />
                  <Area type="monotone" dataKey="attendees" stroke="#000" strokeWidth={3} fill="#A7F3D0" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Paper>

          {/* Bottom Row - Purple and Yellow Cards */}
          <div className="grid grid-cols-2 gap-4 shrink-0 h-[110px]">
            <Paper elevation="bordered" title="Total GAD Events" titleVariant="body-1-median" className="bg-fractal-decorative-purple-90 h-full flex flex-col justify-between">
              <Typography variant="heading-2" className="text-right tracking-tighter">24</Typography>
            </Paper>
            <Paper elevation="bordered" title="Onboarded Users" titleVariant="body-1-median" className="bg-fractal-decorative-yellow-50 h-full flex flex-col justify-between">
              <Typography variant="heading-2" className="text-right tracking-tighter">84%</Typography>
            </Paper>
          </div>

        </Paper>

        {/* COLUMN 3: Sex and Gender Distribution */}
        <div className="flex flex-col gap-4 lg:col-span-1 h-full min-h-0">
          {/* Sex at Birth Distribution */}
          <Paper elevation="elevated" title="Sex at Birth Distribution" titleVariant="body-1-median" className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 w-full min-h-0 pt-2">
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
          <Paper elevation="elevated" title="Gender Identity Distribution" titleVariant="body-1-median" className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 w-full min-h-0 pt-2">
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
                <BarChart data={roleDistributionData} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.2} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="role" type="category" stroke="#000" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ border: '3px solid black', borderRadius: '8px', boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)' }} />
                  <Bar dataKey="count" fill="#F49CE1" stroke="#000" strokeWidth={2} radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Paper>
          
          {/* Tall Card */}
          <Paper elevation="elevated" title="Breakdown of Users per College" titleVariant="body-1-median" className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 w-full min-h-0 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breakdownData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis dataKey="category" stroke="#000" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ border: '3px solid black', borderRadius: '8px', boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)' }} />
                  <Bar dataKey="value" fill="#93C5FD" stroke="#000" strokeWidth={2} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Paper>
        </div>

      </div>
    </div>
  );
}