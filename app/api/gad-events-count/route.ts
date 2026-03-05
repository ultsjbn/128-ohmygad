import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!key) {
      console.warn("SUPABASE_SERVICE_ROLE_KEY not set, results may be empty or limited by RLS.");
    } else if (key.startsWith("sb_publishable_")) {
      console.warn("SUPABASE_SERVICE_ROLE_KEY appears to be a publishable key – please set the real service role key.");
    }

    const supabase = createAdminClient(url, key || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

    const { data, count, error } = await supabase
      .from("event")
      .select("id", { count: "exact" });

    if (error) {
      console.error("Error fetching GAD events count:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const total = typeof count === "number" ? count : Array.isArray(data) ? data.length : 0;

    return NextResponse.json({ success: true, count: total });
  } catch (err) {
    console.error("Unhandled error in gad-events-count route:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
