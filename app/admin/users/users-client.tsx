"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, ArrowUpDown, UserPlus } from "lucide-react";
import { Button } from "@/components/button";
import { InputText } from "@snowball-tech/fractal";
import { Typography } from "@/components/typography";
import { Tabs, Tab, TabContent } from "@/components/tabs";
import type { Profile, SortState } from "./profile.types";
import { sortProfiles, paginate, totalPages } from "./profile.utils";
import { PER_PAGE } from "@/components/profile.constants";
import { TableSection, type TableSectionProps } from "@/components/table-section";


type TabKey = "all" | "admin" | "faculty" | "student";

interface UsersClientProps {
  initialProfiles: Profile[];
  fetchError: string | null;
}

export const UsersClient = ({ initialProfiles, fetchError }: UsersClientProps) => {
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [sort, setSort] = useState<SortState>({ field: "created_at", direction: "desc" });

  const filtered = useMemo(() => {
    let result = initialProfiles;
    if (activeTab !== "all")
      result = result.filter((p) => p.role?.toLowerCase() === activeTab);
    return sortProfiles(result, sort.field, sort.direction);
  }, [initialProfiles, sort, activeTab]);

  const paginatedProfiles = paginate(filtered, page, PER_PAGE);
  const pageCount = totalPages(filtered.length, PER_PAGE);
  const rangeStart = Math.min((page - 1) * PER_PAGE + 1, filtered.length);
  const rangeEnd = Math.min(page * PER_PAGE, filtered.length);

  const handleTabChange = (tab: string) => { setActiveTab(tab as TabKey); setPage(1); };
  const handleSort = (field: SortState["field"]) => {
    setSort((prev) => ({ field, direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc" }));
    setPage(1);
  };

  const tableSectionProps: TableSectionProps = {
    profiles: paginatedProfiles, filtered, page, pageCount,
    rangeStart, rangeEnd, sort, fetchError,
    onSort: handleSort, onPageChange: setPage,
  };

  return (
    <div className="flex flex-col gap-4 p-2 min-h-screen bg-fractal-bg-body-light">
      <div className="flex flex-col gap-1">
        <Typography variant="heading-2">Users Management</Typography>
        <p className="text-sm text-fractal-text-default">{initialProfiles.length} total users</p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <InputText placeholder="Search by name, email or role..." fullWidth prefix={<Search size={18} />} />
        <div className="flex items-center gap-2 shrink-0">
          <Button label="Sort" variant="display" icon={<ArrowUpDown size={18} />} iconPosition="left" onClick={() => {}} />
          <Button label="Filter" variant="display" icon={<SlidersHorizontal size={18} />} iconPosition="left" onClick={() => {}} />
          <Button label="Add User" variant="primary-dark" icon={<UserPlus size={18} />} iconPosition="left" onClick={() => {}} />
        </div>
      </div>

      <Tabs defaultTab="all" variant="transparent" onTabChange={handleTabChange}
        tabs={<><Tab name="all" label="All Users" /><Tab name="student" label="Students" /><Tab name="faculty" label="Faculty" /><Tab name="admin" label="Admin" /></>}
      >
        <TabContent name="all"><TableSection {...tableSectionProps} /></TabContent>
        <TabContent name="student"><TableSection {...tableSectionProps} /></TabContent>
        <TabContent name="faculty"><TableSection {...tableSectionProps} /></TabContent>
        <TabContent name="admin"><TableSection {...tableSectionProps} /></TabContent>
      </Tabs>
    </div>
  );
};