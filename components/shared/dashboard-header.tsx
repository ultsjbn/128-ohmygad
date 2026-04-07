"use client";

import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import UserMenu from "@/components/user-menu";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  basePath: string;
  pageLabels: Record<string, string>;
}

function pathnameToSegment(pathname: string, basePath: string): string {
  const segment = pathname.replace(new RegExp(`^${basePath}/?`), "").split("/")[0];
  return segment === "" ? "dashboard" : segment;
}

export default function DashboardHeader({ basePath, pageLabels }: DashboardHeaderProps) {
  const router   = useRouter();
  const pathname = usePathname();

  const activeId    = pathnameToSegment(pathname, basePath);
  const isDashboard = activeId === "dashboard";
  const pageLabel   = pageLabels[activeId] ?? activeId.charAt(0).toUpperCase() + activeId.slice(1);

  return (
    <header className="shrink-0 flex items-center justify-between gap-3 px-5 pt-2 pb-0 h-[78px]">
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex md:hidden items-center gap-2 shrink-0 mr-1">
          <Image src="/kasarian-upb-logo.svg" alt="UPB Kasarian" width={36} height={36} />
          <div className="flex flex-col justify-center">
            <span className="caption">UP BAGUIO</span>
            <span className="heading-sm uppercase">Kasarian</span>
          </div>
        </div>
        {!isDashboard && (
          <Button variant="icon" onClick={() => router.back()} aria-label="Go back">
            <ArrowLeft size={16} />
          </Button>
        )}
        <h1 className="heading-lg truncate hidden md:block">{pageLabel}</h1>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <UserMenu />
      </div>
    </header>
  );
}
