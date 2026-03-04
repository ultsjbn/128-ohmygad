import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!key) {
      console.warn("Service role key missing when calling display name API");
    }
    const supabase = createAdminClient(url, key || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

    const { data, error } = await supabase
      .from("profile")
      .select("display_name");

    if (error) {
      console.error("supabase error in display name API", error);
      return NextResponse.json({ success: false, error }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ success: true, distribution: [] });
    }

    const name: { [key: string]: number } = {};
    data.forEach((row: { display_name : string | null }) => {
      let s = row.display_name || "Not specified";
      s = s.toUpperCase();
      name[s] = (name[s] || 0) + 1;
    });

    const displayName = Object.entries(name).map(([name]) => ({ name }));
    return NextResponse.json({ success: true, displayName });
  } catch (err) {
    console.error("unexpected error in display name API", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
