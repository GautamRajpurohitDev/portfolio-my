"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { journeyApi } from "@/lib/api";
import { JourneyEntry } from "@/types";
import toast from "react-hot-toast";
import {
  Plus,
  Filter,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminDataTable } from "@/components/admin/ui/AdminDataTable";
import { AdminBadge } from "@/components/admin/ui/AdminBadge";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { AdminRowActions } from "@/components/admin/ui/AdminRowActions";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";

export default function AdminJourneyPage() {
  const [entries, setEntries] = useState<JourneyEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [topicFilter, setTopicFilter] = useState<string>("all");

  // Delete modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pendingTitle, setPendingTitle] = useState("");
  const [confirmLoading, setConfirmLoading] = useState(false);

  const fetchJourney = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    try {
      const res = await journeyApi.getAllAdmin();
      setEntries(res.data.data || []);
    } catch {
      toast.error("Failed to load journey entries");
    } finally {
      setIsLoading(false);
      if (isManualRefresh) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchJourney();
  }, [fetchJourney]);

  const requestDelete = (id: string, title: string) => {
    setPendingDeleteId(id);
    setPendingTitle(title);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!pendingDeleteId) return;
    setConfirmLoading(true);
    try {
      await journeyApi.delete(pendingDeleteId);
      toast.success("Journey entry deleted");
      setEntries((prev) => prev.filter((e) => e._id !== pendingDeleteId));
      setConfirmOpen(false);
    } catch {
      toast.error("Failed to delete entry");
    } finally {
      setConfirmLoading(false);
      setPendingDeleteId(null);
    }
  };

  const handleTogglePublish = async (e: JourneyEntry) => {
    try {
      await journeyApi.update(e._id, { published: !e.published });
      toast.success(e.published ? "Entry set to draft" : "Entry published live");
      setEntries((prev) =>
        prev.map((item) =>
          item._id === e._id ? { ...item, published: !item.published } : item
        )
      );
    } catch {
      toast.error("Failed to update entry");
    }
  };

  const handleDuplicate = async (e: JourneyEntry) => {
    try {
      const copyPayload = {
        ...e,
        _id: undefined,
        title: `${e.title} (Copy)`,
        published: false,
      };
      await journeyApi.create(copyPayload);
      toast.success("Journey entry duplicated as draft");
      fetchJourney(true);
    } catch {
      toast.error("Failed to duplicate journey entry");
    }
  };

  const handleBulkPublish = async (selected: JourneyEntry[]) => {
    try {
      await Promise.all(selected.map((e) => journeyApi.update(e._id, { published: true })));
      toast.success(`Published ${selected.length} entries`);
      fetchJourney(true);
    } catch {
      toast.error("Failed to publish selected entries");
    }
  };

  const handleBulkUnpublish = async (selected: JourneyEntry[]) => {
    try {
      await Promise.all(selected.map((e) => journeyApi.update(e._id, { published: false })));
      toast.success(`Unpublished ${selected.length} entries`);
      fetchJourney(true);
    } catch {
      toast.error("Failed to unpublish selected entries");
    }
  };

  const handleBulkDelete = async (selected: JourneyEntry[]) => {
    if (!confirm(`Permanently delete ${selected.length} selected journey entries?`)) return;
    try {
      await Promise.all(selected.map((e) => journeyApi.delete(e._id)));
      toast.success(`Deleted ${selected.length} entries`);
      fetchJourney(true);
    } catch {
      toast.error("Failed to delete selected entries");
    }
  };

  // Derive unique topics
  const topics = useMemo(() => {
    const set = new Set<string>();
    entries.forEach((e) => {
      if (e.topic) set.add(e.topic);
    });
    return Array.from(set);
  }, [entries]);

  // Filtered dataset
  const filteredData = useMemo(() => {
    return entries.filter((e) => {
      if (statusFilter === "published" && !e.published) return false;
      if (statusFilter === "draft" && e.published) return false;
      if (topicFilter !== "all" && e.topic !== topicFilter) return false;
      return true;
    });
  }, [entries, statusFilter, topicFilter]);

  // TanStack Column Definitions
  const columns = useMemo<ColumnDef<JourneyEntry>[]>(() => [
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          aria-label="Select all"
          className="rounded border-white/[0.2] bg-white/5 text-primary accent-primary w-3.5 h-3.5 cursor-pointer"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          aria-label="Select row"
          className="rounded border-white/[0.2] bg-white/5 text-primary accent-primary w-3.5 h-3.5 cursor-pointer"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        const date = new Date(row.original.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        return <span className="text-text-muted font-mono text-[11px] whitespace-nowrap">{date}</span>;
      },
    },
    {
      accessorKey: "topic",
      header: "Topic",
      cell: ({ row }) => (
        <span className="font-mono text-primary text-[11px] font-bold">
          {row.original.topic || "General"}
        </span>
      ),
    },
    {
      accessorKey: "title",
      header: "Entry Title",
      cell: ({ row }) => {
        const e = row.original;
        return (
          <div className="min-w-[220px]">
            <Link
              href={`/admin/journey/${e._id}/edit`}
              className="font-clash font-semibold text-text-primary hover:text-primary transition-colors text-[13px] block"
            >
              {e.title}
            </Link>
            {e.summary && (
              <p className="text-[11px] text-text-muted truncate max-w-sm font-body leading-tight mt-0.5">
                {e.summary}
              </p>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "topic",
      header: "Topic",
      cell: ({ row }) => (
        <span className="text-text-secondary text-[11px] font-mono">
          {row.original.topic || "Engineering"}
        </span>
      ),
    },
    {
      accessorKey: "published",
      header: "Status",
      cell: ({ row }) => (
        <AdminBadge variant={row.original.published ? "published" : "draft"}>
          {row.original.published ? "LIVE" : "DRAFT"}
        </AdminBadge>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const e = row.original;
        return (
          <div className="text-right">
            <AdminRowActions
              editHref={`/admin/journey/${e._id}/edit`}
              previewHref="/journey"
              copyUrl={typeof window !== "undefined" ? `${window.location.origin}/journey` : undefined}
              isPublished={e.published}
              onTogglePublish={() => handleTogglePublish(e)}
              onDuplicate={() => handleDuplicate(e)}
              onDelete={() => requestDelete(e._id, e.title)}
            />
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ], []);

  // Filter Select Controls
  const filterControls = (
    <>
      {/* Status Filter */}
      <div className="flex items-center gap-2 h-9 px-3 bg-white/[0.02] border border-white/[0.08] rounded-lg hover:border-white/[0.15] focus-within:border-primary/50 transition-colors shrink-0">
        <Filter
          size={12}
          className="text-text-muted shrink-0 pointer-events-none"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-transparent border-0 p-0 pr-3 text-xs font-body text-text-secondary focus:outline-none appearance-none cursor-pointer [&>option]:bg-[#111] [&>option]:text-text-primary"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <ChevronDown
          size={11}
          className="text-text-muted shrink-0 pointer-events-none"
        />
      </div>

      {/* Topic Filter */}
      {topics.length > 0 && (
        <div className="flex items-center gap-2 h-9 px-3 bg-white/[0.02] border border-white/[0.08] rounded-lg hover:border-white/[0.15] focus-within:border-primary/50 transition-colors shrink-0">
          <select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className="bg-transparent border-0 p-0 pr-3 text-xs font-body text-text-secondary focus:outline-none appearance-none cursor-pointer capitalize [&>option]:bg-[#111] [&>option]:text-text-primary"
          >
            <option value="all">All Topics</option>
            {topics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <ChevronDown
            size={11}
            className="text-text-muted shrink-0 pointer-events-none"
          />
        </div>
      )}
    </>
  );

  return (
    <div className="space-y-6 pb-14">
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete journey entry?"
        description={`"${pendingTitle}" will be permanently deleted.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        isLoading={confirmLoading}
      />

      {/* ── Standardized Header ───────────────────────────────── */}
      <AdminPageHeader
        eyebrow="02 / CONTENT"
        title="Learning Journal"
        stats={`${entries.length} Logs · ${entries.filter((e) => e.published).length} Live · ${entries.filter((e) => !e.published).length} Drafts`}
        description="Chronological learning progress, architectural discoveries, and daily engineering reflections."
        actions={
          <Link href="/admin/journey/new">
            <AdminButton variant="primary" icon={<Plus size={15} />}>
              New Entry
            </AdminButton>
          </Link>
        }
      />

      {/* ── TanStack Admin Data Table ─────────────────────────── */}
      <AdminDataTable
        columns={columns}
        data={filteredData}
        isLoading={isLoading}
        searchPlaceholder="Search journal entries by title, topic…"
        filterControls={filterControls}
        enableSelection={true}
        onBulkPublish={handleBulkPublish}
        onBulkUnpublish={handleBulkUnpublish}
        onBulkDelete={handleBulkDelete}
        enableColumnVisibility={true}
        enablePagination={true}
        pageSize={25}
        onRefresh={() => fetchJourney(true)}
        isRefreshing={isRefreshing}
        emptyTitle="No journal entries found"
        emptyDescription="Create your first entry to document your engineering journey."
        emptyActionLabel="Create Entry"
        emptyActionIcon={<Plus size={14} />}
        onEmptyAction={() => {
          window.location.href = "/admin/journey/new";
        }}
        renderMobileCard={(e) => (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <AdminBadge variant={e.published ? "published" : "draft"}>
                  {e.published ? "Live" : "Draft"}
                </AdminBadge>
                {e.topic && (
                  <span className="text-[10px] font-mono text-text-muted px-1.5 py-0.5 rounded bg-white/[0.04]">
                    {e.topic}
                  </span>
                )}
              </div>

              <Link
                href={`/admin/journey/${e._id}/edit`}
                className="font-clash font-semibold text-text-primary hover:text-primary transition-colors text-sm block pt-1"
              >
                {e.title}
              </Link>

              <p className="text-[11px] font-mono text-text-muted">
                {new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>

            <AdminRowActions
              editHref={`/admin/journey/${e._id}/edit`}
              previewHref="/journey"
              copyUrl={typeof window !== "undefined" ? `${window.location.origin}/journey` : undefined}
              isPublished={e.published}
              onTogglePublish={() => handleTogglePublish(e)}
              onDuplicate={() => handleDuplicate(e)}
              onDelete={() => requestDelete(e._id, e.title)}
            />
          </div>
        )}
      />
    </div>
  );
}
