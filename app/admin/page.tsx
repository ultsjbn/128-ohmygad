"use client";

import React, { useEffect, useState } from "react";
import { Typography, Paper } from "@snowball-tech/fractal";
// pls refer to this documentation: https://fractal.snowball.xyz/
// for charts, https://recharts.org/
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

// we'll override this with real values after fetching
const initialGenderDistribution = [
  { name: "Female", value: 65 },
  { name: "Male", value: 30 },
  { name: "Non-binary/Other", value: 5 },
];
const genderColors = ["#F49CE1", "#A7F3D0", "#FEF08A"];

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
  const [genderDistributionData, setGenderDistributionData] = useState(initialGenderDistribution);

  useEffect(() => {
    fetch("/api/gender-distribution")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.distribution)) {
          setGenderDistributionData(json.distribution);
        }
      })
      .catch((err) => console.error("fetch gender distribution error", err));
  }, []);

  return (
    <div className="max-w-[1400px] w-full flex flex-col">
      
      {/* HEADER SECTION */}
      <div className="mb-2">
        <Typography variant="body-1">
          Welcome,
        </Typography>
        <Typography variant="heading-1" className="tracking-tighter leading-none">
          Admin Name Yipee
        </Typography>
      </div>

      {/* ANALYTICS GRID FUCKASS SPACING */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* COLUMN 1 & 2: Event Analytics Container */}
        <Paper 
          elevation="elevated" 
          title="Event Analytics" 
          titleVariant="heading-2"
          className="lg:col-span-2 flex flex-col gap-6 h-full min-h-[520px]"
        >
          {/* Top Wide Card - Light Blue */}
          <Paper 
            elevation="bordered" 
            title="Attendance Over Time" 
            titleVariant="body-1-median"
            className="bg-[#E0F7FA] flex-1 flex flex-col min-h-[200px]"
          >
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
          <div className="grid grid-cols-2 gap-6 h-[160px]">
            <Paper 
              elevation="bordered" 
              title="Total GAD Events" 
              titleVariant="body-1-median"
              className="bg-fractal-decorative-purple-90 flex flex-col justify-between"
            >
              <Typography variant="heading-1" className="text-right tracking-tighter pt-4">24</Typography>
            </Paper>
            <Paper 
              elevation="bordered" 
              title="Onboarded Users" 
              titleVariant="body-1-median"
              className="bg-[#FFF9C4] flex flex-col justify-between"
            >
              <Typography variant="heading-1" className="text-right tracking-tighter pt-4">84%</Typography>
            </Paper>
          </div>
        </Paper>

        {/* COLUMN 3: Gender Distribution & Total Analytics */}
        <div className="flex flex-col gap-6 lg:col-span-1 h-full">
          {/* Tall Card */}
          <Paper 
            elevation="elevated" 
            title="Gender Distribution Pie Chart" 
            titleVariant="body-1-median"
            className="h-[320px] flex flex-col"
          >
            <div className="flex-1 w-full min-h-0 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={75}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="#000"
                    strokeWidth={3}
                  >
                    {genderDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={genderColors[index % genderColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ border: '3px solid black', borderRadius: '8px', backgroundColor: '#fff', boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Paper>
          
          {/* Short Card */}
          <Paper 
            elevation="elevated" 
            title="Total Users" 
            titleVariant="body-1-median"
            className="h-[176px] flex flex-col"
          >
            <div className="flex-1 flex items-center justify-center">
              <Typography variant="heading-1" className="text-6xl tracking-tighter">842</Typography>
            </div>
          </Paper>
        </div>

        {/* COLUMN 4: Roles & Breakdown Analytics */}
        <div className="flex flex-col gap-6 lg:col-span-1 h-full">
          {/* Short Card */}
          <Paper 
            elevation="elevated" 
            title="Users by Role" 
            titleVariant="body-1-median"
            className="h-[220px] flex flex-col"
          >
            <div className="flex-1 w-full min-h-0 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roleDistributionData} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.2} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="role" type="category" stroke="#000" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ border: '3px solid black', borderRadius: '8px', boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)' }} />
                  <Bar dataKey="count" fill="#F49CE1" stroke="#000" strokeWidth={3} radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Paper>
          
          {/* Tall Card */}
          <Paper  
            elevation="elevated" 
            title="Breakdown of Users per College" 
            titleVariant="body-1-median"
            className="h-[276px] flex flex-col"
          >
            <div className="flex-1 w-full min-h-0 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breakdownData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis dataKey="category" stroke="#000" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ border: '3px solid black', borderRadius: '8px', boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)' }} />
                  <Bar dataKey="value" fill="#93C5FD" stroke="#000" strokeWidth={3} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Paper>
        </div>

      </div>
    </div>
  );
}