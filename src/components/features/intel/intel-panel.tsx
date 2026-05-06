// src/components/features/intel/intel-panel.tsx
"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface IntelPanelProps {
  open: boolean;
  onClose: () => void;
  breadcrumbs: BreadcrumbItem[];
  children: React.ReactNode;
}

export function IntelPanel({ open, onClose, breadcrumbs, children }: IntelPanelProps) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Trap scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-zinc-950/70 backdrop-blur-sm transition-opacity duration-200",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Centered panel */}
      <div
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-10 pointer-events-none",
          open ? "opacity-100" : "opacity-0"
        )}
      >
        <div
          className={cn(
            "pointer-events-auto w-full max-w-4xl max-h-[85vh] bg-zinc-950 border border-zinc-800 rounded-xl",
            "flex flex-col shadow-2xl transition-all duration-200 ease-out",
            open ? "scale-100 opacity-100" : "scale-95 opacity-0"
          )}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 flex-shrink-0">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm">
              {breadcrumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  {i > 0 && <span className="text-zinc-700">/</span>}
                  {crumb.onClick ? (
                    <button
                      onClick={crumb.onClick}
                      className="text-zinc-400 hover:text-zinc-200 transition-colors"
                    >
                      {crumb.label}
                    </button>
                  ) : (
                    <span className="text-zinc-200 font-medium">{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>

            <button
              onClick={onClose}
              className="text-zinc-500 hover:text-zinc-200 transition-colors text-lg leading-none p-1"
              aria-label="Close panel"
            >
              ✕
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
