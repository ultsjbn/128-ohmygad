import DashboardPage from "@/components/shared/dashboard-page";
import RightPanel from "@/components/shared/right-panel";

export default function StudentDashboardPage() {
  return <DashboardPage rightPanel={<RightPanel />} />;
}