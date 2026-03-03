"use client";

import React, { useState, forwardRef } from "react";
import { TabsProps } from "./tabs.types";
import { TabsContext } from "./tabs-context";

const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      children,
      tabs,
      barClassName = "",
      defaultTab = "",
      dir = "ltr",
      disabled = false,
      fullWidth,
      label,
      large,
      orientation = "horizontal",
      tab: controlledTab,
      tabsPosition = "start",
      tabsSize = "small",
      variant = "plain",
      withIndicator = true,
      withSeparator = true,
      onTabChange,
      className = "",
      ...restProps
    },
    ref,
  ) => {
    const [internalTab, setInternalTab] = useState(defaultTab);
    const isControlled = controlledTab !== undefined;
    const activeTab = isControlled ? controlledTab : internalTab;

    const handleTabChange = (newTab: string) => {
      if (!isControlled) setInternalTab(newTab);
      onTabChange?.(newTab);
    };

    const isHorizontal = orientation === "horizontal";

    const containerClasses = [
      "flex",
      isHorizontal ? "flex-col" : "flex-row gap-4",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const barClasses = [
      "flex",
      isHorizontal ? "flex-row items-end" : "flex-col items-start",
      fullWidth && isHorizontal ? "w-full [&>*]:flex-1" : "",
      withSeparator && isHorizontal
        ? "border-b-2 border-fractal-border-default"
        : "",
      withSeparator && !isHorizontal
        ? "border-r-2 border-fractal-border-default"
        : "",
      tabsPosition === "end"
        ? isHorizontal
          ? "justify-end"
          : "justify-end"
        : "justify-start",
      barClassName,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <TabsContext.Provider
        value={{
          activeTab,
          setActiveTab: handleTabChange,
          variant,
          orientation,
          size: large ? "large" : tabsSize,
          withIndicator,
          disabled,
          tabsPosition,
        }}
      >
        <div
          ref={ref}
          className={containerClasses}
          dir={dir}
          aria-label={label}
          {...restProps}
        >
          {/* Tab Button List */}
          <div role="tablist" className={barClasses}>
            {tabs}
          </div>

          {/* Content Area */}
          <div className="flex-1 mt-4">{children}</div>
        </div>
      </TabsContext.Provider>
    );
  },
);

Tabs.displayName = "Tabs";

export default Tabs;
