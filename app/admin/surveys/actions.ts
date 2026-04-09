"use server";

import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function getSurveyAnalytics(surveyId: string) {
  try {
    // check if  user is admin
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    // check if user is admin in profile table
    const { data: profile } = await supabase
      .from("profile")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      throw new Error("Forbidden: Admin access required");
    }

    // fetch questions and responses using admin client (bypasses RLS)
    const [qRes, rRes] = await Promise.all([
      supabaseAdmin
        .from("survey_questions")
        .select("id, question_text, question_type, options, is_required, order_index")
        .eq("survey_id", surveyId)
        .order("order_index", { ascending: true }),
      supabaseAdmin
        .from("survey_responses")
        .select("question_id, response_value, response_token")
        .eq("survey_id", surveyId),
    ]);

    if (qRes.error) throw qRes.error;
    if (rRes.error) throw rRes.error;

    return {
      questions: qRes.data ?? [],
      responses: rRes.data ?? [],
      error: null,
    };
  } catch (err: any) {
    console.error("Error in getSurveyAnalytics:", err);
    return {
      questions: [],
      responses: [],
      error: err.message || "Failed to fetch analytics",
    };
  }
}
