/*
How to use this component?
 PROPS
  variant   "success"|"error"|"info"|"warning"               (required)
  title     string   - bold primary line                      (required)
  message   string   - optional secondary detail line
 
  VARIANTS AT A GLANCE
  success   green left border + check icon    - confirmation, saved state
  error     red left border + X icon          - failure, closed, rejected
  info      periwinkle left border + info     - neutral, reminder
  warning   yellow left border + alert icon   - caution
 
  SAMPLE USAGE
  // With message
  <Toast
    variant="success"
    title="Registration Successful"
    message="You've registered for Gender Sensitivity Orientation."
  />
  <Toast
    variant="error"
    title="Registration Closed"
    message="The deadline for this event has passed."
  />
  <Toast
    variant="info"
    title="Survey Pending"
    message="Complete the post-event survey for Pride Month Forum."
  />
  <Toast
    variant="warning"
    title="Almost Full"
    message="Only 3 slots remaining. Register soon!"
  />
 
  // title-only (no message)
  <Toast variant="success" title="Changes saved." />
  <Toast variant="error"   title="Something went wrong." />
 
  // render conditionally in a fixed container for real notifications
  {showToast && (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 999 }}>
      <Toast variant="success" title="Event created!" />
    </div>
  )}

*/


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