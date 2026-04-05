"use client";

import { useEffect, useState } from "react";
import { User, Settings, LogOut } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { Dropdown, DropdownItem, DropdownDivider } from "@/components/ui";

type Role = "admin" | "student" | "faculty";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function UserMenu() {
  const [role, setRole]     = useState<Role | null>(null);
  const [initials, setInitials] = useState("·");
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profile")
        .select("role, full_name")
        .eq("id", user.id)
        .single();

      if (profile?.role) setRole(profile.role as Role);

      const fullName = (profile?.full_name ?? "").trim();
      const parts = fullName.split(/\s+/).filter(Boolean);
      const derived = parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : fullName.slice(0, 2).toUpperCase();
      if (derived) setInitials(derived);
    }
    fetchUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const getProfilePath  = () => role ? `/${role}/profile`  : "/auth/login";
  const getSettingsPath = () => role ? `/${role}/settings` : "/auth/login";

  return (
    <Dropdown
      trigger={
        <button
          aria-label="User menu"
          className="w-6 h-6 bg-[var(--primary-dark)] rounded-full flex items-center justify-center cursor-pointer transition-all duration-150 border-none text-white text-[11px] font-bold tracking-tight select-none hover:opacity-80 shrink-0">
          {initials}
        </button>
      }
    >
      <DropdownItem icon={<User size={15} />} onClick={() => router.push(getProfilePath())}>
        My Profile
      </DropdownItem>

      <DropdownItem icon={<Settings size={15} />} onClick={() => router.push(getSettingsPath())}>
        Settings
      </DropdownItem>

      <DropdownDivider />

      <DropdownItem icon={<LogOut size={15} />} danger onClick={handleSignOut}>
        Sign out
      </DropdownItem>
    </Dropdown>
  );
}
