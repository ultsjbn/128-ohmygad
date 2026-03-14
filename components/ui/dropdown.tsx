"use client";

import { useState } from "react";
import React from "react";

// DropdownItem
interface DropdownItemProps {
  icon?: React.ReactNode;
  children: React.ReactNode;
  danger?: boolean;
  onClick?: () => void;
}

export function DropdownItem({ icon, children, danger, onClick }: DropdownItemProps) {
  return (
    <div className={`dropdown-item${danger ? " danger" : ""}`} onClick={onClick}>
      {icon}
      {children}
    </div>
  );
}

export function DropdownDivider() {
  return <div className="dropdown-divider" />;
}

// Dropdown
interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
}

export function Dropdown({ trigger, children }: DropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="dropdown">
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div className="dropdown-menu" onMouseLeave={() => setOpen(false)}>
          {children}
        </div>
      )}
    </div>
  );
}

/*
How to use this component?


*/