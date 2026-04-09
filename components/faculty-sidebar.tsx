"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Calendar, BookOpen, ClipboardList,
  LogOut, PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const NAV_ITEMS = [
  { href: "/faculty",         label: "Dashboard", icon: LayoutDashboard, exact: true  },
  { href: "/faculty/events",  label: "Events",    icon: Calendar,        exact: false },
  { href: "/faculty/courses", label: "I've GAD to Know",   icon: BookOpen,        exact: false },
  { href: "/faculty/surveys", label: "Surveys",   icon: ClipboardList,   exact: false },
];

function isActive(pathname: string, href: string, exact = false) {
  return exact ? pathname === href : pathname.startsWith(href);
}

function MobileNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around"
      style={{
        background: "var(--primary-dark)",
        borderTop:  "1px solid rgba(255,255,255,0.10)",
        padding:    "8px 4px",
        boxShadow:  "0 -4px 24px rgba(45,42,74,0.18)",
      }}
    >
      {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
        const active = isActive(pathname, href, exact);
        return (
          <Link
            key={href}
            href={href}
            className="relative flex flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 transition-all duration-200"
            style={{ background: active ? "rgba(255,255,255,0.12)" : "transparent" }}
          >
            {active && (
              <span
                className="absolute left-1/2 top-0 h-0.5 w-6 -translate-x-1/2 rounded-b-full"
                style={{ background: "var(--soft-pink)" }}
              />
            )}
            <Icon size={22} style={{ color: active ? "white" : "rgba(255,255,255,0.45)" }} />
            <span style={{ fontSize: 9, fontWeight: active ? 700 : 500, color: active ? "white" : "rgba(255,255,255,0.45)", lineHeight: 1, letterSpacing: "0.02em" }}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function FacultySidebar() {
  const pathname = usePathname();
  const router   = useRouter();

  const [open,        setOpen]        = useState(true);
  const [logoHovered, setLogoHovered] = useState(false);
  const [isMobile,    setIsMobile]    = useState(false);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setOpen(false);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (isMobile) return <MobileNav />;

  const state = open ? "expanded" : "collapsed";

  return (
    <aside
      data-state={state}
      className={[
        "group/sidebar relative shrink-0 hidden md:flex flex-col",
        "w-[--sidebar-width] data-[state=collapsed]:w-[--sidebar-width-icon]",
        "transition-[width] duration-200 ease-linear",
        "bg-[var(--primary-dark)] overflow-hidden md:pr-2",
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
              alt="UPB Kasarian"
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

          {/* title fades + clips via overflow on the sidebar itself */}
          <div
            className={[
              "flex flex-col justify-center overflow-hidden shrink-0",
              "w-[112px] opacity-100",
              "group-data-[state=collapsed]/sidebar:w-0 group-data-[state=collapsed]/sidebar:opacity-0",
              "transition-[width,opacity] duration-200 ease-linear",
            ].join(" ")}
          >
            <span className="caption-dark">UP BAGUIO</span>
            <span className="heading-sm-dark uppercase">Kasarian</span>
          </div>

          {/* collapse button */}
          <button
            onClick={() => setOpen(false)}
            aria-label="Collapse sidebar"
            className={[
              "shrink-0 flex items-center justify-center cursor-pointer border-none bg-transparent",
              "text-white/40 hover:text-white/90",
              "opacity-100 group-data-[state=collapsed]/sidebar:opacity-0 group-data-[state=collapsed]/sidebar:pointer-events-none",
              "transition-opacity duration-200 ease-linear",
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
                  "text-[13px] font-medium transition-colors duration-150",
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

        {/* logout ------------------------------------------------ */}
        <div className="shrink-0 flex flex-col gap-[2px] px-2 pb-2 pt-2 border-t border-white/[0.07]">
          <button
            onClick={() => router.push("/auth/login")}
            title={!open ? "Log out" : undefined}
            className={[
              "flex items-center w-full h-[38px] rounded-[10px]",
              "cursor-pointer border-none bg-transparent",
              "font-[var(--font-body)] text-[13px] text-white/35 hover:text-white/70 hover:bg-white/[0.06]",
              "justify-start pl-[10px] group-data-[state=collapsed]/sidebar:justify-center group-data-[state=collapsed]/sidebar:pl-0",
              "transition-[padding,justify-content,background-color,color] duration-200 ease-linear",
            ].join(" ")}
          >
            <LogOut size={17} className="shrink-0" />
            <span
              className={[
                "overflow-hidden shrink-0",
                "w-[140px] opacity-100",
                "group-data-[state=collapsed]/sidebar:w-0 group-data-[state=collapsed]/sidebar:opacity-0",
                "transition-[width,opacity] duration-200 ease-linear",
              ].join(" ")}
            >
              <span className="block truncate pl-[10px] whitespace-nowrap">Log out</span>
            </span>
          </button>
        </div>
    </aside>
  );
}