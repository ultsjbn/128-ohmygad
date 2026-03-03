"use client";

import React, { forwardRef } from "react";
import { ButtonProps } from "./button.types";
import { Typography } from "../typography";

const Button = forwardRef<
  HTMLElement | HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(
  (
    {
      children,
      disabled = false,
      element,
      fullStyle,
      fullWidth,
      href,
      icon,
      iconHidden,
      iconOnly,
      iconPosition = "left",
      inlineStyle,
      label,
      target,
      theme,
      truncate,
      type = "button",
      underlined,
      variant = "primary", // Default based on Button.constants.d.ts
      wrap,
      onClick,
      wrapperClassName = "",
      wrapperStyles,
      disableClickTracking,
      className = "",
      ...restProps
    },
    ref,
  ) => {
    // if href exists, default to a otherwise button, unless element is passed
    const Component = element || (href ? "a" : "button");

    const getVariantClasses = (v: string, isDisabled: boolean) => {
      if (isDisabled) {
        return "bg-fractal-bg-disabled text-fractal-text-disabled border-fractal-border-disabled shadow-none cursor-not-allowed";
      }

      switch (v) {
        case "display":
          return "bg-fractal-brand-primary text-fractal-text-dark border-2 border-fractal-border-default shadow-brutal-1 hover:-translate-y-[2px] hover:shadow-brutal-2 active:translate-y-[4px] active:shadow-none";

        case "secondary":
          return "bg-white text-fractal-text-default border-2 border-fractal-border-default shadow-brutal-1 hover:bg-fractal-base-grey-90 transition-all active:translate-y-[2px] active:shadow-none";

        case "text":
          return "bg-transparent border-transparent text-fractal-text-default hover:bg-fractal-base-grey-90 shadow-none hover:underline underline-offset-4";

        case "primary":
        default:
          return "bg-fractal-brand-secondary text-fractal-text-light border-2 border-fractal-border-default hover:bg-fractal-bg-body-light hover:text-fractal-text-dark hover:shadow-none transition-colors active:bg-fractal-brand-primary active:text-fractal-text-dark active:shadow-none";
      }
    };

    const baseClasses = [
      "inline-flex items-center justify-center font-median px-4 py-2 rounded-full gap-2",
      getVariantClasses(variant, disabled),
      fullWidth || fullStyle ? "w-full flex" : "inline-flex",
      inlineStyle ? "inline" : "",
      truncate ? "truncate" : "",
      underlined ? "underline underline-offset-4" : "",
      wrap ? "whitespace-normal" : "whitespace-nowrap",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const content = label || children;
    const showIcon = icon && !iconHidden;
    const showText = !iconOnly;

    return (
      <Component
        ref={ref as any}
        href={disabled ? undefined : href}
        target={target}
        type={Component === "button" ? type : undefined}
        disabled={disabled}
        onClick={disabled ? undefined : onClick}
        className={baseClasses}
        {...restProps}
      >
        {showIcon && iconPosition === "left" && (
          <span className="shrink-0">{icon}</span>
        )}

        {showText && content && (
          <span className={truncate ? "truncate" : ""}>{content}</span>
        )}

        {showIcon && iconPosition === "right" && (
          <span className="shrink-0">{icon}</span>
        )}
      </Component>
    );
  },
);

Button.displayName = "Button";

export default Button;
