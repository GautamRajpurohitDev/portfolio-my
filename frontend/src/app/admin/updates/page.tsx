"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { updatesApi } from "@/lib/api";
import { Update } from "@/types";
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

export default function AdminUpdatesPage() {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Delete modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pendingTitle, setPendingTitle] = useState("");
  const [confirmLoading, setConfirmLoading] = useState(false);

  const fetchUpdates = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    try {
      const res = await updatesApi.getAllAdmin();
      setUpdates(res.data.data || []);
    } catch {
      toast.error("Failed to load updates");
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
      setUpdates((prev) => prev.filter((u) => u._id !== pendingId));
      setConfirmOpen(false);
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
      toast.success(u.published ? "Update set to draft" : "Update published live");
      setUpdates((prev) =>
        prev.map((item) =>
          item._id === u._id ? { ...item, published: !item.published } : item
        )
      );
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDuplicate = async (u: Update) => {
    try {
      const copyPayload = {
        ...u,
        _id: undefined,
        title: `${u.title} (Copy)`,
        published: false,
      };
      await updatesApi.create(copyPayload);
      toast.success("Update duplicated as draft");
      fetchUpdates(true);
    } catch {
      toast.error("Failed to duplicate update");
    }
  };

  const handleBulkPublish = async (selected: Update[]) => {
    try {
      await Promise.all(selected.map((u) => updatesApi.update(u._id, { published: true })));
      toast.success(`Published ${selected.length} updates`);
      fetchUpdates(true);
    } catch {
      toast.error("Failed to publish selected updates");
    }
  };

  const handleBulkUnpublish = async (selected: Update[]) => {
    try {
      await Promise.all(selected.map((u) => updatesApi.update(u._id, { published: false })));
      toast.success(`Unpublished ${selected.length} updates`);
      fetchUpdates(true);
    } catch {
      toast.error("Failed to unpublish selected updates");
    }
  };

  const handleBulkDelete = async (selected: Update[]) => {
    if (!confirm(`Permanently delete ${selected.length} selected updates?`)) return;
    try {
      await Promise.all(selected.map((u) => updatesApi.delete(u._id)));
      toast.success(`Deleted ${selected.length} updates`);
      fetchUpdates(true);
    } catch {
      toast.error("Failed to delete selected updates");
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
      accessorKey: "title",
      header: "Update Title",
      cell: ({ row }) => {
        const u = row.original;
        return (
          <div className="flex items-center gap-3 min-w-[220px]">
            {u.coverImage && (
              <div className="w-8 h-8 rounded-md bg-white/[0.04] border border-white/[0.08] flex-shrink-0 overflow-hidden">
                <img src={u.coverImage} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="min-w-0 space-y-0.5">
              <Link
                href={`/admin/updates/${u._id}/edit`}
                className="font-clash font-semibold text-text-primary hover:text-primary transition-colors text-[13px] truncate block"
              >
                {u.title}
              </Link>
              {u.summary && (
                <p className="text-[11px] text-text-muted truncate max-w-sm font-body leading-tight">
                  {u.summary}
                </p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "tags",
      header: "Tags",
      cell: ({ row }) => {
        const tags = row.original.tags || [];
        return (
          <div className="flex items-center gap-1 flex-wrap max-w-[200px]">
            {tags.slice(0, 2).map((t) => (
              <span
                key={t}
                className="text-[10px] font-mono text-text-secondary bg-white/[0.03] px-1.5 py-0.5 rounded border border-white/[0.06]"
              >
                #{t}
              </span>
            ))}
            {tags.length > 2 && (
              <span className="text-[10px] font-mono text-text-muted">
                +{tags.length - 2}
              </span>
            )}
          </div>
        );
      },
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
        const u = row.original;
        return (
          <div className="text-right">
            <AdminRowActions
              editHref={`/admin/updates/${u._id}/edit`}
              isPublished={u.published}
              onTogglePublish={() => handleTogglePublish(u)}
              onDuplicate={() => handleDuplicate(u)}
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
  );

  return (
    <div className="space-y-6 pb-14">
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete build log update?"
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
        description="Public engineering announcements, changelogs, architecture shifts, and dev milestones."
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
        searchPlaceholder="Search updates by title, summary…"
        filterControls={filterControls}
        enableSelection={true}
        onBulkPublish={handleBulkPublish}
        onBulkUnpublish={handleBulkUnpublish}
        onBulkDelete={handleBulkDelete}
        enableColumnVisibility={true}
        enablePagination={true}
        pageSize={25}
        onRefresh={() => fetchUpdates(true)}
        isRefreshing={isRefreshing}
        emptyTitle="No updates found"
        emptyDescription="Write your first changelog update to publish your building progress."
        emptyActionLabel="Create Update"
        emptyActionIcon={<Plus size={14} />}
        onEmptyAction={() => {
          window.location.href = "/admin/updates/new";
        }}
        renderMobileCard={(u) => (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <AdminBadge variant={u.published ? "published" : "draft"}>
                  {u.published ? "Live" : "Draft"}
                </AdminBadge>
                <span className="text-[11px] font-mono text-text-muted">
                  {new Date(u.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>

              <Link
                href={`/admin/updates/${u._id}/edit`}
                className="font-clash font-semibold text-text-primary hover:text-primary transition-colors text-sm truncate block pt-0.5"
              >
                {u.title}
              </Link>

              {u.tags && u.tags.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap pt-0.5">
                  {u.tags.map((t) => (
                    <span key={t} className="text-[10px] font-mono text-text-muted">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <AdminRowActions
              editHref={`/admin/updates/${u._id}/edit`}
              isPublished={u.published}
              onTogglePublish={() => handleTogglePublish(u)}
              onDuplicate={() => handleDuplicate(u)}
              onDelete={() => requestDelete(u._id, u.title)}
            />
          </div>
        )}
      />
    </div>
  );
}
