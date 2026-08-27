"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface AdminPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  noPadding?: boolean;
}

export function AdminPanel({
  title,
  description,
  headerAction,
  footer,
  noPadding = false,
  className,
  children,
  ...props
}: AdminPanelProps) {
  const hasHeader = Boolean(title || description || headerAction);

  return (
    <div
      className={cn(
        "rounded-xl bg-[#101010] border border-border/70 overflow-hidden shadow-xs",
        className
      )}
      {...props}
    >
      {hasHeader && (
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-border/50 bg-[#121212]/50">
          <div className="min-w-0 space-y-0.5">
            {title && (
              <h3 className="text-sm font-clash font-semibold text-text-primary tracking-wide">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-xs text-text-muted leading-relaxed truncate">
                {description}
              </p>
            )}
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      )}

      <div className={cn(noPadding ? "p-0" : "p-5")}>{children}</div>

      {footer && (
        <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-t border-border/50 bg-[#0c0c0c]/80 text-xs text-text-muted">
          {footer}
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
