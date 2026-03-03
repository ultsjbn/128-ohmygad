import { Suspense } from "react";
import { connection } from "next/server";
import { UsersClient } from "./users-client";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Profile } from "./profile.types";

async function getProfiles() {
  await connection();
  const { data, error } = await supabaseAdmin
    .from("profile")
    .select("id, full_name, email, role, created_at")
    .order("created_at", { ascending: false });

  return { data: (data as Profile[]) ?? [], error: error?.message ?? null };
}

async function UserPage() {
  const { data, error } = await getProfiles();
  return <UsersClient initialProfiles={data} fetchError={error} />;
}

export default function UsersPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm text-fractal-text-light">
          Loading users...
        </div>
      }
    >
      <UserPage />
    </Suspense>
  );
}
