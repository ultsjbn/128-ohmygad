import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getCurrentUserWithRole } from "@/lib/auth/get-current-user";

export async function GET(request: Request) {
  try {
    const authResult = await getCurrentUserWithRole();
    if (authResult.error) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = authResult.user?.role;
    if (!role) {
       return NextResponse.json({ error: "No role" }, { status: 403 });
    }

    const url = new URL(request.url);
    const query = url.searchParams.get("q") || "";
    const isAll = url.searchParams.get("all") === "true";
    const limitAmount = isAll ? 1000 : 5;

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const { data: courses } = await supabaseAdmin
      .from("course")
      .select("id, title")
      .ilike("title", `%${query}%`)
      .limit(limitAmount);

    const { data: events } = await supabaseAdmin
      .from("event")
      .select("id, title")
      .ilike("title", `%${query}%`)
      .limit(limitAmount);

    const { data: surveys } = await supabaseAdmin
      .from("survey")
      .select("id, title")
      .ilike("title", `%${query}%`)
      .limit(limitAmount);
      
    let users: any[] = [];
    if (role === "admin") {
      const { data } = await supabaseAdmin
        .from("profile")
        .select("id, full_name, email")
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(limitAmount);
      users = data || [];
    }

    const results = [
      ...(courses?.map(c => ({ id: c.id, title: c.title, type: "Course" })) || []),
      ...(events?.map(e => ({ id: e.id, title: e.title, type: "Event" })) || []),
      ...(surveys?.map(s => ({ id: s.id, title: s.title, type: "Survey" })) || []),
      ...(users?.map(u => ({ id: u.id, title: u.full_name || u.email, type: "User" })) || []),
    ];

    return NextResponse.json({ results });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
