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

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);


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
        onClick={() => setIsOpen(!isOpen)}
      >
        <User
          size={16}
          className="ml-1 transition-transform"
        />
      </div>


      {mounted && isOpen && 
        createPortal(
        <div className="absolute right-0 top-full mt-2 w-48 z-[9999]">
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
      )}



    </div>
  );
}