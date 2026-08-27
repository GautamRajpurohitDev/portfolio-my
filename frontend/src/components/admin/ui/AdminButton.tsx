"use client";

import React from "react";
import { cn } from "@/lib/utils";

export type AdminButtonVariant = "primary" | "secondary" | "tertiary" | "danger";
export type AdminButtonSize = "sm" | "md" | "lg";

interface AdminButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: AdminButtonVariant;
  size?: AdminButtonSize;
  isLoading?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export function AdminButton({
  variant = "secondary",
  size = "md",
  isLoading = false,
  icon,
  children,
  className,
  disabled,
  ...props
}: AdminButtonProps) {
  const sizeClasses = {
    sm: "h-8 px-2.5 text-xs gap-1.5 rounded-md",
    md: "h-9 px-3.5 text-[13px] gap-2 rounded-lg",
    lg: "h-11 px-5 text-sm gap-2.5 rounded-lg",
  }[size];

  const variantClasses = {
    primary:
      "bg-primary text-[#090909] font-semibold hover:bg-primary/90 active:scale-[0.98] border border-transparent shadow-xs focus-visible:ring-2 focus-visible:ring-primary/60",
    secondary:
      "bg-white/[0.04] text-text-primary hover:bg-white/[0.08] hover:text-text-primary border border-border/70 hover:border-border font-medium active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary/40",
    tertiary:
      "bg-transparent text-text-secondary hover:text-text-primary hover:bg-white/[0.04] border border-transparent font-medium active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary/40",
    danger:
      "bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 border border-red-500/20 font-medium active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-red-500/50",
  }[variant];

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center transition-all duration-150 outline-none select-none cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
        sizeClasses,
        variantClasses,
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      {children && <span>{children}</span>}
    </button>
  );
}

export default AdminButton;
