"use client";

import {
    LayoutDashboard,
    CalendarDays,
    BookOpen,
    Users,
    LogOut,
} from "lucide-react";
import Link from "next/link";

const navItems = [
    { icon: LayoutDashboard, href: "/faculty/dashboard", label: "Dashboard", active: true },
    { icon: CalendarDays, href: "#", label: "Events" },
    { icon: BookOpen, href: "#", label: "Courses" },
    { icon: Users, href: "#", label: "Students" },
];

export function LeftSidebar() {
    return (
        <aside className="dashboard-left">
            <div className="nav-avatar" title="Profile">M</div>

            <div className="nav-divider">
                {navItems.map(({ icon: Icon, href, label, active }) => (
                    <Link key={label} href={href} title={label}>
                        <div className={`nav-item${active ? " active" : ""}`}>
                            <Icon size={18} strokeWidth={2} />
                        </div>
                    </Link>
                ))}
            </div>

            <div className="nav-bottom" title="Logout">
                <LogOut size={16} strokeWidth={2} />
            </div>
        </aside>
    );
}
