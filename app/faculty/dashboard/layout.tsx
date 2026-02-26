import "./faculty-dashboard.css";
import { LeftSidebar } from "@/components/dashboard/LeftSidebar";
import { RightSidebar } from "@/components/dashboard/RightSidebar";
import { DashboardFooter } from "@/components/dashboard/DashboardFooter";

export default function FacultyDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="dashboard-shell">
            <LeftSidebar />
            {children}
            <RightSidebar />
            <DashboardFooter />
        </div>
    );
}
