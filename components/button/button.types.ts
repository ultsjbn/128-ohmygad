import {
  AllHTMLAttributes,
  ReactNode,
  ElementType,
  MouseEvent,
  CSSProperties,
} from "react";

export type ButtonVariant = "display" | "primary" | "secondary" | "text";
export type ButtonIconPosition = "left" | "right";
export type ButtonIconOnlyOptions = boolean | "auto";
export type ButtonType = "button" | "reset" | "submit";

export interface ButtonProps extends Omit<
  AllHTMLAttributes<HTMLAnchorElement | HTMLButtonElement>,
  "label" | "onClick" | "wrap"
> {
  children?: ReactNode;
  disabled?: boolean;
  element?: ElementType;
  fullStyle?: boolean;
  fullWidth?: boolean;
  href?: string;
  icon?: ReactNode;
  iconHidden?: boolean;
  iconOnly?: ButtonIconOnlyOptions;
  iconPosition?: ButtonIconPosition;
  inlineStyle?: boolean;
  label?: ReactNode;
  target?: HTMLAnchorElement["target"];
  theme?: string;
  truncate?: boolean;
  type?: ButtonType;
  underlined?: boolean;
  variant?: ButtonVariant;
  wrap?: boolean;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  wrapperClassName?: string;
  wrapperStyles?: CSSProperties;
  disableClickTracking?: boolean;
  className?: string;
}
