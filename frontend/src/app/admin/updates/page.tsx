"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { updatesApi } from "@/lib/api";
import { Update } from "@/types";
import { Plus, Filter, ChevronDown, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { AdminBadge } from "@/components/admin/ui/AdminBadge";
import { AdminDataTable } from "@/components/admin/ui/AdminDataTable";
import { AdminRowActions } from "@/components/admin/ui/AdminRowActions";

export default function AdminUpdatesPage() {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pendingTitle, setPendingTitle] = useState("");

  const fetchUpdates = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const res = await updatesApi.getAllAdmin();
      setUpdates(res.data.data || []);
    } catch {
      toast.error("Failed to fetch updates");
    } finally {
      setIsLoading(false);
      if (isManualRefresh) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUpdates();
  }, [fetchUpdates]);

  const requestDelete = (id: string, title: string) => {
    setPendingId(id);
    setPendingTitle(title);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!pendingId) return;
    setConfirmLoading(true);
    try {
      await updatesApi.delete(pendingId);
      toast.success("Update deleted");
      fetchUpdates();
    } catch {
      toast.error("Failed to delete update");
    } finally {
      setConfirmLoading(false);
      setPendingId(null);
      setPendingTitle("");
    }
  };

  const handleTogglePublish = async (u: Update) => {
    try {
      await updatesApi.update(u._id, { published: !u.published });
      toast.success(u.published ? "Update unpublished" : "Update published");
      setUpdates((prev) =>
        prev.map((item) =>
          item._id === u._id ? { ...item, published: !item.published } : item
        )
      );
    } catch {
      toast.error("Failed to update");
    }
  };

  const filteredData = useMemo(() => {
    return updates.filter((u) => {
      if (statusFilter === "published" && !u.published) return false;
      if (statusFilter === "draft" && u.published) return false;
      return true;
    });
  }, [updates, statusFilter]);

  const columns = useMemo<ColumnDef<Update>[]>(() => [
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
      header: "Update Title",
      cell: ({ row }) => {
        const u = row.original;
        return (
          <div className="flex items-center gap-3 min-w-[220px]">
            {u.coverImage && (
              <div className="w-8 h-8 rounded-md bg-white/[0.04] border border-border/50 flex-shrink-0 overflow-hidden">
                <img src={u.coverImage} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="min-w-0 space-y-0.5">
              <Link
                href={`/admin/updates/${u._id}/edit`}
                className="font-clash font-semibold text-text-primary hover:text-primary transition-colors truncate block text-[13px]"
              >
                {u.title}
              </Link>
              {u.summary && (
                <p className="text-[11px] text-text-muted line-clamp-1 leading-tight">
                  {u.summary}
                </p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "published",
      header: "Status",
      cell: ({ row }) => (
        <AdminBadge variant={row.original.published ? "published" : "draft"} dot>
          {row.original.published ? "Published" : "Draft"}
        </AdminBadge>
      ),
    },
    {
      accessorKey: "tags",
      header: "Tags",
      cell: ({ row }) => {
        const tags = row.original.tags || [];
        if (tags.length === 0) return <span className="text-text-muted font-mono text-[11px]">—</span>;
        return (
          <div className="flex flex-wrap gap-1 max-w-xs">
            {tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="px-1.5 py-0.5 rounded bg-white/[0.04] text-[10px] font-mono text-text-muted">
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="px-1.5 py-0.5 rounded bg-white/[0.04] text-[10px] font-mono text-text-muted">
                +{tags.length - 3}
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: "mediaCount",
      header: "Media",
      cell: ({ row }) => {
        const count = row.original.media?.length || (row.original.coverImage ? 1 : 0);
        if (count === 0) return <span className="text-text-muted font-mono text-[11px]">—</span>;
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-text-secondary">
            <ImageIcon size={11} className="text-text-muted" />
            <span>{count} {count === 1 ? "asset" : "assets"}</span>
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const u = row.original;
        return (
          <div className="text-right">
            <AdminRowActions
              editHref={`/admin/updates/${u._id}/edit`}
              previewHref={u.slug ? `/updates/${u.slug}` : undefined}
              isPublished={u.published}
              onTogglePublish={() => handleTogglePublish(u)}
              onDelete={() => requestDelete(u._id, u.title)}
            />
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ], []);

  const filterControls = (
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
        <option value="all">All Updates</option>
        <option value="published">Published</option>
        <option value="draft">Drafts</option>
      </select>
      <ChevronDown
        size={12}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
      />
    </div>
  );

  return (
    <div className="space-y-6 pb-14">
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete update?"
        description={`"${pendingTitle}" will be permanently deleted.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        isLoading={confirmLoading}
      />

      {/* ── Standardized Header ───────────────────────────────── */}
      <AdminPageHeader
        eyebrow="02 / CONTENT"
        title="Build Log"
        stats={`${updates.length} Updates · ${updates.filter((u) => u.published).length} Live · ${updates.filter((u) => !u.published).length} Drafts`}
        description="Public devlogs, software releases, engineering announcements, and milestone briefs."
        actions={
          <Link href="/admin/updates/new">
            <AdminButton variant="primary" icon={<Plus size={15} />}>
              New Update
            </AdminButton>
          </Link>
        }
      />

      {/* ── TanStack Admin Data Table ─────────────────────────── */}
      <AdminDataTable
        columns={columns}
        data={filteredData}
        isLoading={isLoading}
        searchPlaceholder="Search updates by title, tag…"
        filterControls={filterControls}
        enableSelection={true}
        enableColumnVisibility={true}
        enablePagination={true}
        pageSize={25}
        onRefresh={() => fetchUpdates(true)}
        isRefreshing={isRefreshing}
        emptyTitle="No updates found"
        emptyDescription="Start your build log. Document what you're working on and ship notes publicly."
        emptyActionLabel="Write First Update"
        emptyActionIcon={<Plus size={14} />}
        onEmptyAction={() => {
          window.location.href = "/admin/updates/new";
        }}
        renderMobileCard={(u) => (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[10px] text-text-muted">
                  {new Date(u.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
                <AdminBadge variant={u.published ? "published" : "draft"} dot>
                  {u.published ? "Published" : "Draft"}
                </AdminBadge>
              </div>

              <Link
                href={`/admin/updates/${u._id}/edit`}
                className="font-clash font-semibold text-text-primary hover:text-primary transition-colors text-sm truncate block pt-0.5"
              >
                {u.title}
              </Link>

              {u.summary && (
                <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                  {u.summary}
                </p>
              )}
            </div>

            <AdminRowActions
              editHref={`/admin/updates/${u._id}/edit`}
              previewHref={u.slug ? `/updates/${u.slug}` : undefined}
              isPublished={u.published}
              onTogglePublish={() => handleTogglePublish(u)}
              onDelete={() => requestDelete(u._id, u.title)}
            />
          </div>
        )}
      />
    </div>
  );
}
