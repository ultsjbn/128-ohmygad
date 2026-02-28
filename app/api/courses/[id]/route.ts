import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    let body = await req.json();

    // if body uses end_time but the DB column is End_time, prepare both
    if (body.end_time !== undefined && body.End_time === undefined) {
      body.End_time = body.end_time;
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createAdminClient(url, key || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

    const { data, error } = await supabase.from("course").update(body).eq("id", id).select();
    if (error) {
      console.error("Error updating course:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, course: data?.[0] || null });
  } catch (err) {
    console.error("Unhandled error in courses PATCH:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createAdminClient(url, key || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

    const { error } = await supabase.from("course").delete().eq("id", id);
    if (error) {
      console.error("Error deleting course:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Unhandled error in courses DELETE:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
