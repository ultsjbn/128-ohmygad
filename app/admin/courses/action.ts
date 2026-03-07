"use server";

import { supabase } from "@/lib/supabase/server";

export async function deleteUser(userId: string) {
  const { error } = await supabase
    .from("profile")
    .delete()
    .eq("id", userId);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}