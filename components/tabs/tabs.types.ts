import { AllHTMLAttributes, ReactNode } from "react";

export type TabsVariant = "plain" | "transparent";
export type TabsOrientation = "horizontal" | "vertical";
export type TabsPosition = "start" | "end";
export type TabsSize = "large" | "medium" | "small";

export interface TabsProps extends Omit<
  AllHTMLAttributes<HTMLDivElement>,
  "defaultValue" | "dir" | "value"
> {
  children: ReactNode;
  tabs: ReactNode;
  barClassName?: string;
  defaultTab?: string;
  dir?: "ltr" | "rtl";
  disabled?: boolean;
  fullWidth?: boolean;
  label?: string;
  large?: boolean;
  orientation?: TabsOrientation;
  tab?: string;
  tabsPosition?: TabsPosition;
  tabsSize?: TabsSize;
  variant?: TabsVariant;
  withIndicator?: boolean;
  withSeparator?: boolean;
  onTabChange?: (newTab: string) => void;
}

export interface TabProps extends Omit<
  AllHTMLAttributes<HTMLButtonElement>,
  "label" | "size" | "type" | "value"
> {
  name: string;
  children?: ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
  iconOnly?: boolean;
  label?: ReactNode;
  large?: boolean;
  orientation?: TabsOrientation;
  size?: TabsSize;
  tabsPosition?: TabsPosition;
  withIndicator?: boolean;
}

export interface TabContentProps extends Omit<
  AllHTMLAttributes<HTMLDivElement>,
  "value"
> {
  children: ReactNode;
  name: string;
  forceMount?: boolean;
}
