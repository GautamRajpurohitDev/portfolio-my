"use client";

import React, { useEffect, useState, useCallback } from "react";
import { securityApi } from "@/lib/api";
import toast from "react-hot-toast";
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Cookie,
  Key,
  FileCheck,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  Layers,
  HelpCircle,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminBadge } from "@/components/admin/ui/AdminBadge";

interface SecurityCheckItem {
  id: string;
  category: string;
  name: string;
  status: "PASS" | "PARTIAL" | "DISABLED" | "NOT_IMPLEMENTED" | "REQUIRES_ACTION";
  description: string;
}

interface SecurityStatusData {
  environment: string;
  overallStatus: string;
  attentionCount: number;
  services: Record<string, string>;
  checklist: SecurityCheckItem[];
  recentSecurityEvents: any[];
}

export default function AdminSecurityPage() {
  const [data, setData] = useState<SecurityStatusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchSecurity = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const res = await securityApi.getStatus();
      setData(res.data.data);
    } catch {
      toast.error("Failed to load security status");
    } finally {
      setIsLoading(false);
      if (isManual) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSecurity();
  }, [fetchSecurity]);

  const getStatusBadge = (status: SecurityCheckItem["status"]) => {
    switch (status) {
      case "PASS":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 size={11} />
            PASS
          </span>
        );
      case "PARTIAL":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertCircle size={11} />
            PARTIAL
          </span>
        );
      case "DISABLED":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            DISABLED
          </span>
        );
      case "NOT_IMPLEMENTED":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/[0.05] text-text-muted border border-border/60">
            NOT IMPLEMENTED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
            <XCircle size={11} />
            ACTION
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <AdminPageHeader
        eyebrow="04 / SYSTEM"
        title="Security Center"
        stats="Verified Posture · Single-Admin JWT · HTTP-Only Cookies"
        description="Verified runtime security controls, API protection mechanisms, and authentication health checklist."
        actions={
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => fetchSecurity(true)}
              disabled={isRefreshing}
              className="p-2 h-9 rounded border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              title="Refresh security status"
            >
              <RefreshCw size={13} className={isRefreshing ? "animate-spin text-primary" : ""} />
            </button>
          </div>
        }
      />

      {isLoading ? (
        <div className="p-12 text-center text-text-muted font-mono text-xs">
          Verifying security posture…
        </div>
      ) : !data ? (
        <div className="p-12 text-center text-red-400 font-mono text-xs">
          Unable to retrieve security status.
        </div>
      ) : (
        <>
          {/* ── Top Status Cards ───────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#101010] border border-border/70 space-y-2">
              <div className="flex items-center justify-between text-text-muted">
                <span className="text-[10px] font-mono uppercase tracking-wider">Overall Posture</span>
                <ShieldCheck size={16} className="text-emerald-400" />
              </div>
              <p className="text-xl font-clash font-bold text-text-primary">
                {data.overallStatus}
              </p>
              <p className="text-[11px] font-mono text-text-muted">
                {data.attentionCount} Active Critical Issues
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#101010] border border-border/70 space-y-2">
              <div className="flex items-center justify-between text-text-muted">
                <span className="text-[10px] font-mono uppercase tracking-wider">Authentication</span>
                <Lock size={16} className="text-primary" />
              </div>
              <p className="text-base font-clash font-bold text-text-primary">
                Single-Admin JWT
              </p>
              <p className="text-[11px] font-mono text-emerald-400">
                ● Protected & Salted
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#101010] border border-border/70 space-y-2">
              <div className="flex items-center justify-between text-text-muted">
                <span className="text-[10px] font-mono uppercase tracking-wider">Session Storage</span>
                <Cookie size={16} className="text-primary" />
              </div>
              <p className="text-base font-clash font-bold text-text-primary">
                HTTP-Only Cookies
              </p>
              <p className="text-[11px] font-mono text-emerald-400">
                ● SameSite: Lax
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#101010] border border-border/70 space-y-2">
              <div className="flex items-center justify-between text-text-muted">
                <span className="text-[10px] font-mono uppercase tracking-wider">API Security</span>
                <Key size={16} className="text-primary" />
              </div>
              <p className="text-base font-clash font-bold text-text-primary">
                Helmet & Rate Limit
              </p>
              <p className="text-[11px] font-mono text-emerald-400">
                ● CSRF / Origin Guard
              </p>
            </div>
          </div>

          {/* ── Security Architecture Checklist ────────────────────── */}
          <div className="rounded-2xl bg-[#101010] border border-border/70 overflow-hidden">
            <div className="p-5 border-b border-border/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-clash font-bold text-text-primary">
                  Security Architecture & Controls Checklist
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Verified controls matching the repository security specifications.
                </p>
              </div>
              <span className="text-xs font-mono text-text-muted">
                {data.checklist.length} Controls
              </span>
            </div>

            <div className="divide-y divide-border/50">
              {data.checklist.map((item) => (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.01] transition-colors"
                >
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
                        {item.category}
                      </span>
                      <span className="text-border/60">·</span>
                      <h4 className="text-xs sm:text-sm font-semibold text-text-primary">
                        {item.name}
                      </h4>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed font-body">
                      {item.description}
                    </p>
                  </div>
                  <div className="shrink-0">{getStatusBadge(item.status)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Recent Security Events ─────────────────────────────── */}
          <div className="rounded-2xl bg-[#101010] border border-border/70 overflow-hidden">
            <div className="p-5 border-b border-border/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-clash font-bold text-text-primary">
                  Recent Security Events
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Recent authentication attempts and operational security events.
                </p>
              </div>
              <a
                href="/admin/activity?type=auth"
                className="text-xs font-mono text-primary hover:underline"
              >
                View full log →
              </a>
            </div>

            {data.recentSecurityEvents.length === 0 ? (
              <div className="p-8 text-center text-text-muted font-mono text-xs">
                No recent security anomalies recorded.
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {data.recentSecurityEvents.map((evt) => (
                  <div
                    key={evt._id}
                    className="p-4 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <Clock size={13} className="text-text-muted" />
                      <div>
                        <span className="font-mono font-semibold text-text-primary">
                          {evt.event}
                        </span>
                        <span className="text-text-muted text-[11px] ml-2 font-mono">
                          {new Date(evt.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        evt.result === "SUCCESS"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {evt.result}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
