import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!key) console.warn("Service role key missing for user-stats API");
    const supabase = createAdminClient(url, key || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

    // fetch total users
    const { data: all, error: allErr } = await supabase.from("profile").select("id", { count: "exact" });
    if (allErr) throw allErr;
    const total = all?.length ?? 0;

    // count users where is_onboarded=true (column may not exist)
    let onboarded = total;
    try {
      const { data: onbData, error: onbErr } = await supabase.from("profile").select("is_onboarded");
      if (!onbErr && onbData) {
        onboarded = onbData.filter((row: any) => row.is_onboarded === true).length;
      }
    } catch (e) {
      // ignore if column doesn't exist
    }

    const percent = total > 0 ? Math.round((onboarded / total) * 100) : 0;
    return NextResponse.json({ success: true, total, onboarded, percent });
  } catch (err) {
    console.error("user-stats API error", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}