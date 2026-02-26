import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { EventsHub } from "@/components/dashboard/EventsHub";

export const metadata = {
    title: "Faculty Dashboard — OhMyGad",
    description: "Faculty events and course management dashboard",
};

export default function FacultyDashboardPage() {
    return (
        <>
            <DashboardHeader facultyName="Mary Chezka Ann" />
            <main className="dashboard-main">
                <EventsHub />
            </main>
        </>
    );
}
