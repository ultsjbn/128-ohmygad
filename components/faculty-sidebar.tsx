"use client";

import { useState, useEffect } from "react";
import {
  LayoutDashboard, Calendar, BookOpen,
  ClipboardList, ChevronsLeft, ChevronsRight,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/faculty",         label: "Dashboard", icon: LayoutDashboard, exact: true  },
  { href: "/faculty/events",  label: "Events",    icon: Calendar,        exact: false },
  { href: "/faculty/courses", label: "Courses",   icon: BookOpen,        exact: false },
  { href: "/faculty/surveys", label: "Surveys",   icon: ClipboardList,   exact: false },
];

export default function FacultySidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile]       = useState(false);

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
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  if (isMobile) {
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
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className="relative flex flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 transition-all duration-200"
              style={{ background: active ? "rgba(255,255,255,0.12)" : "transparent" }}
            >
              {active && (
                <span className="absolute left-1/2 top-0 h-0.5 w-6 -translate-x-1/2 rounded-b-full"
                  style={{ background: "var(--soft-pink)" }} />
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

  return (
    <aside
      style={{
        width:         isCollapsed ? 72 : 240,
        minWidth:      isCollapsed ? 72 : 240,
        background:    "var(--primary-dark)",
        display:       "flex",
        flexDirection: "column",
        alignSelf:     "stretch",
        padding:       isCollapsed ? "20px 0" : "20px 16px",
        gap:           8,
        borderRadius:  "0 var(--radius-xl) var(--radius-xl) 0",
        transition:    "width 0.3s ease, min-width 0.3s ease, padding 0.3s ease",
        overflow:      "hidden",
        flexShrink:    0,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", flex: 1, overflowY: "auto", overflowX: "hidden", width: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", paddingBottom: 20, paddingTop: 20, marginBottom: 8, borderBottom: "1px solid rgba(255,255,255,0.10)" }}>
          <Image
            src="/kasarian_logo.jpg"
            alt="UPB Kasarian Gender Studies Program Logo"
            width={isCollapsed ? 40 : 72}
            height={isCollapsed ? 40 : 72}
            style={{ borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,0.25)", transition: "all 0.3s ease" }}
          />
          {!isCollapsed && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 8 }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "white", letterSpacing: "-0.02em", textAlign: "center" }}>
                OhMyGAD!
              </span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", textAlign: "center", marginTop: 3, lineHeight: 1.4, maxWidth: 200 }}>
                UPB Kasarian Gender Studies Program <br/> Event Management Platform
              </span>
            </div>
          )}
        </div>

        <nav style={{ display: "flex", flexDirection: "column", alignItems: isCollapsed ? "center" : "stretch", gap: 2, width: "100%", flex: 1 }}>
          {!isCollapsed && (
            <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.10em", padding: "4px 14px 8px" }}>
              Menu
            </span>
          )}
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                title={isCollapsed ? label : ""}
                className={`sidebar-item${isCollapsed ? "" : "-expanded"}${active ? " active" : ""}`}
              >
                <Icon size={isCollapsed ? 20 : 18} />
                {!isCollapsed && <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: isCollapsed ? "center" : "stretch", gap: 2, borderTop: "1px solid rgba(255,255,255,0.10)", paddingTop: 8, marginTop: 8 }}>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`sidebar-item${isCollapsed ? "" : "-expanded"}`}
          style={{ background: "none", border: "none", cursor: "pointer" }}
          aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronsRight size={20} /> : <><ChevronsLeft size={18} /><span>Collapse</span></>}
        </button>
      </div>
    </aside>
  );
}