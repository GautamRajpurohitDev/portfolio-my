"use client";

import React from "react";
import { SlideUp } from "@/components/motion/MotionPrimitives";
import { cn } from "@/lib/utils";

export interface PublicPageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

/**
 * PublicPageHeader:
 * Establishes a guaranteed, non-colliding layout offset below the fixed public navbar.
 * Uses .public-page-header to enforce padding-top: clamp(130px, 12vw, 175px).
 *
 * Spacing model:
 * Navbar (fixed: 76px) -> Breathing room (54–100px) -> Eyebrow -> Title -> Subtitle -> Content
 */
export function PublicPageHeader({
  eyebrow,
  title,
  subtitle,
  action,
  className,
  children,
}: PublicPageHeaderProps) {
  return (
    <header className={cn("public-page-header", className)}>
      <div className="container">
        <div className="max-w-4xl">
          <SlideUp>
            {eyebrow && (
              <span className="public-page-header-eyebrow">
                {eyebrow}
              </span>
            )}
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4 sm:mb-5">
              <h1 className="public-page-header-title">
                {title}
              </h1>

              {action && <div className="flex-shrink-0 mb-2">{action}</div>}
            </div>

            {subtitle && (
              <p className="public-page-header-subtitle">
                {subtitle}
              </p>
            )}

            {children}
          </SlideUp>
        </div>
      </div>
    </header>
  );
}

export function PublicPageShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-h-screen bg-bg text-text-primary", className)}>
      {children}
    </div>
  );
}
