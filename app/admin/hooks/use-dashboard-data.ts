/*
custom hook that fetches all dashboard analytics data from the API.

Currently used by:
app/admin/page.tsx (admin dashboard)
*/

"use client";

import { useEffect, useState } from "react";
import {
  initialSexAtBirthData,
  initialGenderIdentityData,
  initialRoleDistributionData,
  initialBreakdownData,
  eventAttendanceData,
} from "../dashboard.constants";

interface UserStats {
  total: number;
  onboarded: number;
  percent: number;
}

/*
Fetch all dashboard data on mount and return the reactive state values.

Used in: app/admin/page.tsx
*/
export function useDashboardData() {
  const [sexAtBirthData, setSexAtBirthData] = useState(initialSexAtBirthData);
  const [genderIdentityData, setGenderIdentityData] = useState(initialGenderIdentityData);
  const [roleDistributionData, setRoleDistributionData] = useState(initialRoleDistributionData);
  const [breakdownData, setBreakdownData] = useState(initialBreakdownData);
  const [userStats, setUserStats] = useState<UserStats>({ total: 0, onboarded: 0, percent: 0 });
  const [gadEventsCount, setGadEventsCount] = useState<number>(0);

  useEffect(() => {
    // sex at birth data
    fetch("/api/sex-at-birth")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.distribution) && json.distribution.length > 0) {
          setSexAtBirthData(json.distribution);
        }
      })
      .catch((err) => console.error("fetch sex at birth error", err));

    // gender identity data
    fetch("/api/gender-distribution")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.distribution) && json.distribution.length > 0) {
          setGenderIdentityData(json.distribution);
        }
      })
      .catch((err) => console.error("fetch gender distribution error", err));

    // users by role data
    fetch("/api/users-by-role")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.distribution) && json.distribution.length > 0) {
          setRoleDistributionData(json.distribution);
        }
      })
      .catch((err) => console.error("fetch users by role error", err));

    // college distribution data
    fetch("/api/college-distribution")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.distribution) && json.distribution.length > 0) {
          setBreakdownData(json.distribution);
        }
      })
      .catch((err) => console.error("fetch college distribution error", err));

    // user stats
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

    // total GAD events count
    fetch("/api/gad-events-count")
      .then((res) => res.json())
      .then((json) => {
        if (json && json.success && typeof json.count === "number") {
          setGadEventsCount(json.count);
        }
      })
      .catch((err) => console.error("fetch gad events count error", err));
  }, []);

  return {
    eventAttendanceData,
    sexAtBirthData,
    genderIdentityData,
    roleDistributionData,
    breakdownData,
    userStats,
    gadEventsCount,
  };
}
