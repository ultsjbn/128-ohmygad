import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createAdminClient(url, key || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

    const { data, error } = await supabase
      .from("course")
      .select("id,code,title,description,schedule,instructor_id,status,semester,college,created_at,updated_at");
    if (error) {
      console.error("Error fetching courses:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, courses: data || [] });
  } catch (err) {
    console.error("Unhandled error in courses GET:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      code = "",
      title,
      description = "",
      schedule = null,
      instructor_id = null,
      status = "active",
      semester = "",
      college = "",
    } = body;

    console.log("[POST /api/courses] Received body:", body);

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!key) {
      console.warn("[POST /api/courses] SUPABASE_SERVICE_ROLE_KEY not set, using publishable key");
    } else if (key.startsWith("sb_publishable_")) {
      console.warn("[POST /api/courses] SUPABASE_SERVICE_ROLE_KEY appears to be a publishable key - set the real service role key for insert to work");
    }

    const supabase = createAdminClient(url, key || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

    console.log("[POST /api/courses] Inserting course:", { code, title, description, schedule, instructor_id, status, semester, college });
    const { data, error } = await supabase
      .from("course")
      .insert([{ code, title, description, schedule, instructor_id, status, semester, college }])
      .select();
    
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
