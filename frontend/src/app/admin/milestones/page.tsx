"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { milestonesApi } from "@/lib/api";
import { Milestone } from "@/types";
import { Plus, Filter, ChevronDown, Flag, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { AdminBadge } from "@/components/admin/ui/AdminBadge";
import { AdminDataTable } from "@/components/admin/ui/AdminDataTable";
import { AdminRowActions } from "@/components/admin/ui/AdminRowActions";

export default function AdminMilestonesPage() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pendingTitle, setPendingTitle] = useState("");

  const fetchMilestones = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const res = await milestonesApi.getAllAdmin();
      setMilestones(res.data.data || []);
    } catch {
      toast.error("Failed to fetch milestones");
    } finally {
      setIsLoading(false);
      if (isManualRefresh) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  const requestDelete = (id: string, title: string) => {
    setPendingId(id);
    setPendingTitle(title);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!pendingId) return;
    setConfirmLoading(true);
    try {
      await milestonesApi.delete(pendingId);
      toast.success("Milestone deleted");
      fetchMilestones();
    } catch {
      toast.error("Failed to delete milestone");
    } finally {
      setConfirmLoading(false);
      setPendingId(null);
      setPendingTitle("");
    }
  };

  const handleTogglePublish = async (m: Milestone) => {
    try {
      await milestonesApi.update(m._id, { published: !m.published });
      toast.success(m.published ? "Milestone hidden" : "Milestone published");
      setMilestones((prev) =>
        prev.map((item) =>
          item._id === m._id ? { ...item, published: !item.published } : item
        )
      );
    } catch {
      toast.error("Failed to update milestone");
    }
  };

  const filteredData = useMemo(() => {
    return milestones.filter((m) => {
      if (statusFilter !== "all" && m.status !== statusFilter) return false;
      return true;
    });
  }, [milestones, statusFilter]);

  const columns = useMemo<ColumnDef<Milestone>[]>(() => [
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
      accessorKey: "title",
      header: "Milestone",
      cell: ({ row }) => {
        const m = row.original;
        return (
          <div className="min-w-[220px] space-y-0.5">
            <Link
              href={`/admin/milestones/${m._id}/edit`}
              className="font-clash font-semibold text-text-primary hover:text-primary transition-colors text-[13px] truncate block"
            >
              {m.title}
            </Link>
            {m.description && (
              <p className="text-[11px] text-text-muted line-clamp-1 leading-tight">
                {m.description}
              </p>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <AdminBadge variant={row.original.status as any} dot>
          {row.original.status}
        </AdminBadge>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <span className="text-text-secondary font-mono text-[11px] capitalize">
          {row.original.category || "—"}
        </span>
      ),
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        if (!row.original.date) return <span className="text-text-muted font-mono text-[11px]">—</span>;
        const date = new Date(row.original.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        return <span className="text-text-muted font-mono text-[11px]">{date}</span>;
      },
    },
    {
      accessorKey: "order",
      header: "Order",
      cell: ({ row }) => (
        <span className="font-mono text-[11px] text-text-muted">
          #{row.original.order}
        </span>
      ),
    },
    {
      accessorKey: "published",
      header: "Visibility",
      cell: ({ row }) => (
        <AdminBadge variant={row.original.published ? "published" : "draft"}>
          {row.original.published ? "Live" : "Draft"}
        </AdminBadge>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const m = row.original;
        return (
          <div className="text-right">
            <AdminRowActions
              editHref={`/admin/milestones/${m._id}/edit`}
              previewHref="/milestones"
              isPublished={m.published}
              onTogglePublish={() => handleTogglePublish(m)}
              onDelete={() => requestDelete(m._id, m.title)}
            />
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ], []);

  const filterControls = (
    <div className="flex items-center gap-2 h-9 px-3 bg-white/[0.03] border border-border/70 rounded-lg hover:border-white/[0.15] focus-within:border-primary/50 transition-colors shrink-0">
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
        <option value="completed">Completed</option>
        <option value="in-progress">In Progress</option>
        <option value="planned">Planned</option>
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
        title="Delete milestone?"
        description={`"${pendingTitle}" will be permanently deleted.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        isLoading={confirmLoading}
      />

      {/* ── Standardized Header ───────────────────────────────── */}
      <AdminPageHeader
        eyebrow="02 / CONTENT"
        title="Key Milestones"
        stats={`${milestones.length} Milestones · ${milestones.filter((m) => m.published).length} Live · ${milestones.filter((m) => !m.published).length} Drafts`}
        description="Key engineering, education, and career milestones tracked across your timeline."
        actions={
          <Link href="/admin/milestones/new">
            <AdminButton variant="primary" icon={<Plus size={15} />}>
              New Milestone
            </AdminButton>
          </Link>
        }
      />

      {/* ── TanStack Admin Data Table ─────────────────────────── */}
      <AdminDataTable
        columns={columns}
        data={filteredData}
        isLoading={isLoading}
        searchPlaceholder="Search milestones by title, category…"
        filterControls={filterControls}
        enableSelection={true}
        enableColumnVisibility={true}
        enablePagination={true}
        pageSize={25}
        onRefresh={() => fetchMilestones(true)}
        isRefreshing={isRefreshing}
        emptyTitle="No milestones found"
        emptyDescription="Define the key milestones and achievements you're working toward."
        emptyActionLabel="Add Milestone"
        emptyActionIcon={<Plus size={14} />}
        onEmptyAction={() => {
          window.location.href = "/admin/milestones/new";
        }}
        renderMobileCard={(m) => (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <AdminBadge variant={m.status as any} dot>
                  {m.status}
                </AdminBadge>
                {m.category && (
                  <span className="text-[10px] font-mono text-text-muted capitalize">
                    {m.category}
                  </span>
                )}
                <AdminBadge variant={m.published ? "published" : "draft"}>
                  {m.published ? "Live" : "Draft"}
                </AdminBadge>
              </div>

              <Link
                href={`/admin/milestones/${m._id}/edit`}
                className="font-clash font-semibold text-text-primary hover:text-primary transition-colors text-sm truncate block pt-0.5"
              >
                {m.title}
              </Link>

              {m.description && (
                <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                  {m.description}
                </p>
              )}
            </div>

            <AdminRowActions
              editHref={`/admin/milestones/${m._id}/edit`}
              previewHref="/milestones"
              isPublished={m.published}
              onTogglePublish={() => handleTogglePublish(m)}
              onDelete={() => requestDelete(m._id, m.title)}
            />
          </div>
        )}
      />
    </div>
  );
}
