import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * POST /api/admin/sync-session-count
 * Recalculates a user's gso_attended or asho_attended count
 * based on their actual attended event_registration records.
 *
 * Body: { userId: string, category: "GSO" | "ASHO" }
 */
export async function POST(req: NextRequest) {
  try {
    const { userId, category } = await req.json();

    if (!userId || !category) {
      return NextResponse.json(
        { error: "userId and category are required" },
        { status: 400 },
      );
    }

    if (category !== "GSO" && category !== "ASHO") {
      return NextResponse.json(
        { error: "category must be GSO or ASHO" },
        { status: 400 },
      );
    }

    // get all event IDs matching the category
    const { data: categoryEvents, error: eventsError } = await supabaseAdmin
      .from("event")
      .select("id")
      .eq("category", category);

    if (eventsError) {
      return NextResponse.json({ error: eventsError.message }, { status: 500 });
    }

    let attendedCount = 0;

    if (categoryEvents && categoryEvents.length > 0) {
      const eventIds = categoryEvents.map((e) => e.id);

      // count attended registrations for this user across those events
      const { count, error: countError } = await supabaseAdmin
        .from("event_registration")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("attended", true)
        .in("event_id", eventIds);

      if (countError) {
        return NextResponse.json(
          { error: countError.message },
          { status: 500 },
        );
      }

      attendedCount = count ?? 0;
    }

    // update the user's profile
    const field = category === "GSO" ? "gso_attended" : "asho_attended";
    const { error: updateError } = await supabaseAdmin
      .from("profile")
      .update({ [field]: attendedCount })
      .eq("id", userId);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, [field]: attendedCount });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 },
    );
  }
}
