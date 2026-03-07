"use client";

import { useState, useEffect } from "react";
import { Typography } from '@/components/typography';
import { 
  LayoutDashboard, Calendar, Users, BookOpen, ClipboardList, 
  Settings, LogOut, ChevronLeft, ChevronRight 
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

// Integrated Tools directly into the flow so it sits right under Academics
const navGroups = [
  {
    label: "General",
    items: [
      { id: "dashboard", href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { id: "events", href: "/admin/events", label: "Events", icon: Calendar, exact: false },
      { id: "users", href: "/admin/users", label: "Users", icon: Users, exact: false },
    ]
  },
  {
    label: "Academics",
    items: [
      { id: "courses", href: "/admin/courses", label: "Courses", icon: BookOpen, exact: false },
      { id: "surveys", href: "/admin/surveys", label: "Surveys", icon: ClipboardList, exact: false },
    ]
  },
  {
    label: "Tools",
    items: [
      { id: "settings", href: "/admin/settings", label: "Settings", icon: Settings, exact: false },
      { id: "logout", href: "#logout", label: "Log out", icon: LogOut, exact: false, isAction: true },
    ]
  }
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
    if (href === "#logout") return false; // Prevent logout from being "active"
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <aside 
      className={`relative flex flex-col h-full bg-fractal-bg-body-dark rounded-[2.5rem] shadow-soft-lg transition-all duration-300 ease-in-out shrink-0 z-10
        ${isCollapsed ? "w-[88px]" : "w-[230px]"}
      `}
    >
      {/* floating toggle */}
      {!isMobile && (
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-16 flex items-center justify-center w-7 h-7 bg-fractal-bg-body-dark border-2 border-fractal-bg-body-default rounded-full text-gray-400 hover:text-white transition-colors z-50 shadow-soft-sm"
          aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      )}

      <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden py-8 px-2">
{/* LOGO SECTION */}
        <div className={` text-fractal-text-light flex items-center gap-3 mb-10 transition-all duration-300 ${isCollapsed ? "justify-center" : "px-2"}`}>
          <div className="shrink-0 bg-white p-0.5 rounded-xl">
            <Image
              src="/kasarian_logo.jpg"
              alt="UPB Kasarian"
              width={isCollapsed ? 32 : 36}
              height={isCollapsed ? 32 : 36}
              className="rounded-lg object-cover"
            />
          </div>
          
          {!isCollapsed && (
            <div className="flex flex-col text-fractal-text-light animate-in fade-in duration-300">
              <Typography variant="heading-4" className="text-white font-wide tracking-tight leading-none text-lg">
                OhMyGAD!
              </Typography>
            </div>
          )}
        </div>

        {/* NAVIGATION GROUPS */}
        <nav className="flex flex-col gap-6">
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="flex flex-col gap-1">
              {!isCollapsed && (
                <Typography variant="caption-median" className="px-3 mb-1 text-gray-500 tracking-wide text-[11px]">
                  {group.label}
                </Typography>
              )}

              {group.items.map(({ id, href, label, icon: Icon, exact, isAction }) => {
                const active = isActive(href, exact);
                
                // Shared styles for both Links and Buttons
                const itemClasses = `flex items-center rounded-2xl transition-all duration-200 group relative
                  ${isCollapsed ? "justify-center p-3" : "justify-start gap-3 py-2.5 px-3"}
                  ${active
                    ? "text-fractal-brand-primary font-median bg-white/5" 
                    : "text-gray-400 font-standard hover:text-white hover:bg-white/5" 
                  }`;

                const innerContent = (
                  <>
                    {active && !isCollapsed && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-fractal-brand-primary rounded-r-full shadow-[0_0_8px_var(--color-brand-primary)]" />
                    )}
                    {/* Thinner icon size (18) matches compact text */}
                    <Icon size={18} className={`shrink-0 transition-colors ${active ? "text-fractal-brand-primary" : "text-gray-400 group-hover:text-white"}`} />
                    {!isCollapsed && (
                      <span className="truncate whitespace-nowrap text-[13px]">{label}</span>
                    )}
                  </>
                );

                // Render as a button if it's the logout action
                if (isAction) {
                  return (
                    <button key={id} onClick={() => console.log("Logout clicked")} className={`${itemClasses} w-full`}>
                      {innerContent}
                    </button>
                  );
                }

                // Otherwise render as a standard Next.js Link
                return (
                  <Link key={id} href={href} title={isCollapsed ? label : ""} className={itemClasses}>
                    {innerContent}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

      </div>
    </aside>
  );
}