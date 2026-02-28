import { Header, Avatar} from "@snowball-tech/fractal";
import { Search, LayoutDashboard, Calendar, Users, BookOpen, ClipboardList, ChevronsLeft, ChevronDown } from "lucide-react";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen w-full bg-[#FCFAF6] font-sans text-black overflow-hidden">
      
      {/* TOP HEADER */}
      <div className="@container w-full border-b-[3px] border-black bg-[#F49CE1]">
        <Header className="h-[72px] px-6 bg-transparent"
          /* LEFT: Logo area */
          left={
            <div className="flex items-center gap-2 font-black text-2xl tracking-tighter">
              <span className="text-xl">⚪</span>
              CMSC128
            </div>
          }
          
          /* RIGHT: User Profile */
          right={
            <div className="flex items-center gap-2 cursor-pointer">
              <Avatar size="m" /> 
              <ChevronDown size={16} className="ml-1" />
            </div>
          }
        >
          {/* CHILDREN (MIDDLE): Search Bar */}
          <div className="w-full max-w-[500px] mx-auto flex items-center relative">
            <Search size={18} className="absolute left-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search for something" 
              className="w-full pl-11 pr-4 py-2 bg-white border-[2px] border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            />
          </div>
        </Header>
      </div>

      {/* BOTTOM SECTION: Sidebar + Main Content */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* SIDEBAR */}
        <aside className="w-[260px] flex flex-col justify-between border-r-[3px] border-black bg-[#FCFAF6]">
          <div>
            {/* Navigation */}
            <nav className="flex flex-col gap-2 p-4 font-medium text-[15px]">
              <Link href="/admin" className="flex items-center gap-3 p-3 bg-white border-[2px] border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <LayoutDashboard size={20} />
                Dashboard
              </Link>
              <Link href="/admin/events" className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg transition-colors">
                <Calendar size={20} />
                Event Management
              </Link>
              <Link href="/admin/users" className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg transition-colors">
                <Users size={20} />
                Users Management
              </Link>
              <Link href="/admin/courses" className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg transition-colors">
                <BookOpen size={20} />
                Courses Management
              </Link>
              <Link href="/admin/surveys" className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg transition-colors">
                <ClipboardList size={20} />
                Survey Management
              </Link>
            </nav>
          </div>

          {/* Collapse Button */}
          <div className="p-6 flex justify-end">
            <button className="p-2 hover:bg-gray-200 rounded-md transition-colors">
              <ChevronsLeft size={24} />
            </button>
          </div>
        </aside>

        {/* MAIN PAGE CONTENT */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>

      </div>
    </div>
  );
}