import { Header, Avatar, InputText } from "@snowball-tech/fractal";
import { ChevronDown } from "lucide-react";
import AdminSidebar from "@/components/admin-sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen w-full bg-fractal-bg-body-default font-sans text-fractal-text-default overflow-hidden">

      {/* TOP HEADER */}
      <div className="@container w-full bg-fractal-brand-primary border-b-2 border-fractal-border-default">
        <Header
          className="bg-transparent"
          left={
            <div className="flex items-center gap-2">
              <InputText placeholder="Search" />
            </div>
          }
          right={
            <div className="flex items-center gap-2 cursor-pointer">
              <Avatar size="s" />
              <ChevronDown size={16} className="ml-1" />
            </div>
          }
        />
      </div>

      {/* BOTTOM SECTION: Sidebar + Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />

        {/* MAIN PAGE CONTENT */}
        <main className="flex-1 p-4 overflow-y-auto">
          {children}
        </main>
      </div>

    </div>
  );
}