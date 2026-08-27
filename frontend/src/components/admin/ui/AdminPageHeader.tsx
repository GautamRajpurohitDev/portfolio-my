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
    <div
      className={cn(
        "flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/[0.08]",
        className
      )}
    >
      <div className="space-y-2 min-w-0">
        {eyebrow && (
          <div className="flex items-center gap-2.5">
            <span className="text-[10.5px] font-mono text-primary font-bold tracking-[0.2em] uppercase">
              {eyebrow}
            </span>
            {badge && <span>{badge}</span>}
          </div>
        )}

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-clash font-bold text-text-primary tracking-tight uppercase leading-[1.05]">
          {title}
        </h1>

        {(description || stats) && (
          <div className="flex items-center gap-3 text-xs text-text-muted font-body flex-wrap pt-0.5">
            {stats && (
              <span className="font-mono text-[11px] font-semibold text-text-secondary tracking-wide uppercase">
                {stats}
              </span>
            )}
            {stats && description && <span className="text-border/60">·</span>}
            {description && (
              <span className="text-text-secondary text-sm max-w-2xl leading-relaxed">
                {description}
              </span>
            )}
          </div>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
          {actions}
        </div>
      )}
    </div>
  );
}

export default AdminPageHeader;
