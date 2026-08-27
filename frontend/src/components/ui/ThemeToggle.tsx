"use client";

import React from "react";
import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme, mounted } = useTheme();

  // If not mounted yet, render placeholder with same dimensions to avoid layout shift
  if (!mounted) {
    return (
      <div
        className={cn(
          "w-8 h-8 rounded-lg border border-border/70 flex items-center justify-center text-text-secondary opacity-60",
          className
        )}
        aria-hidden
      >
        <span className="w-4 h-4" />
      </div>
    );
  }

  const isDark = theme === "dark";
  const label = isDark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      type="button"
      onClick={(e) => toggleTheme(e)}
      aria-label={label}
      title={label}
      className={cn(
        "relative flex items-center justify-center w-8 h-8 rounded-lg",
        "border border-border/70 text-text-secondary hover:text-text-primary hover:border-accent/50 hover:bg-border/20",
        "transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent cursor-pointer select-none",
        showLabel && "w-auto px-3 gap-2",
        className
      )}
    >
      {isDark ? (
        <Sun size={15} strokeWidth={1.75} className="text-text-secondary group-hover:text-accent transition-colors" />
      ) : (
        <Moon size={15} strokeWidth={1.75} className="text-text-secondary group-hover:text-accent transition-colors" />
      )}

      {showLabel && (
        <span className="font-mono text-[11px] uppercase tracking-wider text-text-secondary">
          {isDark ? "Light Mode" : "Dark Mode"}
        </span>
      )}
    </button>
  );
}
