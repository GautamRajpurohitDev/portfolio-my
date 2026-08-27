"use client";

import React from "react";
import { AlertCircle, History, RotateCcw, Trash2 } from "lucide-react";

interface DraftRecoveryBannerProps {
  onRestore: () => void;
  onDiscard: () => void;
}

export function DraftRecoveryBanner({
  onRestore,
  onDiscard,
}: DraftRecoveryBannerProps) {
  return (
    <div className="mb-6 p-4 rounded-xl bg-primary/[0.06] border border-primary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-fadeIn select-none">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center text-primary shrink-0">
          <History size={14} />
        </div>
        <div>
          <p className="font-semibold text-text-primary font-clash">
            Unsaved Local Draft Found
          </p>
          <p className="text-[11px] text-text-muted">
            A newer snapshot was recovered from your previous session.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
        <button
          type="button"
          onClick={onDiscard}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/70 bg-white/[0.03] hover:bg-white/[0.08] text-[11px] font-mono text-text-muted hover:text-red-400 transition-colors cursor-pointer"
        >
          <Trash2 size={11} />
          <span>Discard</span>
        </button>

        <button
          type="button"
          onClick={onRestore}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-[#090909] text-[11px] font-clash font-bold hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
        >
          <RotateCcw size={11} strokeWidth={2.5} />
          <span>Restore Draft</span>
        </button>
      </div>
    </div>
  );
}

export default DraftRecoveryBanner;
