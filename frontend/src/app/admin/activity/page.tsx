"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { activityApi } from "@/lib/api";
import toast from "react-hot-toast";
import {
  History,
  Search,
  RefreshCw,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Shield,
  FileText,
  FolderKanban,
  ImageIcon,
  Settings,
  Lock,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminBadge } from "@/components/admin/ui/AdminBadge";
import { AdminDataTable } from "@/components/admin/ui/AdminDataTable";
import { AdminEmptyState } from "@/components/admin/ui/AdminEmptyState";

interface AuditLogRecord {
  _id: string;
  timestamp: string;
  event: string;
  resourceType: string;
  resourceId?: string;
  resourceTitle?: string;
  actor: string;
  result: "SUCCESS" | "FAILED";
  metadata?: Record<string, any>;
}

export default function AdminActivityPage() {
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterResult, setFilterResult] = useState<string>("all");
  const [selectedLog, setSelectedLog] = useState<AuditLogRecord | null>(null);

  const fetchLogs = useCallback(
    async (isManual = false) => {
      if (isManual) setIsRefreshing(true);
      else setIsLoading(true);

      try {
        const res = await activityApi.getLogs({
          type: filterType === "all" ? undefined : filterType,
          result: filterResult === "all" ? undefined : filterResult,
          search: searchQuery.trim() || undefined,
          limit: 100,
        });
        setLogs(res.data.data?.logs || []);
      } catch {
        toast.error("Failed to load activity logs");
      } finally {
        setIsLoading(false);
        if (isManual) setIsRefreshing(false);
      }
    },
    [filterType, filterResult, searchQuery]
  );

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // TanStack columns
  const columns: ColumnDef<AuditLogRecord>[] = useMemo(
    () => [
      {
        accessorKey: "timestamp",
        header: "Time",
        cell: ({ row }) => {
          const date = new Date(row.original.timestamp);
          return (
            <div className="flex items-center gap-2 whitespace-nowrap">
              <Clock size={13} className="text-text-muted shrink-0" />
              <div>
                <p className="font-mono text-xs text-text-primary">
                  {date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  · {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        },
        size: 160,
      },
      {
        accessorKey: "event",
        header: "Event",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-white/[0.04] border border-border/60 text-primary uppercase shrink-0">
                {item.event}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "resourceTitle",
        header: "Resource",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="space-y-0.5 truncate max-w-xs">
              <p className="font-mono text-xs font-semibold text-text-primary truncate">
                {item.resourceTitle || item.resourceType}
              </p>
              <p className="text-[10px] font-mono text-text-muted">
                Type: {item.resourceType}
              </p>
            </div>
          );
        },
      },
      {
        accessorKey: "result",
        header: "Result",
        cell: ({ row }) => {
          const isSuccess = row.original.result === "SUCCESS";
          return (
            <span
              className={`inline-flex items-center gap-1.5 font-mono text-[10.5px] font-bold px-2.5 py-0.5 rounded-full shrink-0 whitespace-nowrap ${
                isSuccess
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}
            >
              {isSuccess ? <CheckCircle2 size={11} className="shrink-0" /> : <XCircle size={11} className="shrink-0" />}
              <span>{row.original.result}</span>
            </span>
          );
        },
        size: 100,
      },
      {
        accessorKey: "actor",
        header: "Actor",
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-text-secondary font-mono text-xs whitespace-nowrap">
            <User size={12} className="text-text-muted shrink-0" />
            <span>{row.original.actor || "Admin"}</span>
          </div>
        ),
        size: 100,
      },
      {
        id: "actions",
        header: "Details",
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => setSelectedLog(row.original)}
            className="p-1.5 rounded-lg border border-border/70 bg-white/[0.02] hover:bg-white/[0.06] text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            title="Inspect Event"
          >
            <Eye size={13} />
          </button>
        ),
        size: 60,
      },
    ],
    []
  );

  return (
    <div className="space-y-6 pb-20">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <AdminPageHeader
        eyebrow="04 / SYSTEM"
        title="Activity Stream"
        stats={`${logs.length} Logged Events · Append-Only Audit Trail`}
        description="Immutable audit trail recording administrative actions, content mutations, and authentication cycles."
        actions={
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => fetchLogs(true)}
              disabled={isRefreshing}
              className="p-2 h-9 rounded border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              title="Refresh activity logs"
            >
              <RefreshCw size={13} className={isRefreshing ? "animate-spin text-primary" : ""} />
            </button>
          </div>
        }
      />

      {/* ── Table Content ──────────────────────────────────────── */}
      {isLoading ? (
        <div className="p-12 text-center text-text-muted font-mono text-xs">
          Loading activity records…
        </div>
      ) : logs.length === 0 ? (
        <AdminEmptyState
          title="No activity events recorded yet"
          description="System events, authentication attempts, and content publications will appear here."
        />
      ) : (
        <AdminDataTable
          columns={columns}
          data={logs}
          searchPlaceholder="Search by event, resource, actor, or type…"
          filterControls={
            <div className="flex items-center gap-2 flex-wrap">
              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono">
                {[
                  { id: "all", label: "All" },
                  { id: "content", label: "Content" },
                  { id: "media", label: "Media" },
                  { id: "auth", label: "Auth" },
                  { id: "settings", label: "Settings" },
                  { id: "security", label: "Security" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilterType(tab.id)}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
                      filterType === tab.id
                        ? "bg-primary text-[#090909] font-bold"
                        : "bg-white/[0.02] border border-border/50 text-text-muted hover:text-text-primary"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Result Filter */}
              <select
                value={filterResult}
                onChange={(e) => setFilterResult(e.target.value)}
                className="h-9 bg-white/[0.02] border border-white/[0.08] rounded-lg pl-3 pr-7 text-xs font-mono text-text-secondary focus:outline-none focus:border-primary/50 [&>option]:bg-[#111] cursor-pointer shrink-0"
              >
                <option value="all">All Results</option>
                <option value="success">Success Only</option>
                <option value="failed">Failed Only</option>
              </select>
            </div>
          }
          renderMobileCard={(item) => (
            <div
              onClick={() => setSelectedLog(item)}
              className="space-y-2.5 text-xs font-body cursor-pointer select-none"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-white/[0.04] border border-border/60 text-primary uppercase shrink-0">
                  {item.event}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 font-mono text-[10.5px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                    item.result === "SUCCESS"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-red-500/10 text-red-400 border border-red-500/20"
                  }`}
                >
                  {item.result === "SUCCESS" ? (
                    <CheckCircle2 size={11} className="shrink-0" />
                  ) : (
                    <XCircle size={11} className="shrink-0" />
                  )}
                  <span>{item.result}</span>
                </span>
              </div>
              <p className="font-mono text-xs font-semibold text-text-primary truncate">
                {item.resourceTitle || item.resourceType}
              </p>
              <div className="flex items-center justify-between text-[11px] font-mono text-text-muted pt-1 border-t border-white/[0.04]">
                <span>{new Date(item.timestamp).toLocaleString()}</span>
                <div className="flex items-center gap-1 text-text-secondary">
                  <User size={11} className="shrink-0" />
                  <span>{item.actor || "Admin"}</span>
                </div>
              </div>
            </div>
          )}
        />
      )}

      {/* ── Event Detail Modal ─────────────────────────────────── */}
      {selectedLog && (
        <Dialog.Root open={Boolean(selectedLog)} onOpenChange={(open) => !open && setSelectedLog(null)}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm animate-fadeIn" />
            <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg bg-[#101010] border border-border/80 rounded-2xl p-6 shadow-2xl focus:outline-none animate-scaleIn">
              <div className="flex items-start justify-between border-b border-border/50 pb-4 mb-4">
                <div>
                  <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-widest">
                    Audit Event Details
                  </span>
                  <Dialog.Title className="text-lg font-clash font-bold text-text-primary mt-1">
                    {selectedLog.event}
                  </Dialog.Title>
                </div>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    selectedLog.result === "SUCCESS"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-red-500/10 text-red-400 border border-red-500/20"
                  }`}
                >
                  {selectedLog.result}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-border/50 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted font-mono">Resource:</span>
                    <span className="font-mono text-text-primary font-semibold">
                      {selectedLog.resourceTitle || selectedLog.resourceType}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted font-mono">Resource Type:</span>
                    <span className="font-mono text-text-secondary">{selectedLog.resourceType}</span>
                  </div>
                  {selectedLog.resourceId && (
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted font-mono">Resource ID:</span>
                      <span className="font-mono text-text-muted text-[11px] truncate max-w-[200px]">
                        {selectedLog.resourceId}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted font-mono">Timestamp:</span>
                    <span className="font-mono text-text-secondary">
                      {new Date(selectedLog.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted font-mono">Actor:</span>
                    <span className="font-mono text-text-primary">{selectedLog.actor}</span>
                  </div>
                </div>

                {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                  <div className="space-y-1.5">
                    <h5 className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
                      Event Metadata
                    </h5>
                    <pre className="p-3 rounded-xl bg-black/50 border border-border/50 font-mono text-[11px] text-text-secondary overflow-x-auto">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.09] text-xs font-medium text-text-primary transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}
    </div>
  );
}
