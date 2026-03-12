"use client";

import React, { useState } from "react";
import { LogOut } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  id: string;
  Icon: LucideIcon;
  label: string;
}

interface SidebarProps {
  items: NavItem[];
  defaultActive?: string;
  expanded?: boolean;
  appName?: string;
  onNavigate?: (id: string) => void;
  onLogout?: () => void;
}

export function Sidebar({
  items,
  defaultActive,
  expanded = false,
  appName = "OhMyGAD!",
  onNavigate,
  onLogout,
}: SidebarProps) {
  const [active, setActive] = useState(defaultActive ?? items[0]?.id);

  function handleClick(id: string) {
    setActive(id);
    onNavigate?.(id);
  }

  if (expanded) {
    return (
      <div className="sidebar sidebar-expanded">
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 4px", marginBottom: 16 }}>
          <div style={{ width: 32, height: 32, background: "white", borderRadius: "var(--radius-sm)", flexShrink: 0 }} />
          <span style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "white" }}>
            {appName}
          </span>
        </div>

        {items.map(({ id, Icon, label }) => (
          <div
            key={id}
            className={`sidebar-item-expanded${active === id ? " active" : ""}`}
            onClick={() => handleClick(id)}
          >
            <Icon size={16} /> {label}
          </div>
        ))}

        <div style={{ marginTop: "auto" }}>
          <div className="sidebar-item-expanded" onClick={onLogout}>
            <LogOut size={16} /> Logout
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sidebar">
      <div style={{ width: 32, height: 32, background: "white", borderRadius: "var(--radius-sm)", marginBottom: 12 }} />

      {items.map(({ id, Icon }) => (
        <div
          key={id}
          className={`sidebar-item${active === id ? " active" : ""}`}
          onClick={() => handleClick(id)}
        >
          <Icon size={18} />
        </div>
      ))}

      <div style={{ marginTop: "auto" }}>
        <div className="sidebar-item" onClick={onLogout}>
          <LogOut size={18} />
        </div>
      </div>
    </div>
  );
}