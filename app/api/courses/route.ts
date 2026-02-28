import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createAdminClient(url, key || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

    // use wildcard select so we don't need to know exact casing of end_time column
    const { data, error } = await supabase.from("course").select("*");
    if (error) {
      console.error("Error fetching courses:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // normalize column name for end_time if the DB uses weird casing
    const courses = (data || []).map((row: any) => {
      if (row.End_time && !row.end_time) {
        row.end_time = row.End_time;
        delete row.End_time;
      }
      return row;
    });

    return NextResponse.json({ success: true, courses });
  } catch (err) {
    console.error("Unhandled error in courses GET:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // the course table may have End_time instead of end_time depending on how it was created
    const { title, description = "", start_time = null, end_time = null, instructor_id = null, status = "active", semester = "" } = body;

    console.log("[POST /api/courses] Received body:", body);

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!key) {
      console.warn("[POST /api/courses] SUPABASE_SERVICE_ROLE_KEY not set, using publishable key");
    } else if (key.startsWith("sb_publishable_")) {
      console.warn("[POST /api/courses] SUPABASE_SERVICE_ROLE_KEY appears to be a publishable key - set the real service role key for insert to work");
    }

    const supabase = createAdminClient(url, key || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

    console.log("[POST /api/courses] Inserting course:", { title, description, start_time, end_time, instructor_id, status, semester });
    // when inserting, supply both potential column names for safety
    const insertObj: any = { title, description, start_time, instructor_id, status, semester };
    if (end_time !== null) {
      insertObj.end_time = end_time;
      insertObj.End_time = end_time;
    }
    const { data, error } = await supabase.from("course").insert([insertObj]).select();
    
    if (error) {
      console.error("[POST /api/courses] Error inserting course:", error);
      return NextResponse.json({ success: false, error: error.message, details: error }, { status: 500 });
    }

    console.log("[POST /api/courses] Course created successfully:", data?.[0]);
    return NextResponse.json({ success: true, course: data?.[0] || null });
  } catch (err) {
    console.error("[POST /api/courses] Unhandled error:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
