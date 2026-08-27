"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { journeyApi } from "@/lib/api";
import { JourneyEntry } from "@/types";
import { Plus, Filter, ChevronDown, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { AdminBadge } from "@/components/admin/ui/AdminBadge";
import { AdminDataTable } from "@/components/admin/ui/AdminDataTable";
import { AdminRowActions } from "@/components/admin/ui/AdminRowActions";

export default function AdminJourneyPage() {
  const [entries, setEntries] = useState<JourneyEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [topicFilter, setTopicFilter] = useState<string>("all");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pendingTitle, setPendingTitle] = useState("");

  const fetchEntries = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const res = await journeyApi.getAllAdmin();
      setEntries(res.data.data || []);
    } catch {
      toast.error("Failed to fetch journey entries");
    } finally {
      setIsLoading(false);
      if (isManualRefresh) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const requestDelete = (id: string, title: string) => {
    setPendingId(id);
    setPendingTitle(title);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!pendingId) return;
    setConfirmLoading(true);
    try {
      await journeyApi.delete(pendingId);
      toast.success("Entry deleted");
      fetchEntries();
    } catch {
      toast.error("Failed to delete entry");
    } finally {
      setConfirmLoading(false);
      setPendingId(null);
      setPendingTitle("");
    }
  };

  const handleTogglePublish = async (e: JourneyEntry) => {
    try {
      await journeyApi.update(e._id, { published: !e.published });
      toast.success(e.published ? "Entry hidden" : "Entry published");
      setEntries((prev) =>
        prev.map((item) =>
          item._id === e._id ? { ...item, published: !item.published } : item
        )
      );
    } catch {
      toast.error("Failed to update entry");
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
          className="rounded border-border/70 bg-white/5 text-primary accent-primary w-3.5 h-3.5 cursor-pointer"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          aria-label="Select row"
          className="rounded border-border/70 bg-white/5 text-primary accent-primary w-3.5 h-3.5 cursor-pointer"
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
      accessorKey: "title",
      header: "Title & Summary",
      cell: ({ row }) => {
        const e = row.original;
        return (
          <div className="min-w-[220px] space-y-0.5">
            <Link
              href={`/admin/journey/${e._id}/edit`}
              className="font-clash font-semibold text-text-primary hover:text-primary transition-colors truncate block text-[13px]"
            >
              {e.title}
            </Link>
            {e.summary && (
              <p className="text-[11px] text-text-muted line-clamp-1 leading-tight">
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
        <span className="inline-flex items-center px-2 py-0.5 rounded bg-white/[0.04] text-[10.5px] font-mono text-text-secondary">
          {row.original.topic}
        </span>
      ),
    },
    {
      accessorKey: "published",
      header: "Status",
      cell: ({ row }) => (
        <AdminBadge variant={row.original.published ? "published" : "draft"} dot>
          {row.original.published ? "Live" : "Draft"}
        </AdminBadge>
      ),
    },
    {
      accessorKey: "featured",
      header: "Featured",
      cell: ({ row }) =>
        row.original.featured ? (
          <AdminBadge variant="featured">
            <Sparkles size={10} className="inline mr-1" />
            Featured
          </AdminBadge>
        ) : (
          <span className="text-text-muted text-[11px] font-mono">—</span>
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
              isPublished={e.published}
              onTogglePublish={() => handleTogglePublish(e)}
              onDelete={() => requestDelete(e._id, e.title)}
            />
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ], []);

  const filterControls = (
    <>
      <div className="relative">
        <Filter
          size={12}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="appearance-none h-9 bg-white/[0.03] border border-border/70 rounded-lg pl-7.5 pr-7 text-xs font-body text-text-secondary focus:outline-none focus:border-primary/50 [&>option]:bg-[#111] cursor-pointer"
        >
          <option value="all">All Entries</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
        </select>
        <ChevronDown
          size={12}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
        />
      </div>

      {topics.length > 0 && (
        <div className="relative">
          <select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className="appearance-none h-9 bg-white/[0.03] border border-border/70 rounded-lg pl-3 pr-7 text-xs font-body text-text-secondary focus:outline-none focus:border-primary/50 [&>option]:bg-[#111] cursor-pointer"
          >
            <option value="all">All Topics</option>
            {topics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <ChevronDown
            size={12}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
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
        title="Delete entry?"
        description={`"${pendingTitle}" will be permanently deleted.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        isLoading={confirmLoading}
      />

      {/* ── Standardized Header ───────────────────────────────── */}
      <AdminPageHeader
        eyebrow="02 / CONTENT"
        title="Learning Journal"
        stats={`${entries.length} Logged Entries · ${entries.filter((e) => e.published).length} Live · ${entries.filter((e) => !e.published).length} Drafts`}
        description="Daily engineering logs, breakthroughs, architecture challenges, and lessons learned."
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
        enableColumnVisibility={true}
        enablePagination={true}
        pageSize={25}
        onRefresh={() => fetchEntries(true)}
        isRefreshing={isRefreshing}
        emptyTitle="No journal entries found"
        emptyDescription="Start recording your daily programming progress and key lessons learned."
        emptyActionLabel="New Entry"
        emptyActionIcon={<Plus size={14} />}
        onEmptyAction={() => {
          window.location.href = "/admin/journey/new";
        }}
        renderMobileCard={(e) => (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[10px] text-text-muted">
                  {new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
                <span className="px-1.5 py-0.2 rounded bg-white/[0.04] text-[9.5px] font-mono text-text-secondary">
                  {e.topic}
                </span>
                <AdminBadge variant={e.published ? "published" : "draft"} dot>
                  {e.published ? "Live" : "Draft"}
                </AdminBadge>
              </div>

              <Link
                href={`/admin/journey/${e._id}/edit`}
                className="font-clash font-semibold text-text-primary hover:text-primary transition-colors text-sm truncate block pt-0.5"
              >
                {e.title}
              </Link>

              {e.summary && (
                <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                  {e.summary}
                </p>
              )}
            </div>

            <AdminRowActions
              editHref={`/admin/journey/${e._id}/edit`}
              previewHref="/journey"
              isPublished={e.published}
              onTogglePublish={() => handleTogglePublish(e)}
              onDelete={() => requestDelete(e._id, e.title)}
            />
          </div>
        )}
      />
    </div>
  );
}
