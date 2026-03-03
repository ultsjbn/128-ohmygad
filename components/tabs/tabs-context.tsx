"use client";

import { createContext, useContext } from "react";
import {
  TabsOrientation,
  TabsPosition,
  TabsSize,
  TabsVariant,
} from "./tabs.types";

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  variant: TabsVariant;
  orientation: TabsOrientation;
  size: TabsSize;
  withIndicator: boolean;
  disabled: boolean;
  tabsPosition: TabsPosition;
}

export const TabsContext = createContext<TabsContextValue | null>(null);

export const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("Tab components must be used within a Tabs provider");
  }
  return context;
};