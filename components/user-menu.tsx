"use client";

import { useState, useRef, useEffect } from "react";
import { Menu, MenuItem, MenuItemSeparator } from "@snowball-tech/fractal";
import { User, Settings, LogOut } from "lucide-react";
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { createPortal } from "react-dom";


type Role = 'admin' | 'student' | 'faculty';



export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState<Role | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [position, setPosition] = useState({ top: 0, left: 0 });



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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setIsOpen(false);
    await supabase.auth.signOut();
    window.location.href = '/auth/login';
  };

  const getProfilePath = () => role ? `/${role}/profile` : '/auth/login';
  const getSettingsPath = () => role ? `/${role}/settings` : '/auth/login';

  return (
    <div className="relative" ref={menuRef}>
      <div
        className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        
        onClick={() => {
          if (menuRef.current) {
          const rect = menuRef.current.getBoundingClientRect();

    setPosition({
      top: rect.bottom + 8,
      left: rect.right - 192
    });
  }

  setIsOpen(!isOpen);
}}
      >
        <User
          size={16}
          className="ml-1 transition-transform"
        />
      </div>


      {isOpen && typeof window !== "undefined" &&
  createPortal(
      <div
      style={{
        position: "fixed",
        top: position.top,
        left: position.left
      }}
      className="w-48 z-[9999]"
      >
      <Menu>
        <MenuItem
          icon={<User size={16} />}
          label="My Profile"
          onClick={() => {
            setIsOpen(false);
            router.push(getProfilePath());
          }}
        />
        <MenuItem
          icon={<Settings size={16} />}
          label="Settings"
          onClick={() => {
            setIsOpen(false);
            router.push(getSettingsPath());
          }}
        />
        <MenuItemSeparator />
        <MenuItem
          icon={<LogOut size={16} />}
          label="Sign out"
          onClick={handleSignOut}
        />
      </Menu>
    </div>,
    document.body
  )
}



    </div>
  );
}