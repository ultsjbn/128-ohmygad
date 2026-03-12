/*
Reusable toast notification component.

Renders fixed-position notification bar at bottom-center of
viewport with success/error styling and an icon.

Currently used by:
app/admin/profile/page.tsx (profile save / avatar upload feedback)
*/

"use client";

import { CheckCircle2, AlertCircle } from "lucide-react";
export type ToastState = { type: "success" | "error"; message: string } | null;

interface ToastProps {
  toast: ToastState;
}

/*
fixed-position toast bar that appears at the bottom-center of the screen.
Shows a success (green) or error (red) message with a corresponding icon.

Used in:
app/admin/profile/page.tsx (success / error feedback after save)
*/
export default function Toast({ toast }: ToastProps) {
  if (!toast) return null;

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 py-3 rounded-full text-sm font-median border-1 border-fractal-border-default shadow-brutal-1 z-50 ${toast.type === "success"
        ? "bg-fractal-feedback-success-90 text-fractal-base-black"
        : "bg-fractal-feedback-error-90 text-fractal-base-black"
        }`}
    >
      {toast.type === "success"
        ? <CheckCircle2 size={15} className="text-fractal-icon-success" />
        : <AlertCircle size={15} className="text-fractal-icon-error" />}
      {toast.message}
    </div>
  );
}
