"use client";

import { Typography } from "@snowball-tech/fractal";
import { LayoutDashboard, Calendar, Users, BookOpen, ClipboardList, ChevronsLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/events", label: "Event Management", icon: Calendar, exact: false },
  { href: "/admin/users", label: "Users Management", icon: Users, exact: false },
  { href: "/admin/courses", label: "Courses Management", icon: BookOpen, exact: false },
  { href: "/admin/surveys", label: "Survey Management", icon: ClipboardList, exact: false },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <aside className="w-[260px] flex flex-col justify-between border-r-2 border-fractal-border-default bg-fractal-bg-body-default">
      <div>
        {/* LOGO SECTION */}
        <div className="flex flex-col items-center justify-center p-6 gap-3 mb-2">
          <Image
            src="/kasarian_logo.jpg"
            alt="UPB Kasarian Gender Studies Program Logo"
            width={80}
            height={80}
            className="rounded-full object-cover border-2 border-fractal-border-default shadow-brutal-1"
          />
          <Typography variant="heading-3" className="font-wide font-bold tracking-tighter">
            OhMyGAD!
          </Typography>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 p-1">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1 p-1 rounded-s font-median transition-all
                  ${active
                    ? "bg-fractal-bg-body-white border-2 border-fractal-border-default shadow-brutal-1 text-fractal-text-default"
                    : "border-2 border-transparent hover:bg-fractal-base-grey-90 text-fractal-text-placeholder hover:text-fractal-text-default"
                  }`}
              >
                <Icon size={20} className={active ? "text-fractal-text-default" : "text-fractal-text-placeholder"} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Collapse Button */}
      <div className="p-3 flex justify-end">
        <button className="p-2 hover:bg-fractal-base-grey-90 rounded-s transition-colors">
          <ChevronsLeft size={24} />
        </button>
      </div>
    </aside>
  );
}