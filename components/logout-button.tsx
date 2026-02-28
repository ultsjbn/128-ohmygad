"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
    const supabase = createClient(); 

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push("/login");
      router.refresh();
    } else {
      console.error("Logout failed:", error.message);
    }
  };

  return <Button onClick={handleLogout}>Log out</Button>;
}