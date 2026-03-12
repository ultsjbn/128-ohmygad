/*
Reusable form field wrapper and input class generator.

The `Field` component renders a uppercase label with an optional leading
icon, while `inputCls` generates the Tailwind class string for all
text inputs and selects.

Currently used by:
app/admin/profile/page.tsx (profile edit form fields)
*/

import React from "react";

interface FormFieldProps {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

/*
A form field wrapper that displays a label and an optional left-aligned
icon inside a relative container.

Used in:
app/admin/profile/page.tsx (every Personal / Professional / Identity field)
*/
export function FormField({ label, icon, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold uppercase tracking-widest text-fractal-base-grey-30">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-fractal-base-grey-50 pointer-events-none">
            {icon}
          </span>
        )}
        {children}
      </div>
    </div>
  );
}

/*
generate Tailwind class string for text inputs and selects.

Key for later use:
@param hasIcon – whether the input has a left icon (adds extra left padding)

Used in:
app/admin/profile/page.tsx (all `<input>` and `<select>` elements)
*/
export const inputCls = (hasIcon = true) =>
  [
    "w-full rounded-s border-1 border-fractal-border-default bg-fractal-bg-body-white",
    hasIcon ? "pl-9" : "pl-3",
    "pr-3 py-2 text-sm text-fractal-text-default placeholder:text-fractal-text-placeholder",
    "focus:outline-none focus:border-fractal-brand-primary focus:ring-2 focus:ring-fractal-brand-highlight",
    "disabled:bg-fractal-bg-disabled disabled:text-fractal-text-disabled disabled:border-fractal-border-disabled disabled:cursor-not-allowed",
    "transition appearance-none",
  ].join(" ");
