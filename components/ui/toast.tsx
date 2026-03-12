import React from "react";
import { Check, X, AlertCircle } from "lucide-react";

// variants
type ToastVariant = "success" | "error" | "info" | "warning";

// interface
interface ToastProps {
  variant: ToastVariant;
  title: string;
  message?: string;
}

// icons for each variant
const ICONS: Record<ToastVariant, React.ReactNode> = {
  success: <Check size={18} color="var(--success)"    />,
  error:   <X size={18} color="var(--error)"      />,
  info:    <AlertCircle size={18} color="var(--periwinkle)" />,
  warning: <AlertCircle size={18} color="var(--warning)"   />,
};

// component proper
export function Toast({ variant, title, message }: ToastProps) {
  return (
    <div className={`toast toast-${variant}`}>
      {ICONS[variant]}
      <div>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{title}</div>
        {message && <div className="caption">{message}</div>}
      </div>
    </div>
  );
}

/*
How to use this component?


*/