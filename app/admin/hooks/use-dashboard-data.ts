"use client";
/*
custom hook that fetches all dashboard analytics data from the API.


@@ -5,109 +6,208 @@ Currently used by:
app/admin/page.tsx (admin dashboard)
*/
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface TimelineEvent {
  time: string;
  title: string;
  location: string;
  category: string;
}

export interface DashboardData {
  eventAttendanceData: { month: string; attendees: number }[];
  sexAtBirthData:      { name: string; value: number }[];
  genderIdentityData:  { name: string; value: number }[];
  breakdownData:       { category: string; value: number }[];
  userStats:           { total: number; onboarded: number } | null;
  gadEventsCount:      number;
  surveysCount:        number;
  todayEvents:         TimelineEvent[];
  loading:             boolean;
  error:               string | null;
}

const MONTH_LABELS = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];

function last12MonthsFrame() {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const d   = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    const gte = d.toISOString();
    const lt  = new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString();
    return { label: MONTH_LABELS[d.getMonth()], gte, lt };
  });
}

function humanise(str: string) {
  return str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function toCounts(values: (string | null)[]): { name: string; value: number }[] {
  const map: Record<string, number> = {};
  for (const v of values) {
    if (!v) continue;
    const key = humanise(v);
    map[key] = (map[key] ?? 0) + 1;
  }
  return Object.entries(map)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function useDashboardData(): DashboardData {
  const supabase = createClient();

  const [eventAttendanceData, setEventAttendanceData] = useState<DashboardData["eventAttendanceData"]>([]);
  const [sexAtBirthData,      setSexAtBirthData]      = useState<DashboardData["sexAtBirthData"]>([]);
  const [genderIdentityData,  setGenderIdentityData]  = useState<DashboardData["genderIdentityData"]>([]);
  const [breakdownData,       setBreakdownData]       = useState<DashboardData["breakdownData"]>([]);
  const [userStats,           setUserStats]           = useState<DashboardData["userStats"]>(null);
  const [gadEventsCount,      setGadEventsCount]      = useState(0);
  const [surveysCount,        setSurveysCount]        = useState(0);
  const [todayEvents,         setTodayEvents]         = useState<TimelineEvent[]>([]);
  const [loading,             setLoading]             = useState(true);
  const [error,               setError]               = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      try {
        setLoading(true);
        setError(null);

        // 1. User totals — profile table, exclude admins
        const [
          { count: totalCount,     error: e1 },
          { count: onboardedCount, error: e2 },
        ] = await Promise.all([
          supabase
            .from("profile")
            .select("id", { count: "exact", head: true })
            .neq("role", "admin"),
          supabase
            .from("profile")
            .select("id", { count: "exact", head: true })
            .neq("role", "admin")
            .eq("is_onboarded", true),
        ]);
        if (e1) throw e1;
        if (e2) throw e2;

        // 2. GAD events — event.category ilike '%GAD%'
        const { count: gadCount, error: e3 } = await supabase
          .from("event")
          .select("id", { count: "exact", head: true })
          .ilike("category", "%GAD%");
        if (e3) throw e3;

        // 2b. Surveys count
        const { count: surveyCount, error: e3b } = await supabase
          .from("survey")
          .select("id", { count: "exact", head: true });
        if (e3b) throw e3b;

        // 3. Monthly attendance — event_registration where attended = true,
        //    bucketed by registration_date over last 12 months
        const frame = last12MonthsFrame();
        const monthlyResults = await Promise.all(
          frame.map(async ({ label, gte, lt }) => {
            const { count, error: me } = await supabase
              .from("event_registration")
              .select("id", { count: "exact", head: true })
              .eq("attended", true)
              .gte("registration_date", gte)
              .lt("registration_date",  lt);
            if (me) throw me;
            return { month: label, attendees: count ?? 0 };
          })
        );

        // 4. Sex at birth
        const { data: sexRows, error: e4 } = await supabase
          .from("profile")
          .select("sex_at_birth")
          .neq("role", "admin")
          .not("sex_at_birth", "is", null);
        if (e4) throw e4;

        // 5. Gender identity
        const { data: genderRows, error: e5 } = await supabase
          .from("profile")
          .select("gender_identity")
          .neq("role", "admin")
          .not("gender_identity", "is", null);
        if (e5) throw e5;

        // 6. College breakdown
        const { data: collegeRows, error: e6 } = await supabase
          .from("profile")
          .select("college")
          .neq("role", "admin")
          .not("college", "is", null);
        if (e6) throw e6;

        // 7. Today's events for the timeline
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        const { data: todayRows, error: e7 } = await supabase
          .from("event")
          .select("id, title, start_date, location, category")
          .gte("start_date", todayStart.toISOString())
          .lte("start_date", todayEnd.toISOString())
          .order("start_date", { ascending: true });
        if (e7) throw e7;

        if (!cancelled) {
          setUserStats({ total: totalCount ?? 0, onboarded: onboardedCount ?? 0 });
          setGadEventsCount(gadCount ?? 0);
          setSurveysCount(surveyCount ?? 0);
          setEventAttendanceData(monthlyResults);
          setSexAtBirthData(toCounts((sexRows ?? []).map((r) => r.sex_at_birth)));
          setGenderIdentityData(toCounts((genderRows ?? []).map((r) => r.gender_identity)));
          setBreakdownData(
            toCounts((collegeRows ?? []).map((r) => r.college)).map(
              ({ name, value }) => ({ category: name, value })
            )
          );
          setTodayEvents(
            (todayRows ?? []).map((r) => ({
              time:     new Date(r.start_date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
              title:    r.title ?? "",
              location: r.location ?? "",
              category: r.category ?? "",
            }))
          );
        }
        } catch (err: any) {
        if (!cancelled) setError(err?.message ?? "Failed to load dashboard data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAll();
    return () => { cancelled = true; };
  }, []);

    return {
        eventAttendanceData,
        sexAtBirthData,
        genderIdentityData,
        breakdownData,
        userStats,
        gadEventsCount,
        surveysCount,
        todayEvents,
        loading,
        error,
  };
}