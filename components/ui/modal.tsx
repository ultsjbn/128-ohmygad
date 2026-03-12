"use client";

import React from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({ open, onClose, title, subtitle, children, footer }: ModalProps) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={14} />
        </button>

        {(title || subtitle) && (
          <div style={{ marginBottom: 24 }}>
            {title    && <p className="heading-md" style={{ marginBottom: 6 }}>{title}</p>}
            {subtitle && <p className="caption">{subtitle}</p>}
          </div>
        )}

        <div style={{ marginBottom: footer ? 24 : 0 }}>{children}</div>

        {footer && <div>{footer}</div>}
      </div>
    </div>
  );
}

/*
How to use this component?


*/