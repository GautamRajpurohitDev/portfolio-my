"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { AdminButton } from "./AdminButton";

interface AdminEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionIcon?: React.ReactNode;
  onAction?: () => void;
  actionHref?: string;
  className?: string;
}

export function AdminEmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionIcon,
  onAction,
  className,
}: AdminEmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-border/70 p-8 sm:p-10 text-center flex flex-col items-center justify-center max-w-md mx-auto my-6",
        className
      )}
    >
      {icon && (
        <div className="w-10 h-10 rounded-lg bg-white/[0.03] border border-border/50 flex items-center justify-center text-text-muted mb-3">
          {icon}
        </div>
      )}
      <h4 className="text-sm font-clash font-semibold text-text-primary mb-1">
        {title}
      </h4>
      <p className="text-xs text-text-muted leading-relaxed max-w-xs mb-5">
        {description}
      </p>

      {actionLabel && (
        <AdminButton
          variant="primary"
          size="sm"
          icon={actionIcon}
          onClick={onAction}
        >
          {actionLabel}
        </AdminButton>
      )}
    </div>
  );
}

export default AdminEmptyState;
