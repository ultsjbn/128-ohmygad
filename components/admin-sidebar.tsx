"use client";

import { useState, useEffect } from "react";
import { Typography } from '@/components/typography';
import { LayoutDashboard, Calendar, Users, BookOpen, ClipboardList, ChevronsLeft, ChevronsRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/events", label: "Events", icon: Calendar, exact: false },
  { href: "/admin/users", label: "Users", icon: Users, exact: false },
  { href: "/admin/courses", label: "Courses", icon: BookOpen, exact: false },
  { href: "/admin/surveys", label: "Surveys", icon: ClipboardList, exact: false },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    };

    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <aside 
      className={`flex flex-col h-full border-r-2 border-fractal-border-default bg-fractal-bg-body-default transition-all duration-300 ease-in-out shrink-0
        ${isCollapsed ? "w-[80px]" : "w-[260px]"}
      `}
    >
      <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        
        {/* LOGO SECTION */}
        <div className="flex flex-col items-center justify-center p-2 gap-1 mb-1 mt-2 transition-all duration-300">
          <Image
            src="/kasarian_logo.jpg"
            alt="UPB Kasarian Gender Studies Program Logo"
            width={isCollapsed ? 48 : 80}
            height={isCollapsed ? 48 : 80}
            className="rounded-full object-cover border-2 border-fractal-border-default shadow-brutal-1 transition-all duration-300"
          />
          
          {!isCollapsed && (
            <div className="flex flex-col items-center mt-2 animate-in fade-in duration-300">
              <Typography variant="heading-3" className="font-wide font-bold tracking-tighter text-center">
                OhMyGAD!
              </Typography>
              <Typography variant="caption-median" className="text-center mt-1">
                UPB Kasarian Gender Studies Program <br/> Event Management Platform
              </Typography>
            </div>
          )}
        </div>

        {/* NAVIGATION */}
        <nav className="flex flex-col gap-1 p-2 mt-2">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                title={isCollapsed ? label : ""}
                className={`flex items-center rounded-s font-median transition-all duration-100
                ${isCollapsed ? "justify-center p-1.5" : "justify-start gap-2 py-1 px-2"}
                ${active
                  ? "bg-fractal-bg-body-white border-2 border-fractal-border-default shadow-brutal-1 text-fractal-text-default"
                  : "border-2 border-transparent text-fractal-text-placeholder hover:bg-fractal-bg-body-white hover:border-fractal-border-default hover:shadow-brutal-1 hover:text-fractal-text-default hover:opacity-70"
                }`}
              >
                <Icon size={20} className={`shrink-0 ${active ? "text-fractal-text-default" : "text-fractal-text-placeholder"}`} />
                
                {!isCollapsed && (
                  <span className="truncate whitespace-nowrap">{label}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* PINNED COLLAPSE BUTTON */}
      <div className={`p-3 shrink-0 flex ${isCollapsed ? "justify-center" : "justify-end"}`}>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 hover:bg-fractal-base-grey-90 rounded transition-colors"
          aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronsRight size={24} /> : <ChevronsLeft size={24} />}
        </button>
      </div>
    </aside>
  );
}