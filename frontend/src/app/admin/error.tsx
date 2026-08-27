"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, LayoutDashboard } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin route error captured:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-6 space-y-5">
      <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
        <AlertTriangle size={22} />
      </div>

      <div className="space-y-1 max-w-md">
        <h2 className="text-xl font-clash font-bold text-text-primary uppercase tracking-tight">
          Workspace Error
        </h2>
        <p className="text-xs text-text-secondary font-body leading-relaxed">
          An unexpected error occurred while rendering this administration view. Your underlying database records and saved states are protected.
        </p>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-[#080808] font-clash font-bold text-xs hover:bg-primary/90 transition-colors cursor-pointer"
        >
          <RefreshCw size={13} />
          <span>Retry Workspace</span>
        </button>

        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] text-xs font-body text-text-secondary hover:text-text-primary transition-colors"
        >
          <LayoutDashboard size={13} />
          <span>Return to Overview</span>
        </Link>
      </div>
    </div>
  );
}
