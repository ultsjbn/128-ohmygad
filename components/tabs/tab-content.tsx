"use client";

import React, { forwardRef } from "react";
import { TabContentProps } from "./tabs.types";
import { useTabsContext } from "./tabs-context";

const TabContent = forwardRef<HTMLDivElement, TabContentProps>(
  ({ children, name, forceMount, className = "", ...restProps }, ref) => {
    const { activeTab } = useTabsContext();
    const isActive = activeTab === name;

    if (!isActive && !forceMount) return null;

    return (
      <div
        ref={ref}
        role="tabpanel"
        hidden={!isActive}
        className={`animate-in fade-in duration-300 ${className}`}
        {...restProps}
      >
        {children}
      </div>
    );
  },
);

TabContent.displayName = "TabContent";

export default TabContent;
