"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar, Menu, MenuItem, MenuItemSeparator } from "@snowball-tech/fractal";
import { ChevronDown, User, Settings, LogOut } from "lucide-react";
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

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

  return (
    <div className="relative" ref={menuRef}>
      <div
        className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => setIsOpen(!isOpen)}
      >
        <User 
          size={16} 
          className={`ml-1 transition-transform ${isOpen ? "scale-100" : ""}`} 
        />
      </div>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 z-50">
          <Menu>
            <MenuItem
              icon={<User size={16} />}
              label="My Profile"
              onClick={() => {
                setIsOpen(false);
                router.push('/admin/profile');
              }}
            />
            <MenuItem
              icon={<Settings size={16} />}
              label="Settings"
              onClick={() => {
                setIsOpen(false);
                router.push('/admin/settings');
              }}
            />
            <MenuItemSeparator />
            <MenuItem
              icon={<LogOut size={16} />}
              label="Sign out"
              onClick={handleSignOut}
            />
          </Menu>
        </div>
      )}
    </div>
  );
}
