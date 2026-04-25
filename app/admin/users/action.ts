"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";

export async function deleteUser(userId: string) {
  
  await supabaseAdmin.auth.admin.deleteUser(userId);

  const { error } = await supabaseAdmin
    .from("profile")
    .delete()
    .eq("id", userId);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}