"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface AdminPageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  stats?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  stats,
  badge,
  actions,
  className,
}: AdminPageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 sm:pb-7 mb-6 sm:mb-8 border-b border-white/[0.08]",
        className
      )}
    >
      <div className="space-y-2 min-w-0 flex-1">
        {eyebrow && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-primary font-bold tracking-[0.2em] uppercase">
              {eyebrow}
            </span>
            {badge && <span>{badge}</span>}
          </div>
        )}

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-clash font-bold text-text-primary tracking-tight uppercase leading-tight">
          {title}
        </h1>

        {(description || stats) && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 text-xs text-text-secondary font-body pt-0.5">
            {stats && (
              <span className="font-mono text-[11px] font-semibold text-text-muted tracking-wider uppercase shrink-0">
                {stats}
              </span>
            )}
            {stats && description && (
              <span className="hidden sm:inline text-white/[0.2] font-mono select-none">·</span>
            )}
            {description && (
              <p className="text-xs text-text-muted max-w-2xl leading-normal">
                {description}
              </p>
            )}
          </div>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap pt-2 md:pt-0">
          {actions}
        </div>
      )}
    </header>
  );
}

export default AdminPageHeader;
