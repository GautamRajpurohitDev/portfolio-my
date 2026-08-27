"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Clock,
  ExternalLink,
  Save,
  Globe,
  EyeOff,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { AdminBadge } from "./AdminBadge";
import { AdminButton } from "./AdminButton";

export type SaveState = "saved" | "unsaved" | "saving" | "failed";

interface AdminEditorHeaderProps {
  backHref: string;
  backLabel?: string;
  breadcrumb: string;
  title: string;
  isPublished?: boolean;
  saveState: SaveState;
  lastSavedAt?: Date | null;
  previewHref?: string;
  onSaveDraft?: () => void;
  onPublish?: () => void;
  onUnpublish?: () => void;
  isSubmitting?: boolean;
  deleteAction?: React.ReactNode;
  extraActions?: React.ReactNode;
}

function formatSavedTime(date: Date | null | undefined): string {
  if (!date) return "";
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffSec < 5) return "just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function AdminEditorHeader({
  backHref,
  backLabel,
  breadcrumb,
  title,
  isPublished = false,
  saveState,
  lastSavedAt,
  previewHref,
  onSaveDraft,
  onPublish,
  onUnpublish,
  isSubmitting = false,
  deleteAction,
  extraActions,
}: AdminEditorHeaderProps) {
  const [, setTick] = useState(0);

  // Re-render relative time every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="sticky top-0 z-20 -mx-6 sm:-mx-8 lg:-mx-10 px-6 sm:px-8 lg:px-10 py-3.5 bg-[#090909]/95 backdrop-blur-md border-b border-border/70 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Left: Back Link, Title, Status & Save State */}
      <div className="space-y-1 min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-[11px] font-mono text-text-muted hover:text-text-primary transition-colors uppercase tracking-wider group"
          >
            <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to {backLabel || "List"}</span>
          </Link>

          <span className="text-border/60">·</span>
          <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">
            {breadcrumb}
          </span>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-lg sm:text-xl font-clash font-bold text-text-primary truncate max-w-md">
            {title || "Untitled Document"}
          </h1>

          {/* Published vs Draft Badge */}
          <AdminBadge variant={isPublished ? "published" : "draft"} dot>
            {isPublished ? "Published" : "Draft"}
          </AdminBadge>

          {/* Live Save State Indicator */}
          <div className="flex items-center gap-1.5 text-[11px] font-mono select-none">
            {saveState === "saving" && (
              <span className="text-text-muted flex items-center gap-1.5">
                <RefreshCw size={11} className="animate-spin text-primary" />
                <span>Saving draft…</span>
              </span>
            )}
            {saveState === "saved" && (
              <span className="text-text-muted flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                <span>Saved {lastSavedAt ? formatSavedTime(lastSavedAt) : "just now"}</span>
              </span>
            )}
            {saveState === "unsaved" && (
              <span className="text-yellow-500/80 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                <span>Unsaved changes</span>
              </span>
            )}
            {saveState === "failed" && (
              <span className="text-red-400 flex items-center gap-1">
                <AlertTriangle size={11} />
                <span>Save failed</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Actions Cluster */}
      <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto flex-wrap">
        {extraActions}

        {/* Preview Link */}
        {previewHref && (
          <a
            href={previewHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border/70 bg-white/[0.02] hover:bg-white/[0.06] text-xs font-body text-text-secondary hover:text-text-primary transition-colors"
          >
            <span>Preview</span>
            <ExternalLink size={12} className="shrink-0" />
          </a>
        )}

        {/* Save Draft Action */}
        {onSaveDraft && (
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-border/70 bg-white/[0.03] hover:bg-white/[0.07] text-xs font-medium text-text-primary transition-all disabled:opacity-40 cursor-pointer"
            title="Save as draft (Ctrl+S)"
          >
            <Save size={13} className="text-text-muted shrink-0" />
            <span>Save Draft</span>
          </button>
        )}

        {/* Publish Action */}
        {onPublish && !isPublished && (
          <button
            type="button"
            onClick={onPublish}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-primary text-[#090909] text-xs font-clash font-bold hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-40 shadow-xs cursor-pointer"
          >
            {isSubmitting ? (
              <div className="w-3.5 h-3.5 border-2 border-[#090909] border-t-transparent rounded-full animate-spin shrink-0" />
            ) : (
              <Globe size={13} strokeWidth={2.5} className="shrink-0" />
            )}
            <span>Publish to Live</span>
          </button>
        )}

        {/* Unpublish Action */}
        {onUnpublish && isPublished && (
          <button
            type="button"
            onClick={onUnpublish}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-yellow-500/30 hover:border-yellow-500/60 bg-yellow-500/5 hover:bg-yellow-500/10 text-xs font-medium text-yellow-300 transition-all disabled:opacity-40 cursor-pointer"
          >
            <EyeOff size={13} className="shrink-0" />
            <span>Unpublish</span>
          </button>
        )}

        {/* Re-save published content */}
        {onPublish && isPublished && (
          <button
            type="button"
            onClick={onPublish}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-primary text-[#090909] text-xs font-clash font-bold hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-40 shadow-xs cursor-pointer"
          >
            {isSubmitting ? (
              <div className="w-3.5 h-3.5 border-2 border-[#090909] border-t-transparent rounded-full animate-spin shrink-0" />
            ) : (
              <Check size={13} strokeWidth={2.5} className="shrink-0" />
            )}
            <span>Update Live</span>
          </button>
        )}

        {deleteAction}
      </div>
    </div>
  );
}

export default AdminEditorHeader;
