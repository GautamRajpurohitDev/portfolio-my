"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface AdminSectionDividerProps {
  num?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function AdminSectionDivider({
  num,
  title,
  subtitle,
  action,
  className,
}: AdminSectionDividerProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-2.5 mb-4 border-b border-border/40 min-w-0",
        className
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        {num && (
          <>
            <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-widest shrink-0">
              {num}
            </span>
            <span className="text-text-muted font-mono text-xs select-none">/</span>
          </>
        )}
        <h2 className="text-sm font-clash font-semibold text-text-primary tracking-wide uppercase truncate">
          {title}
        </h2>
        {subtitle && (
          <span className="text-[11px] font-mono text-text-muted hidden md:inline ml-2 truncate">
            {subtitle}
          </span>
        )}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export default AdminSectionDivider;
