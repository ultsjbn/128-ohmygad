/*
Fake / placeholder data
...
I don't know if this is a good idea but i just don't like the idea of there 
being so many constant data scattered in the file

Currently used by:
app/admin/page.tsx (chart data & colors) and and app/staff/page.tsx
app/admin/hooks/use-dashboard-data.ts (initial state values) and app/staff/hooks/use-dashboard-data.ts
*/

import type { CSSProperties } from "react";

// Event Attendance (Area Chart) 

/*
More placeholder data
Used in: app/admin/page.tsx (AreaChart data prop) and and app/staff/page.tsx
*/
export const eventAttendanceData = [
  { month: "Sep", attendees: 45 },
  { month: "Oct", attendees: 85 },
  { month: "Nov", attendees: 120 },
  { month: "Dec", attendees: 90 },
  { month: "Jan", attendees: 160 },
  { month: "Feb", attendees: 140 },
];

// Sex at Birth (Pie Chart) 

/*
Initial sex-at-birth data (replaced by API data once loaded).
Used in: app/admin/hooks/use-dashboard-data.ts (initial state) and app/staff/hooks/use-dashboard-data.ts
*/
export const initialSexAtBirthData = [
  { name: "Male", value: 45 },
  { name: "Female", value: 50 },
  { name: "Intersex", value: 5 },
];

/*
Color array for the sex-at-birth pie chart cells.
Used in: app/admin/page.tsx
*/
// export const sexAtBirthColors = [
//   "var(--color-decorative-blue-70)",
//   "var(--color-decorative-pink-70)",
//   "var(--color-decorative-yellow-70)",
// ];

// Gender Identity (Pie Chart) 

/*
Initial gender-identity data
Used in: app/admin/hooks/use-dashboard-data.ts and app/staff/hooks/use-dashboard-data.ts
*/
export const initialGenderIdentityData = [
  { name: "Man", value: 42 },
  { name: "Woman", value: 48 },
  { name: "Non-binary", value: 7 },
  { name: "Other", value: 3 },
];

/*
Color array for the gender-identity pie chart cells.
Used in: app/admin/page.tsx (PieChart Cell fill)
*/
export const genderIdentityColors = [
  "var(--color-icon-success)",
  "var(--color-icon-warning)",
  "var(--color-decorative-pink-70)",
  "var(--color-decorative-purple-70)",
];

// Role Distribution (Bar Chart) 

/*
Initial role distribution data (change this with real data)
Used in: app/admin/hooks/use-dashboard-data.ts (initial state) and app/staff/hooks/use-dashboard-data.ts
*/
export const initialRoleDistributionData = [
  { role: "Student", count: 210 },
  { role: "Faculty", count: 15 },
  { role: "Admin", count: 5 },
];

/*
role bar colors

Used in: app/admin/page.tsx (BarChart Cell fill)
*/
// export const roleColors = [
//   "var(--color-decorative-blue-70)",
//   "var(--color-decorative-green-70)",
//   "var(--color-decorative-purple-70)",
//   "var(--color-decorative-yellow-70)",
// ];

// College Breakdown (Bar Chart) 

/*
Initial college breakdown data (we gotta replace this data)

Used in: app/admin/hooks/use-dashboard-data.ts (initial state)
*/
export const initialBreakdownData = [
  { category: "CS", value: 110 },
  { category: "CAC", value: 65 },
  { category: "CSS", value: 55 },
];

/*
Color array for each college bar (cycles if > 5 categories).

Used in: app/admin/page.tsx (BarChart Cell fill) and app/staff/hooks/use-dashboard-data.ts
*/
// export const collegeColors = [
//   "var(--color-decorative-purple-70)",
//   "var(--color-decorative-blue-70)",
//   "var(--color-decorative-green-70)",
//   "var(--color-decorative-yellow-70)",
//   "var(--color-decorative-pink-70)",
// ];

// Shared Recharts Tooltip Style 

/*
Used in: app/admin/page.tsx (all 5 Tooltip contentStyle props)
*/
export const TOOLTIP_STYLE: CSSProperties = {
  border: "3px solid black",
  borderRadius: "8px",
  boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)",
  backgroundColor: "#fff",
};
