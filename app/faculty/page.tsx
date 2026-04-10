import DashboardPage from "@/components/shared/dashboard-page";
// Added right panel from the student dashboard for uniformity
import RightPanel from "@/components/shared/right-panel";

export default function StudentDashboardPage() {
  return <DashboardPage role="faculty" rightPanel={<RightPanel />} />;
}