/*
How to use this component?
  COMPOSITION PATTERN
  <Dropdown trigger={…}>
    <DropdownItem icon={…}>Label</DropdownItem>
    <DropdownDivider />
    <DropdownItem danger>Destructive action</DropdownItem>
  </Dropdown>

Dropdown

  PROPS 
  trigger   ReactNode   — element that opens the menu on click (required)
                          usually a <Button>
  children  ReactNode   — DropdownItem / DropdownDivider nodes (required)
 
  BEHAVIOUR
    Opens on trigger click, closes when mouse leaves the menu.

DropdownItem 

  PROPS
  children  ReactNode           — item label text             (required)
  icon      ReactNode           — Lucide icon on the left
  danger    boolean             — red text / destructive style default false
  onClick   () => void          — click handler
 
DropdownDivider  
  No props. Renders a horizontal rule between groups of items.
 
SAMPLE USAGE  
  import { Eye, Pencil, Users, Trash2, Filter } from "lucide-react";
 
  // Action menu on an event row
  <Dropdown trigger={<Button variant="primary">Actions <Filter size={14}/></Button>}>
    <DropdownItem icon={<Eye size={15}/>} onClick={() => viewEvent(id)}>
      View Details
    </DropdownItem>
    <DropdownItem icon={<Pencil size={15}/>} onClick={() => editEvent(id)}>
      Edit Event
    </DropdownItem>
    <DropdownItem icon={<Users size={15}/>} onClick={() => viewRegistrants(id)}>
      View Registrants
    </DropdownItem>
    <DropdownDivider />
    <DropdownItem icon={<Trash2 size={15}/>} danger onClick={() => cancelEvent(id)}>
      Cancel Event
    </DropdownItem>
  </Dropdown>
 
  // Export menu
  <Dropdown trigger={<Button variant="ghost">Export ▾</Button>}>
    <DropdownItem icon={<Download size={15}/>} onClick={exportCSV}>Export as CSV</DropdownItem>
    <DropdownItem icon={<Download size={15}/>} onClick={exportPDF}>Export as PDF</DropdownItem>
  </Dropdown>
 */

"use client";

import { useState } from "react";
import React from "react";

//  DropdownItem 
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

//  Dropdown 
interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
}

export function Dropdown({ trigger, children }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  // close on outside click so menu never stays open. pushes layout also
  React.useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  return (
    <div className="dropdown" ref={ref}>
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div
          className="dropdown-menu"
          style={{ left: "auto", right: 0, width: "max-content", maxWidth: "min(260px, 90vw)" }}
        >
          {children}
        </div>
      )}
    </div>
  );
}