"use client";

import { Header, Avatar, InputText, Typography } from "@snowball-tech/fractal";
import {LayoutDashboard, Calendar, Users, BookOpen, ClipboardList, ChevronsLeft, ChevronDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen w-full bg-fractal-bg-body-default font-sans text-fractal-text-default overflow-hidden">
      
      {/* TOP HEADER */}
      <div className="@container w-full bg-fractal-brand-primary border-b-2 border-fractal-border-default">
        <Header className="bg-transparent"
          left={
            <div className="flex items-center gap-2">
              <InputText defaultValue="Search" />
            </div>
          }
          /* RIGHT: User Profile */
          right={
            <div className="flex items-center gap-2 cursor-pointer">
              <Avatar size="s" /> 
              <ChevronDown size={16} className="ml-1" />
            </div>
          }
        > 
        </Header>
      </div>

      {/* BOTTOM SECTION: Sidebar + Main Content */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* SIDEBAR */}
        <aside className="w-[260px] flex flex-col justify-between border-r-2 border-fractal-border-default bg-fractal-bg-body-default">
          <div>
            {/* LOGO SECTION */}
            <div className="flex flex-col items-center justify-center p-6 gap-3 mb-2">
              <Image 
                src="/kasarian_logo.jpg"
                alt="UPB Kasarian Gender Studies Program Logo" 
                width={80} 
                height={80} 
                className="rounded-full object-cover border-2 border-fractal-border-default shadow-brutal-1"
              />
              <Typography variant="heading-3" className="font-wide font-bold tracking-tighter">
                OhMyGAD!
              </Typography>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-1 p-1 font-median">
              <Link href="/admin" className="flex items-center gap-3 p-2 bg-fractal-bg-body-white hover:bg-fractal-decorative-yellow-90 border-2 border-fractal-border-default rounded-s shadow-brutal-1 transition-colors">
                <LayoutDashboard size={20} />
                Dashboard
              </Link>
              <Link href="/admin/events" className="flex items-center gap-3 p-2 hover:bg-fractal-base-grey-90 rounded-s transition-colors">
                <Calendar size={20} />
                Event Management
              </Link>
              <Link href="/admin/users" className="flex items-center gap-3 p-2 hover:bg-fractal-base-grey-90 rounded-s transition-colors">
                <Users size={20} />
                Users Management
              </Link>
              <Link href="/admin/courses" className="flex items-center gap-3 p-2 hover:bg-fractal-base-grey-90 rounded-s transition-colors">
                <BookOpen size={20} />
                Courses Management
              </Link>
              <Link href="/admin/surveys" className="flex items-center gap-3 p-2 hover:bg-fractal-base-grey-90 rounded-s transition-colors">
                <ClipboardList size={20} />
                Survey Management
              </Link>
            </nav>
          </div>

          {/* Collapse Button */}
          <div className="p-3 flex justify-end">
            <button className="p-2 hover:bg-fractal-base-grey-90 rounded-s transition-colors">
              <ChevronsLeft size={24} />
            </button>
          </div>
        </aside>

        {/* MAIN PAGE CONTENT */}
        <main className="flex-1 p-4 overflow-y-auto">
          {children}
        </main>

      </div>
    </div>
  );
}