/*
How to use this component?
 PROPS
  open      boolean       - controls visibility               (required)
  onClose   () => void    - called when backdrop or × clicked (required)
  title     string        - bold heading inside the modal
  subtitle  string        - muted caption line below title
  children  ReactNode     - modal body content               (required)
  footer    ReactNode     - bottom action area (usually buttons)
 
  BEHAVIOUR
    renders nothing when open=false.
    clicking the backdrop calls onClose.
    clicking inside the modal does not propagate to the backdrop.
    x button always calls onClose.
 
  SAMPLE USAGE
  // 1. Manage open state in the parent
  const [open, setOpen] = useState(false);
 
  // 2. Trigger button
  <Button onClick={() => setOpen(true)}>Register</Button>
 
  // 3. Modal with form body + footer buttons
  <Modal
    open={open}
    onClose={() => setOpen(false)}
    title="Register for Event"
    subtitle="Gender Sensitivity Orientation · Mar 15, 2025"
    footer={
      <div style={{ display: "flex", gap: 10 }}>
        <Button variant="ghost" style={{ flex: 1 }} onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button variant="primary" style={{ flex: 1 }} onClick={handleSubmit}>
          Confirm
        </Button>
      </div>
    }
  >
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Input label="Full Name"  value={name}  onChange={e => setName(e.target.value)} />
      <Input label="Student ID" value={sid}   onChange={e => setSid(e.target.value)} />
      <Select label="College" options={collegeOptions} />
    </div>
  </Modal>
 
  // Confirm-delete variant (no form just a warning)
  <Modal
    open={confirmOpen}
    onClose={() => setConfirmOpen(false)}
    title="Cancel Event?"
    subtitle="This cannot be undone. All registrations will be removed."
    footer={
      <div style={{ display: "flex", gap: 10 }}>
        <Button variant="ghost"   style={{ flex:1 }} onClick={() => setConfirmOpen(false)}>Keep Event</Button>
        <Button variant="primary" style={{ flex:1, background:"var(--error)" }} onClick={deleteEvent}>Yes, Cancel</Button>
      </div>
    }
  >
    <Toast variant="warning" title="28 participants are already registered." />
  </Modal>
 */

"use client";
 
import React from "react";
import { X } from "lucide-react";
import { Button } from "./button";
 
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  modalStyle?: React.CSSProperties;
  modalClassName?: string;
}
 
export function Modal({ 
  open, 
  onClose, 
  title, 
  subtitle, 
  children, 
  footer, 
  modalStyle, 
  modalClassName 
}: ModalProps) {
  if (!open) return null;
 
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 sm:p-6 backdrop-blur-[2px]" 
      onClick={onClose}
    >
      <div
        className={`relative flex flex-col w-full max-w-2xl max-h-[90vh] bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-float)] overflow-hidden ${modalClassName || ""}`}
        style={modalStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <Button 
          variant="ghost"
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors z-10" 
          onClick={onClose}
          title="Close modal"
        >
          <X size={18} />
        </Button>
 
        {/* Header */}
        {(title || subtitle) && (
          <div className="px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
            {title && (
              <h2 
                className="text-xl font-bold pr-8" 
                style={{ color: "var(--primary-dark)" }}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-sm mt-1 text-gray-500 pr-8">
                {subtitle}
              </p>
            )}
          </div>
        )}
 
        {/* Body (Scrollable Area) */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          {children}
        </div>
 
        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}