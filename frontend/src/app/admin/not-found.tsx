import React from "react";
import Link from "next/link";
import { FileQuestion, LayoutDashboard } from "lucide-react";

export default function AdminNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-6 space-y-5">
      <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-primary">
        <FileQuestion size={22} />
      </div>

      <div className="space-y-1 max-w-md">
        <h2 className="text-xl font-clash font-bold text-text-primary uppercase tracking-tight">
          Resource Not Found
        </h2>
        <p className="text-xs text-text-secondary font-body leading-relaxed">
          The requested content record, collection desk, or administrative view does not exist or was removed.
        </p>
      </div>

      <div className="pt-2">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-[#080808] font-clash font-bold text-xs hover:bg-primary/90 transition-colors"
        >
          <LayoutDashboard size={13} />
          <span>Back to Control Center</span>
        </Link>
      </div>
    </div>
  );
}
