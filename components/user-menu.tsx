"use client";

import { useEffect, useState } from "react";
import { User, Settings, LogOut } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { Dropdown, DropdownItem, DropdownDivider } from "@/components/ui";

type Role = "admin" | "student" | "faculty";

export default function UserMenu() {
  const [role, setRole] = useState<Role | null>(null);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function fetchRole() {
      const { data: { user } } = await supabase.auth.getUser();
      const userRole = user?.app_metadata?.role as Role | undefined;
      if (userRole) setRole(userRole);
    }
    fetchRole();
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
          className="w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-all border-none bg-[rgba(45,42,74,0.08)] hover:bg-[var(--lavender)]"
          style={{ color: "var(--primary-dark)" }}
        >
          <User size={16} />
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