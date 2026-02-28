import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!key) {
      console.warn("Service role key missing when calling sex-at-birth API");
    }
    const supabase = createAdminClient(url, key || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

    const { data, error } = await supabase
      .from("profile")
      .select("sex_at_birth");

    if (error) {
      console.error("supabase error in sex-at-birth API", error);
      return NextResponse.json({ success: false, error }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ success: true, distribution: [] });
    }

    const counts: { [key: string]: number } = {};
    data.forEach((row: { sex_at_birth: string | null }) => {
      let s = row.sex_at_birth || "Not specified";
      s = s.toUpperCase();
      counts[s] = (counts[s] || 0) + 1;
    });

    const distribution = Object.entries(counts).map(([name, value]) => ({ name, value }));
    return NextResponse.json({ success: true, distribution });
  } catch (err) {
    console.error("unexpected error in sex-at-birth API", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
