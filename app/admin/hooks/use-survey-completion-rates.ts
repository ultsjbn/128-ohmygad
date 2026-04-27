"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface SurveyCompletionDatum {
  id: string;
  title: string;
  completedPct: number;
  incompletePct: number;
  completedCount: number;
  totalRegistrations: number;
}

export function useSurveyCompletionRates() {
  const [data, setData] = useState<SurveyCompletionDatum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchSurveyCompletion() {
      try {
        setLoading(true);
        const supabase = createClient();

        const { data: surveys, error: surveyError } = await supabase
          .from("survey")
          .select("id, title, event_id")
          .order("title", { ascending: true });

        if (surveyError) throw surveyError;
        if (!surveys || surveys.length === 0) {
          if (!cancelled) setData([]);
          return;
        }

        const surveyIds = surveys.map((survey: any) => survey.id);
        const { data: responses, error: responseError } = await supabase
          .from("survey_responses")
          .select("survey_id, response_token")
          .in("survey_id", surveyIds);

        if (responseError) throw responseError;

        const responsesBySurvey: Record<string, Set<string>> = {};
        (responses ?? []).forEach((row: any) => {
          if (!row.survey_id) return;
          responsesBySurvey[row.survey_id] ||= new Set();
          responsesBySurvey[row.survey_id].add(row.response_token);
        });

        const completionData = await Promise.all(
          (surveys ?? []).map(async (survey: any) => {
            const completedCount = responsesBySurvey[survey.id]?.size ?? 0;
            let totalRegistrations = 0;
            let completedPct = 0;

            if (survey.event_id) {
              const { count, error: regError } = await supabase
                .from("event_registration")
                .select("id", { count: "exact", head: true })
                .eq("event_id", survey.event_id);

              if (regError) throw regError;
              totalRegistrations = count ?? 0;
            }

            if (totalRegistrations > 0) {
              completedPct = Math.round((completedCount / totalRegistrations) * 100);
            }

            return {
              id: survey.id,
              title: survey.title ?? "Untitled Survey",
              completedPct,
              incompletePct: totalRegistrations > 0 ? Math.max(0, 100 - completedPct) : 0,
              completedCount,
              totalRegistrations,
            };
          })
        );

        if (!cancelled) {
          setData(completionData);
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message || "Failed to load survey completion data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchSurveyCompletion();
    return () => { cancelled = true; };
  }, []);

  return { data, loading, error };
}
