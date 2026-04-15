"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Calendar, Users, BookOpen, ClipboardList,
  LogOut, ArrowLeft, PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import UserMenu from "@/components/user-menu";
import { Button } from "./button";


// navigation ------------------------------------------------
const NAV_ITEMS = [
  { href: "/admin",         label: "Dashboard", icon: LayoutDashboard,          exact: true  },
  { href: "/admin/events",  label: "Events",    icon: Calendar,      exact: false },
  { href: "/admin/users",   label: "Users",     icon: Users,         exact: false },
  { href: "/admin/courses", label: "Guidelines",   icon: BookOpen,      exact: false },
  { href: "/admin/surveys", label: "Surveys",   icon: ClipboardList, exact: false },
];

const PAGE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  events:    "Events Management",
  users:     "Users Management",
  courses:   "Guidelines Management",
  surveys:   "Surveys Management",
};

function pathnameToNavId(pathname: string): string {
  const segment = pathname.replace(/^\/admin\/?/, "").split("/")[0];
  return segment === "" ? "dashboard" : segment;
}

function isActive(pathname: string, href: string, exact = false) {
  return exact ? pathname === href : pathname.startsWith(href);
}

// shell ------------------------------------------------------------------------------------------------
export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();

  const [open, setOpen] = useState(true);
  const [logoHovered, setLogoHovered] = useState(false);

  useEffect(() => {
    const check = () => { if (window.innerWidth < 768) setOpen(false); };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const activeId = pathnameToNavId(pathname);
  const isDashboard = activeId === "dashboard";
  const pageLabel = PAGE_LABELS[activeId] ?? activeId.charAt(0).toUpperCase() + activeId.slice(1);

  const state = open ? "expanded" : "collapsed";

  return (
    <div className="flex h-screen w-full p-2 bg-[var(--primary-dark)]">

      {/* outer card that hugs sidebar + content */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", flex: 1, overflow: "hidden", background: "var(--primary-dark)" }}>

      <aside
        data-state={state}
        className={[
          "group/sidebar relative z-10 flex-col shrink-0 flex",
          "bg-[var(--primary-dark)] overflow-hidden pr-2",
          "w-[--sidebar-width] data-[state=collapsed]:w-[--sidebar-width-icon]",
          "transition-[width] duration-200 ease-linear"
        ].join(" ")}
        style={{
          "--sidebar-width":      "224px",
          "--sidebar-width-icon": "64px",
        } as React.CSSProperties}
      >
        {/* logo ------------------------------------------------ */}
        <div className="flex shrink-0 items-center border-b border-white/[0.07] h-[70px] gap-[6px] overflow-hidden">
          <button
            onClick={() => !open && setOpen(true)}
            onMouseEnter={() => setLogoHovered(true)}
            onMouseLeave={() => setLogoHovered(false)}
            aria-label={open ? undefined : "Expand sidebar"}
            className="relative shrink-0 flex items-center justify-center rounded-[10px] border-none bg-transparent"
            style={{ width: 44, height: 44, cursor: open ? "default" : "pointer" }}
          >
            <Image
              src="/kasarian-upb-logo.svg"
              alt="Kasarian UP Baguio"
              width={44} height={44}
              style={{
                opacity: open ? 1 : logoHovered ? 0.22 : 1,
                transition: "opacity 200ms ease-out",
              }}
            />
            <span
              className="absolute inset-0 flex items-center justify-center text-white/75"
              style={{
                opacity: !open && logoHovered ? 1 : 0,
                transition: "opacity 200ms ease-out",
                pointerEvents: "none",
              }}
            >
              <PanelLeftOpen size={20} />
            </span>
          </button>

          <div
            className={[
              "flex flex-col justify-center overflow-hidden shrink-0",
              "w-[112px] opacity-100",
              "group-data-[state=collapsed]/sidebar:w-0 group-data-[state=collapsed]/sidebar:opacity-0",
              "transition-[width,opacity] duration-200 ease-linear",
            ].join(" ")}
          >
            <span className="caption-dark whitespace-nowrap">UP BAGUIO</span>
            <span className="heading-sm-dark uppercase whitespace-nowrap">Kasarian</span>
          </div>

          <button
            onClick={() => setOpen(false)}
            aria-label="Collapse sidebar"
            className={[
              "shrink-0 flex items-center justify-center cursor-pointer border-none bg-transparent",
              "text-white/40 hover:text-white/90",
              "opacity-100 group-data-[state=collapsed]/sidebar:opacity-0 group-data-[state=collapsed]/sidebar:pointer-events-none",
              "transition-opacity duration-200 ease-linear pr-1"
            ].join(" ")}
            style={{ marginLeft: "auto" }}
          >
            <PanelLeftClose size={18} />
          </button>
        </div>

        {/* nav ------------------------------------------------ */}
        <nav className="flex flex-col flex-1 gap-1 py-2 overflow-y-auto overflow-x-hidden">
          {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(pathname, href, exact);
            return (
              <Link
                key={href}
                href={href}
                title={!open ? label : undefined}
                className={[
                  "flex items-center w-full h-[40px] rounded-[10px]",
                  "justify-start px-1 group-data-[state=collapsed]/sidebar:justify-center group-data-[state=collapsed]/sidebar:px-0",
                  "text-[15px] font-medium transition-colors duration-150",
                  active
                    ? "bg-white/[0.18] text-white"
                    : "text-white/50 hover:bg-white/[0.08] hover:text-white/80",
                ].join(" ")}
              >
                <div className="w-[24px] flex justify-center shrink-0">
                  <Icon size={18} />
                </div>
                <span
                  className={[
                    "overflow-hidden",
                    "w-[140px] opacity-100",
                    "group-data-[state=collapsed]/sidebar:w-0 group-data-[state=collapsed]/sidebar:opacity-0",
                    "transition-[width,opacity] duration-200 ease-linear",
                  ].join(" ")}
                >
                  <span className="block truncate pl-[10px] whitespace-nowrap text-left">
                    {label}
                  </span>
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* main column ------------------------------------------------------------------------------------------------ */}
      <div style={{ position: "relative", display: "flex", flexDirection: "column", flex: 1, minWidth: 0, overflow: "hidden", background: "linear-gradient(145deg,#f5f3ff 0%,#fce8ee 35%,#f0eefd 65%,#faf8ff 100%)" }}>
        {/* blobs */}
        <div className="pointer-events-none absolute -top-28 right-14 w-[420px] h-[420px] rounded-full blur-[56px] opacity-20 bg-[var(--soft-pink)] z-0" />
        <div className="pointer-events-none absolute -bottom-16 left-20 w-[320px] h-[320px] rounded-full blur-[56px] opacity-[0.13] bg-[var(--periwinkle)] z-0" />

        {/* page header ------------------------------------------------ */}
        <header className="shrink-0 flex items-center justify-between gap-3 px-3 md:px-5 pt-2 pb-0.5" style={{ position: "relative", zIndex: 10 }}>
          <div className="flex items-center gap-2 min-w-0">
            {!isDashboard && (
              <Button variant="icon" onClick={() => router.back()} aria-label="Go back">
                <ArrowLeft size={16} />
              </Button>
            )}
            <h1 className="heading-lg truncate">{pageLabel}</h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <UserMenu />
          </div>
        </header>

        {/* scrollable content ------------------------------------------------ */}
        <main
          className="flex flex-col flex-1 min-h-0 overflow-y-auto px-3 md:px-5 pb-0 md:py-2"
          style={{ scrollbarGutter: "stable", position: "relative" }}
        >
          {children}
          <footer className="fixed bottom-0 mt-8 mb-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-[var(--gray)]/60 border-t border-black/[0.05] pt-3">
            <span className="flex flex-wrap items-center gap-x-1.5">
              <strong className="font-semibold text-[var(--primary-dark)]/60">Kasarian / Gender Studies UP Baguio</strong>
              <span className="opacity-30">·</span>
              <span>University of the Philippines Baguio</span>
              <span className="opacity-30">·</span>
              <span>kasarian.upbaguio@up.edu.ph</span>
              <span className="opacity-30">·</span>
            </span>
            <span className="flex items-center gap-3">
              <span>© {new Date().getFullYear()} UP Baguio</span>
            </span>
          </footer>
        </main>

      </div>

      </div>{/* end inner card */}
    </div>
  );
}