"use client";

import React from "react";
import { cn } from "@/lib/utils";

export type AdminBadgeVariant =
  | "published"
  | "draft"
  | "featured"
  | "idea"
  | "in-progress"
  | "completed"
  | "archived"
  | "learning"
  | "familiar"
  | "proficient"
  | "advanced"
  | "planned"
  | "default";

interface AdminBadgeProps {
  children: React.ReactNode;
  variant?: AdminBadgeVariant;
  className?: string;
  dot?: boolean;
}

const BADGE_STYLES: Record<AdminBadgeVariant, string> = {
  published: "status-published",
  draft: "status-draft",
  featured: "status-featured",
  idea: "status-idea",
  "in-progress": "status-progress",
  completed: "status-completed",
  archived: "status-archived",
  learning: "status-learning",
  familiar: "status-familiar",
  proficient: "status-proficient",
  advanced: "status-advanced",
  planned: "status-planned",
  default: "bg-white/[0.04] text-text-secondary border-border/70",
};

const DOT_COLORS: Record<AdminBadgeVariant, string> = {
  published: "bg-success",
  draft: "bg-text-muted",
  featured: "bg-accent",
  idea: "bg-text-secondary",
  "in-progress": "bg-blue-400",
  completed: "bg-success",
  archived: "bg-text-muted",
  learning: "bg-accent",
  familiar: "bg-blue-400",
  proficient: "bg-success",
  advanced: "bg-accent",
  planned: "bg-text-muted",
  default: "bg-text-secondary",
};

export function AdminBadge({
  children,
  variant = "default",
  className,
  dot = false,
}: AdminBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border select-none whitespace-nowrap",
        BADGE_STYLES[variant] || BADGE_STYLES.default,
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0",
            DOT_COLORS[variant] || DOT_COLORS.default
          )}
        />
      )}
      <span>{children}</span>
    </span>
  );
}

export default AdminBadge;
