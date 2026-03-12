import React from "react";

type ButtonVariant = "primary" | "pink" | "periwinkle" | "ghost" | "soft" | "icon" | "icon-dark";
type ButtonSize    = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const variantClass = variant === "icon-dark" ? "btn-icon-dark"
                     : variant === "icon"      ? "btn-icon"
                     : `btn-${variant}`;

  const sizeClass = size === "sm" ? "btn-sm"
                  : size === "lg" ? "btn-lg"
                  : "";

  const disabledClass = disabled ? "btn-disabled" : "";

  return (
    <button
      className={`btn ${variantClass} ${sizeClass} ${disabledClass} ${className}`.trim()}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

/*
How to use this component?


*/