// components/tabs/Tab.tsx
"use client";

import React, { forwardRef } from "react";
import { TabProps } from "./tabs.types";
import { useTabsContext } from "./tabs-context";
import { Typography } from "../typography";

const Tab = forwardRef<HTMLButtonElement, TabProps>(
  (
    {
      name,
      children,
      disabled: tabDisabled,
      icon,
      iconOnly,
      label,
      large,
      orientation: overrideOrientation,
      size: overrideSize,
      tabsPosition: overridePosition,
      withIndicator: overrideIndicator,
      className = "",
      ...restProps
    },
    ref,
  ) => {
    const context = useTabsContext();
    const isActive = context.activeTab === name;

    const isDisabled = tabDisabled || context.disabled;
    const orientation = overrideOrientation || context.orientation;
    const size = overrideSize || context.size;
    const variant = context.variant;
    const withIndicator = overrideIndicator ?? context.withIndicator;

    const isHorizontal = orientation === "horizontal";

    // size
    const sizeClasses = {
      large: "px-6 py-3 text-lg",
      medium: "px-4 py-2 text-base",
      small: "px-3 py-1.5 text-sm",
    }[size];

    const getStyles = () => {
      if (isDisabled)
        return "text-fractal-text-disabled cursor-not-allowed opacity-50";

      if (variant === "plain") {
        return isActive
          ? "bg-fractal-brand-primary text-fractal-text-dark border-2 border-fractal-border-default shadow-soft-sm translate-y-[-2px]"
          : "bg-white text-fractal-text-default border-2 border-transparent hover:border-fractal-border-default hover:bg-fractal-base-grey-90 hover:shadow-soft-sm transition-all";
      }

      if (variant === "transparent") {
        const activeClass = isActive
          ? "text-fractal-text-primary border-fractal-border-primary"
          : "text-fractal-text-placeholder border-transparent hover:text-fractal-text-default hover:border-fractal-border-default";

        const borderDir = withIndicator
          ? isHorizontal
            ? "border-b-4 -mb-[2px]"
            : "border-l-4 -ml-[2px]"
          : "";

        return `${activeClass} ${borderDir} transition-colors`;
      }
    };

    const baseClasses = [
      "font-median flex items-center justify-center gap-2 outline-none rounded-t-lg",
      sizeClasses,
      getStyles(),
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const content = label || children;

    return (
      <button
        ref={ref}
        role="tab"
        aria-selected={isActive}
        disabled={isDisabled}
        onClick={() => !isDisabled && context.setActiveTab(name)}
        className={baseClasses}
        {...restProps}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        {!iconOnly && content && <span>{content}</span>}
      </button>
    );
  },
);

Tab.displayName = "Tab";

export default Tab;
